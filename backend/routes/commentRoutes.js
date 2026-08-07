import express from 'express';
import Comment, { REACTION_TYPES } from '../models/Comment.js';
import Discussion from '../models/Discussion.js';
import Notification from '../models/Notification.js';
// Commenting requires login; moderation (highlight/best/delete-any) requires admin.
import { protect, adminOnly } from '../middleware/auth.js';
// Reuse the existing upload pipeline for optional comment images.
import { upload, uploadToCloudinary } from '../middleware/upload.js';
import cloudinary from '../config/cloudinary.js';

const router = express.Router();

// Fields we always want when sending a comment back to the frontend.
const POPULATE = [
  { path: 'user', select: 'name avatarUrl role' },
  { path: 'mentions', select: 'name' }
];

// --- ROUTE 1: GET ALL COMMENTS OF A DISCUSSION (Public) ---
// GET /api/comments/discussion/:discussionId
// Returns a FLAT list (oldest first). The frontend builds the nested tree from
// each comment's 'parentComment' pointer — that's what makes unlimited nesting cheap.
router.get('/discussion/:discussionId', async (req, res) => {
  try {
    const comments = await Comment.find({ discussion: req.params.discussionId })
      .sort({ createdAt: 1 })
      .populate(POPULATE);

    res.json(comments);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching comments', error: error.message });
  }
});

// --- ROUTE 2: CREATE A COMMENT OR REPLY (Protected) ---
// POST /api/comments
// Citizens (and admins) can comment on OPEN discussions. Sending 'parentCommentId'
// makes it a reply. Mentioned users and the parent author get notifications.
router.post('/', protect, upload.single('image'), async (req, res) => {
  try {
    const { discussionId, comment, parentCommentId, mentions } = req.body;

    if (!comment || !comment.trim()) {
      return res.status(400).json({ message: 'Comment text is required' });
    }

    // 1. The discussion must exist AND be open — closed discussions are read-only.
    const discussion = await Discussion.findById(discussionId);
    if (!discussion) return res.status(404).json({ message: 'Discussion not found' });
    if (discussion.status === 'Closed') {
      return res.status(403).json({ message: 'This discussion is closed — no new comments allowed' });
    }

    // 2. If this is a reply, the parent must exist and belong to the SAME discussion.
    let parent = null;
    if (parentCommentId) {
      parent = await Comment.findById(parentCommentId);
      if (!parent || parent.discussion.toString() !== discussion._id.toString()) {
        return res.status(400).json({ message: 'Invalid parent comment' });
      }
    }

    // 3. Mentions arrive as a JSON array of user IDs from the @-autocomplete.
    let mentionIds = [];
    if (mentions) {
      try { mentionIds = JSON.parse(mentions); } catch (e) { mentionIds = []; }
      if (!Array.isArray(mentionIds)) mentionIds = [];
    }

    const newComment = new Comment({
      discussion: discussion._id,
      user: req.user._id,
      comment: comment.trim(),
      parentComment: parent ? parent._id : null,
      mentions: mentionIds
    });

    // 4. Upload the optional image (same Cloudinary flow as reports).
    if (req.file) {
      const result = await uploadToCloudinary(req.file.buffer, 'nagarbondhu/comments');
      if (result) newComment.image = { url: result.url, publicId: result.publicId };
    }

    const saved = await newComment.save();

    // 5. Keep the discussion's denormalized counter in sync for sorting.
    discussion.commentCount += 1;
    await discussion.save();

    // 6. Send notifications — but never notify someone about their own action,
    // and don't notify the parent author twice if they were also mentioned.
    const notified = new Set([req.user._id.toString()]);
    const notifications = [];

    if (parent && !notified.has(parent.user.toString())) {
      notified.add(parent.user.toString());
      notifications.push({
        recipient: parent.user,
        sender: req.user._id,
        type: 'reply',
        message: `${req.user.name} replied to your comment in "${discussion.title}"`,
        link: `/discussions/${discussion._id}`,
        discussion: discussion._id,
        comment: saved._id
      });
    }

    for (const userId of mentionIds) {
      if (!notified.has(userId.toString())) {
        notified.add(userId.toString());
        notifications.push({
          recipient: userId,
          sender: req.user._id,
          type: 'mention',
          message: `${req.user.name} mentioned you in "${discussion.title}"`,
          link: `/discussions/${discussion._id}`,
          discussion: discussion._id,
          comment: saved._id
        });
      }
    }

    if (notifications.length > 0) await Notification.insertMany(notifications);

    await saved.populate(POPULATE);
    res.status(201).json(saved);
  } catch (error) {
    res.status(500).json({ message: 'Error creating comment', error: error.message });
  }
});

// --- ROUTE 3: EDIT A COMMENT (Protected — Owner Only) ---
// PUT /api/comments/:id
router.put('/:id', protect, async (req, res) => {
  try {
    const existing = await Comment.findById(req.params.id);
    if (!existing) return res.status(404).json({ message: 'Comment not found' });

    // Only the person who wrote the comment may edit it (not even admins —
    // admins moderate by deleting, never by changing someone's words).
    if (existing.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'You can only edit your own comments' });
    }

    const { comment } = req.body;
    if (!comment || !comment.trim()) {
      return res.status(400).json({ message: 'Comment text is required' });
    }

    existing.comment = comment.trim();
    const updated = await existing.save();
    await updated.populate(POPULATE);
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Error updating comment', error: error.message });
  }
});

// --- ROUTE 4: DELETE A COMMENT (Protected — Owner or Admin) ---
// DELETE /api/comments/:id
// Deleting a comment also deletes ALL replies nested under it (the whole subtree),
// so we never show replies to a comment that no longer exists.
router.delete('/:id', protect, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ message: 'Comment not found' });

    // Owners can delete their own comments; admins can delete anyone's.
    const isOwner = comment.user.toString() === req.user._id.toString();
    if (!isOwner && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this comment' });
    }

    // 1. Collect the whole subtree: start with this comment, then repeatedly
    // find children of everything collected so far until no new replies appear.
    const toDelete = [comment._id];
    let frontier = [comment._id];
    while (frontier.length > 0) {
      const children = await Comment.find({ parentComment: { $in: frontier } }).select('_id');
      frontier = children.map((c) => c._id);
      toDelete.push(...frontier);
    }

    // 2. Sum up what we're removing so the discussion counters stay accurate.
    const docs = await Comment.find({ _id: { $in: toDelete } }).select('image reactions');
    const reactionsRemoved = docs.reduce((sum, d) => sum + d.reactions.length, 0);

    // 3. Clean up any attached images on Cloudinary.
    for (const d of docs) {
      if (d.image?.publicId) {
        await cloudinary.uploader.destroy(d.image.publicId).catch(() => {});
      }
    }

    await Comment.deleteMany({ _id: { $in: toDelete } });

    // 4. Update the denormalized counters on the discussion.
    await Discussion.findByIdAndUpdate(comment.discussion, {
      $inc: { commentCount: -toDelete.length, reactionCount: -reactionsRemoved }
    });

    res.json({ message: 'Comment deleted', deletedCount: toDelete.length });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting comment', error: error.message });
  }
});

// --- ROUTE 5: HIGHLIGHT A COMMENT (Admin Only) ---
// PATCH /api/comments/:id/highlight
// Admins highlight valuable comments so they stand out. Toggles on/off.
router.patch('/:id/highlight', protect, adminOnly, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id).populate('discussion', 'title');
    if (!comment) return res.status(404).json({ message: 'Comment not found' });

    comment.isHighlighted = !comment.isHighlighted;
    await comment.save();

    // Tell the author their contribution was recognized (only when turning ON).
    if (comment.isHighlighted && comment.user.toString() !== req.user._id.toString()) {
      await Notification.create({
        recipient: comment.user,
        sender: req.user._id,
        type: 'highlight',
        message: `An official highlighted your comment in "${comment.discussion.title}"`,
        link: `/discussions/${comment.discussion._id}`,
        discussion: comment.discussion._id,
        comment: comment._id
      });
    }

    res.json({ _id: comment._id, isHighlighted: comment.isHighlighted });
  } catch (error) {
    res.status(500).json({ message: 'Error highlighting comment', error: error.message });
  }
});

// --- ROUTE 6: MARK BEST SUGGESTION (Admin Only) ---
// PATCH /api/comments/:id/best
// Only ONE comment per discussion can be the best suggestion, so marking a new
// one automatically unmarks the previous winner. Toggles off if already best.
router.patch('/:id/best', protect, adminOnly, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id).populate('discussion', 'title');
    if (!comment) return res.status(404).json({ message: 'Comment not found' });

    if (comment.isBestSuggestion) {
      // Already the best — toggle it off.
      comment.isBestSuggestion = false;
      await comment.save();
    } else {
      // Unmark any previous best suggestion in this discussion, then crown this one.
      await Comment.updateMany(
        { discussion: comment.discussion._id, isBestSuggestion: true },
        { isBestSuggestion: false }
      );
      comment.isBestSuggestion = true;
      await comment.save();

      // Congratulate the author.
      if (comment.user.toString() !== req.user._id.toString()) {
        await Notification.create({
          recipient: comment.user,
          sender: req.user._id,
          type: 'best_suggestion',
          message: `Your suggestion was marked as the BEST in "${comment.discussion.title}" 🎉`,
          link: `/discussions/${comment.discussion._id}`,
          discussion: comment.discussion._id,
          comment: comment._id
        });
      }
    }

    res.json({ _id: comment._id, isBestSuggestion: comment.isBestSuggestion });
  } catch (error) {
    res.status(500).json({ message: 'Error marking best suggestion', error: error.message });
  }
});

// --- ROUTE 7: REACT TO A COMMENT (Protected) ---
// PATCH /api/comments/:id/react
// Rule: ONE reaction per user per comment.
//  - same type again   → remove the reaction (toggle off)
//  - different type    → switch to the new type
//  - no reaction yet   → add it
router.patch('/:id/react', protect, async (req, res) => {
  try {
    const { type } = req.body;
    if (!REACTION_TYPES.includes(type)) {
      return res.status(400).json({ message: 'Invalid reaction type' });
    }

    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ message: 'Comment not found' });

    const existingIndex = comment.reactions.findIndex(
      (r) => r.user.toString() === req.user._id.toString()
    );

    let countDelta = 0;
    if (existingIndex !== -1 && comment.reactions[existingIndex].type === type) {
      // Same type clicked again → remove the reaction.
      comment.reactions.splice(existingIndex, 1);
      countDelta = -1;
    } else if (existingIndex !== -1) {
      // Different type → switch (total count unchanged).
      comment.reactions[existingIndex].type = type;
    } else {
      // First reaction from this user.
      comment.reactions.push({ user: req.user._id, type });
      countDelta = 1;
    }

    await comment.save();

    // Keep the discussion's reaction counter in sync for "Most Reactions" sorting.
    if (countDelta !== 0) {
      await Discussion.findByIdAndUpdate(comment.discussion, { $inc: { reactionCount: countDelta } });
    }

    res.json({ _id: comment._id, reactions: comment.reactions });
  } catch (error) {
    res.status(500).json({ message: 'Error reacting to comment', error: error.message });
  }
});

export default router;
