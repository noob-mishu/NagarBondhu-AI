import mongoose from 'mongoose';

// This schema defines a "Notification" — a small message stored for a specific user
// so they find out about things that happened while they were away
// (someone replied to them, mentioned them, or an admin highlighted their comment).
const notificationSchema = new mongoose.Schema({
  // 'recipient' is the user who should SEE this notification.
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

  // 'sender' is the user whose action CAUSED it (the replier, mentioner, or admin).
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

  // 'type' tells the frontend which icon/wording to use.
  type: {
    type: String,
    required: true,
    enum: ['reply', 'mention', 'highlight', 'best_suggestion', 'new_discussion', 'new_report', 'report_comment', 'points_awarded']
  },

  // 'message' is the human-readable text shown in the notification list.
  message: { type: String, required: true },

  // 'link' is where clicking the notification should take the user
  // (e.g., "/discussions/6a72...").
  link: { type: String, default: '' },

  // Optional references back to the source, in case we ever need them.
  discussion: { type: mongoose.Schema.Types.ObjectId, ref: 'Discussion' },
  comment: { type: mongoose.Schema.Types.ObjectId, ref: 'Comment' },
  report: { type: mongoose.Schema.Types.ObjectId, ref: 'Report' },

  // 'read' tracks whether the user has seen it yet (drives the bell badge count).
  read: { type: Boolean, default: false },
}, {
  // Automatically adds and maintains 'createdAt' and 'updatedAt'.
  timestamps: true
});

// Index so fetching one user's notifications (newest first) is fast.
notificationSchema.index({ recipient: 1, createdAt: -1 });

// Export the Notification model so routes can create and list notifications.
export default mongoose.model('Notification', notificationSchema);
