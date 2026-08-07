import express from 'express';
import Discussion from '../models/Discussion.js';
import Comment from '../models/Comment.js';
import Notification from '../models/Notification.js';
import Report from '../models/Report.js';
import User from '../models/User.js';
// Only logged-in admins may create/edit/moderate discussions; viewing is public.
import { protect, adminOnly } from '../middleware/auth.js';
// Reuse the existing upload pipeline for cover images.
import { upload, uploadToCloudinary } from '../middleware/upload.js';
import cloudinary from '../config/cloudinary.js';

const router = express.Router();

// Small helper: FormData sends tags as a JSON string (or comma list) — turn it into a clean array.
const parseTags = (raw) => {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed.map((t) => String(t).trim()).filter(Boolean);
  } catch (e) { /* not JSON — fall through to comma splitting */ }
  return String(raw).split(',').map((t) => t.trim()).filter(Boolean);
};

// Small helper: FormData sends the poll as a JSON string like
// { "question": "...", "options": ["Option A", "Option B"] }.
// Returns a clean poll object, null for "no/remove poll", or throws on bad input.
const parsePoll = (raw) => {
  if (raw === undefined || raw === null || raw === '' || raw === 'null') return null;
  let parsed;
  try {
    parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
  } catch (e) {
    throw new Error('Poll must be valid JSON');
  }
  const question = String(parsed?.question || '').trim();
  const options = Array.isArray(parsed?.options)
    ? parsed.options.map((o) => String(o).trim()).filter(Boolean)
    : [];
  if (!question) throw new Error('Poll question is required');
  if (options.length < 2) throw new Error('A poll needs at least 2 options');
  return { question, options };
};

// --- ROUTE 1: LIST DISCUSSIONS (Public) ---
// GET /api/discussions?search=&category=&status=&pinned=&sort=&page=&limit=
// Powers the hub page: search bar, category filter, sort dropdown, and the
// pinned / recent / trending sections (each section is just a different query).
router.get('/', async (req, res) => {
  try {
    const { search, category, status, pinned, sort = 'latest', limit = 10, page = 1 } = req.query;

    // 1. Build the filter from whichever query params were provided.
    const filter = {};
    if (category) filter.category = category;
    if (status) filter.status = status;
    if (pinned === 'true') filter.isPinned = true;
    if (search) {
      // Match the search text against title, description, or tags, case-insensitively.
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (page - 1) * limit;
    let discussions;

    if (sort === 'trending') {
      // 2a. "Trending" ranks by total engagement (comments + reactions).
      // We need $addFields to sort by a SUM, so this one uses an aggregation.
      discussions = await Discussion.aggregate([
        { $match: filter },
        { $addFields: { engagement: { $add: ['$commentCount', '$reactionCount'] } } },
        { $sort: { engagement: -1, createdAt: -1 } },
        { $skip: skip },
        { $limit: Number(limit) }
      ]);
      // Aggregations return plain objects, so we populate the author afterwards.
      discussions = await Discussion.populate(discussions, { path: 'createdBy', select: 'name avatarUrl role' });
    } else {
      // 2b. The simple sorts map straight onto indexed fields.
      const sortMap = {
        latest: { createdAt: -1 },
        commented: { commentCount: -1, createdAt: -1 },
        reactions: { reactionCount: -1, createdAt: -1 }
      };
      discussions = await Discussion.find(filter)
        .sort(sortMap[sort] || sortMap.latest)
        .skip(skip)
        .limit(Number(limit))
        .populate('createdBy', 'name avatarUrl role');
    }

    const total = await Discussion.countDocuments(filter);

    res.json({
      discussions,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit)
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching discussions', error: error.message });
  }
});

// --- ROUTE 2: GET A SINGLE DISCUSSION (Public) ---
// GET /api/discussions/:id
router.get('/:id', async (req, res) => {
  try {
    const discussion = await Discussion.findById(req.params.id)
      .populate('createdBy', 'name avatarUrl role')
      .populate('report', 'title status location');

    if (!discussion) return res.status(404).json({ message: 'Discussion not found' });

    res.json(discussion);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching discussion', error: error.message });
  }
});

// --- ROUTE 3: CREATE A DISCUSSION (Admin Only) ---
// POST /api/discussions
// Only admins can start official discussions. When one is created, EVERY citizen
// gets a notification inviting them to share their suggestions.
router.post('/', protect, adminOnly, upload.single('coverImage'), async (req, res) => {
  try {
    const { title, description, category, tags, location, reportId, poll } = req.body;

    // 1. Validate the required fields before touching Cloudinary.
    if (!title || !description) {
      return res.status(400).json({ message: 'Title and description are required' });
    }
    const validCategories = Discussion.schema.path('category').enumValues;
    if (!validCategories.includes(category)) {
      return res.status(400).json({ message: 'Invalid category' });
    }

    // Validate the optional poll before creating anything.
    let parsedPoll;
    try {
      parsedPoll = parsePoll(poll);
    } catch (e) {
      return res.status(400).json({ message: e.message });
    }

    // 2. If linked to a report, make sure that report exists.
    if (reportId) {
      const report = await Report.findById(reportId);
      if (!report) return res.status(404).json({ message: 'Linked report not found' });
    }

    const discussion = new Discussion({
      title,
      description,
      category,
      tags: parseTags(tags),
      location: location || '',
      report: reportId || undefined,
      createdBy: req.user._id,
      poll: parsedPoll
        ? { question: parsedPoll.question, options: parsedPoll.options.map((text) => ({ text, votes: [] })) }
        : undefined
    });

    // 3. Upload the optional cover image to Cloudinary (same flow as report images).
    if (req.file) {
      const result = await uploadToCloudinary(req.file.buffer, 'nagarbondhu/discussions');
      if (result) discussion.coverImage = { url: result.url, publicId: result.publicId };
    }

    const saved = await discussion.save();

    // 4. Notify all citizens that a new official discussion is open for suggestions.
    // insertMany creates one notification document per citizen in a single DB call.
    const citizens = await User.find({ role: 'citizen' }).select('_id');
    if (citizens.length > 0) {
      await Notification.insertMany(citizens.map((c) => ({
        recipient: c._id,
        sender: req.user._id,
        type: 'new_discussion',
        message: `New official discussion: "${saved.title}" — share your suggestions!`,
        link: `/discussions/${saved._id}`,
        discussion: saved._id
      })));
    }

    await saved.populate('createdBy', 'name avatarUrl role');
    res.status(201).json(saved);
  } catch (error) {
    res.status(500).json({ message: 'Error creating discussion', error: error.message });
  }
});

// --- ROUTE 4: EDIT A DISCUSSION (Admin Only) ---
// PUT /api/discussions/:id
router.put('/:id', protect, adminOnly, upload.single('coverImage'), async (req, res) => {
  try {
    const discussion = await Discussion.findById(req.params.id);
    if (!discussion) return res.status(404).json({ message: 'Discussion not found' });

    const { title, description, category, tags, location } = req.body;

    // Only update fields that were actually sent, validating enums as we go.
    if (title) discussion.title = title;
    if (description) discussion.description = description;
    if (category) {
      const validCategories = Discussion.schema.path('category').enumValues;
      if (!validCategories.includes(category)) {
        return res.status(400).json({ message: 'Invalid category' });
      }
      discussion.category = category;
    }
    if (tags !== undefined) discussion.tags = parseTags(tags);
    if (location !== undefined) discussion.location = location;

    // Update / remove the poll if the field was sent ('' or 'null' means remove).
    // Existing votes are kept for options whose text didn't change, so a small
    // typo fix doesn't wipe out everyone's votes.
    if (req.body.poll !== undefined) {
      let parsedPoll;
      try {
        parsedPoll = parsePoll(req.body.poll);
      } catch (e) {
        return res.status(400).json({ message: e.message });
      }
      if (!parsedPoll) {
        discussion.poll = undefined;
      } else {
        const oldOptions = discussion.poll?.options || [];
        discussion.poll = {
          question: parsedPoll.question,
          options: parsedPoll.options.map((text) => ({
            text,
            votes: oldOptions.find((o) => o.text === text)?.votes || []
          }))
        };
      }
    }

    // If a new cover image was uploaded, replace the old one (and clean it up on Cloudinary).
    if (req.file) {
      if (discussion.coverImage?.publicId) {
        await cloudinary.uploader.destroy(discussion.coverImage.publicId).catch(() => {});
      }
      const result = await uploadToCloudinary(req.file.buffer, 'nagarbondhu/discussions');
      if (result) discussion.coverImage = { url: result.url, publicId: result.publicId };
    }

    const updated = await discussion.save();
    await updated.populate('createdBy', 'name avatarUrl role');
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Error updating discussion', error: error.message });
  }
});

// --- ROUTE 5: DELETE A DISCUSSION (Admin Only) ---
// DELETE /api/discussions/:id
// Deleting a discussion also removes its comments, their images, and related notifications
// so we never leave orphaned data behind.
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    const discussion = await Discussion.findById(req.params.id);
    if (!discussion) return res.status(404).json({ message: 'Discussion not found' });

    // 1. Clean up Cloudinary images (cover + any comment images).
    if (discussion.coverImage?.publicId) {
      await cloudinary.uploader.destroy(discussion.coverImage.publicId).catch(() => {});
    }
    const comments = await Comment.find({ discussion: discussion._id }).select('image');
    for (const c of comments) {
      if (c.image?.publicId) {
        await cloudinary.uploader.destroy(c.image.publicId).catch(() => {});
      }
    }

    // 2. Remove the comments, notifications, and finally the discussion itself.
    await Comment.deleteMany({ discussion: discussion._id });
    await Notification.deleteMany({ discussion: discussion._id });
    await discussion.deleteOne();

    res.json({ message: 'Discussion deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting discussion', error: error.message });
  }
});

// --- ROUTE 6: PIN / UNPIN A DISCUSSION (Admin Only) ---
// PATCH /api/discussions/:id/pin
router.patch('/:id/pin', protect, adminOnly, async (req, res) => {
  try {
    const discussion = await Discussion.findById(req.params.id);
    if (!discussion) return res.status(404).json({ message: 'Discussion not found' });

    // Simply flip the flag: pinned becomes unpinned and vice versa.
    discussion.isPinned = !discussion.isPinned;
    await discussion.save();

    res.json({ _id: discussion._id, isPinned: discussion.isPinned });
  } catch (error) {
    res.status(500).json({ message: 'Error pinning discussion', error: error.message });
  }
});

// --- ROUTE 7: OPEN / CLOSE A DISCUSSION (Admin Only) ---
// PATCH /api/discussions/:id/status
// Closing keeps all existing comments visible but blocks new ones (enforced in commentRoutes).
router.patch('/:id/status', protect, adminOnly, async (req, res) => {
  try {
    const { status } = req.body;
    if (!['Open', 'Closed'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const discussion = await Discussion.findById(req.params.id);
    if (!discussion) return res.status(404).json({ message: 'Discussion not found' });

    discussion.status = status;
    await discussion.save();

    res.json({ _id: discussion._id, status: discussion.status });
  } catch (error) {
    res.status(500).json({ message: 'Error updating discussion status', error: error.message });
  }
});

// --- ROUTE 8: VOTE ON A DISCUSSION'S POLL (Logged-in users) ---
// PATCH /api/discussions/:id/poll/vote   body: { optionIndex }
// One vote per user. Voting again on the same option retracts the vote;
// voting on a different option moves the vote there.
router.patch('/:id/poll/vote', protect, async (req, res) => {
  try {
    const { optionIndex } = req.body;

    const discussion = await Discussion.findById(req.params.id);
    if (!discussion) return res.status(404).json({ message: 'Discussion not found' });
    if (!discussion.poll) return res.status(400).json({ message: 'This discussion has no poll' });
    if (discussion.status === 'Closed') {
      return res.status(400).json({ message: 'This discussion is closed — voting is disabled' });
    }

    const idx = Number(optionIndex);
    if (!Number.isInteger(idx) || idx < 0 || idx >= discussion.poll.options.length) {
      return res.status(400).json({ message: 'Invalid poll option' });
    }

    const userId = req.user._id.toString();
    const alreadyVotedThis = discussion.poll.options[idx].votes.some((v) => v.toString() === userId);

    // Remove the user's vote from every option first (one vote per user).
    discussion.poll.options.forEach((option) => {
      option.votes = option.votes.filter((v) => v.toString() !== userId);
    });

    // If they clicked a NEW option, add the vote there. (Same option = retract.)
    if (!alreadyVotedThis) {
      discussion.poll.options[idx].votes.push(req.user._id);
    }

    await discussion.save();
    res.json({ _id: discussion._id, poll: discussion.poll });
  } catch (error) {
    res.status(500).json({ message: 'Error voting on poll', error: error.message });
  }
});

export default router;
