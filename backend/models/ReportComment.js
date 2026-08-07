import mongoose from 'mongoose';

// This schema defines a comment on a citizen REPORT (the Community Feed).
// It is intentionally simpler than the Discussion comment system:
// a flat list of messages under each report — no nesting, no images.
const reportCommentSchema = new mongoose.Schema({
  // 'report' links this comment to the report it belongs to.
  report: { type: mongoose.Schema.Types.ObjectId, ref: 'Report', required: true },

  // 'user' is the person who wrote the comment.
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

  // 'comment' is the message text itself.
  comment: { type: String, required: true, trim: true },
}, {
  // Automatically adds and maintains 'createdAt' and 'updatedAt'.
  timestamps: true
});

// Index so loading all comments of a report (the most common query) is fast.
reportCommentSchema.index({ report: 1, createdAt: 1 });

// Export the model so reportRoutes can create, list, and delete report comments.
export default mongoose.model('ReportComment', reportCommentSchema);
