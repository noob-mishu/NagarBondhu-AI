import mongoose from 'mongoose';

// A poll option: the choice text plus the list of users who picked it.
// Storing voter IDs (instead of a bare count) lets us enforce one vote per user
// and show each user which option they chose.
const pollOptionSchema = new mongoose.Schema({
  text: { type: String, required: true, trim: true },
  votes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
}, { _id: false });

// An optional poll an admin can attach to a discussion (e.g., "Which bus route
// do you prefer?"). 'default: undefined' keeps discussions without a poll clean —
// otherwise Mongoose would save an empty { options: [] } object on every document.
const pollSchema = new mongoose.Schema({
  question: { type: String, required: true, trim: true },
  options: [pollOptionSchema]
}, { _id: false });

// This schema defines a "Discussion" — an official forum topic created by an ADMIN
// so authorities can collect suggestions and opinions from citizens.
// (This is different from the Community Feed, where citizens report civic issues.)
const discussionSchema = new mongoose.Schema({
  // 'title' is the headline of the discussion (e.g., "New bus routes for Mirpur — your ideas?").
  title: { type: String, required: true, trim: true },

  // 'description' explains what the authority wants feedback on.
  description: { type: String, required: true },

  // 'coverImage' is an optional banner image, stored on Cloudinary just like report images.
  coverImage: { url: String, publicId: String },

  // 'category' groups discussions. It mirrors the report categories so the whole
  // platform speaks the same language.
  category: {
    type: String,
    required: true,
    enum: ['Infrastructure', 'Waste Management', 'Utilities', 'Safety', 'Transportation', 'Environment', 'Other']
  },

  // 'tags' are free-form keywords admins add for search/filtering (e.g., ["budget", "ward-12"]).
  tags: [{ type: String, trim: true }],

  // 'location' is optional — some discussions are city-wide, others are about one area.
  location: { type: String, default: '' },

  // 'createdBy' stores which admin created this discussion. Only admins can create them.
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

  // 'report' optionally links this discussion back to the citizen report that inspired it
  // (used by the Admin Dashboard "Assign Discussion" flow).
  report: { type: mongoose.Schema.Types.ObjectId, ref: 'Report' },

  // 'status' controls participation:
  //  - 'Open'   → citizens can comment
  //  - 'Closed' → comments stay visible, but no new comments are accepted
  status: { type: String, enum: ['Open', 'Closed'], default: 'Open' },

  // 'isPinned' lets admins feature important discussions at the top of the page.
  isPinned: { type: Boolean, default: false },

  // 'poll' is an optional admin-created poll citizens can vote on (see pollSchema above).
  poll: { type: pollSchema, default: undefined },

  // Denormalized counters (same pattern as 'upvoteCount' on Report):
  // we keep running totals here so we can sort by "Most Commented" / "Most Reactions"
  // without counting thousands of comment documents on every request.
  commentCount: { type: Number, default: 0 },
  reactionCount: { type: Number, default: 0 },
}, {
  // 'timestamps: true' automatically adds and maintains 'createdAt' and 'updatedAt'.
  timestamps: true
});

// Index to make the main listing query fast: pinned first, then newest.
discussionSchema.index({ isPinned: -1, createdAt: -1 });

// Export the Discussion model so routes can create, search, and moderate discussions.
export default mongoose.model('Discussion', discussionSchema);
