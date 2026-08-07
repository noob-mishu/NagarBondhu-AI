import mongoose from 'mongoose';

// The four reaction types citizens can give a comment.
// Kept in one exported constant so routes and the schema always agree.
export const REACTION_TYPES = ['Like', 'Support', 'Helpful', 'Great Idea'];

// This schema defines a "Comment" — a citizen's (or admin's) message inside a Discussion.
// Comments form a TREE: a comment with no 'parentComment' is a top-level comment,
// and a comment whose 'parentComment' points to another comment is a reply.
// Because every reply just points at its parent, nesting can go infinitely deep.
const commentSchema = new mongoose.Schema({
  // 'discussion' links this comment to the discussion it belongs to.
  discussion: { type: mongoose.Schema.Types.ObjectId, ref: 'Discussion', required: true },

  // 'user' is the person who wrote the comment.
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

  // 'comment' is the message text itself.
  comment: { type: String, required: true, trim: true },

  // 'image' is an optional attached photo, stored on Cloudinary.
  image: { url: String, publicId: String },

  // 'parentComment' makes the nesting work:
  //  - null      → this is a top-level comment on the discussion
  //  - some ID   → this is a reply to that comment
  parentComment: { type: mongoose.Schema.Types.ObjectId, ref: 'Comment', default: null },

  // 'reactions' records exactly who reacted and how.
  // Rule: ONE reaction per user per comment — reacting again with a different type
  // switches it, reacting with the same type removes it (handled in the route).
  reactions: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, enum: REACTION_TYPES, required: true }
  }],

  // 'mentions' stores the IDs of users tagged with @name, so we can notify them.
  mentions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],

  // 'isHighlighted' — admins can highlight valuable comments so they stand out.
  isHighlighted: { type: Boolean, default: false },

  // 'isBestSuggestion' — admins can mark ONE comment per discussion as the best
  // suggestion (the route unmarks any previous one when a new one is chosen).
  isBestSuggestion: { type: Boolean, default: false },
}, {
  // Automatically adds and maintains 'createdAt' and 'updatedAt'.
  timestamps: true
});

// Index so loading all comments of a discussion (the most common query) is fast.
commentSchema.index({ discussion: 1, createdAt: 1 });

// Export the Comment model so routes can create, moderate, and react to comments.
export default mongoose.model('Comment', commentSchema);
