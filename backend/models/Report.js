import mongoose from 'mongoose';

// This schema defines how a "Report" (a civic issue reported by a citizen) looks in our database.
const reportSchema = new mongoose.Schema({
  // 'title' is a short, descriptive name for the issue (e.g., "Pothole on Main St").
  title: { type: String, required: true, trim: true },
  
  // 'description' gives full details about the issue.
  description: { type: String, required: true },
  
  // 'category' helps group issues. The value MUST be one of the strings listed in the enum array.
  category: { 
    type: String, 
    required: true, 
    enum: ['Infrastructure', 'Waste Management', 'Utilities', 'Safety', 'Transportation', 'Environment', 'Other'] 
  },
  
  // 'location' stores where the issue is. This could be an address or a ward number.
  location: { type: String, required: true },
  
  // 'status' tracks the progress of the report. Default is always 'Pending' when first created.
  status: { 
    type: String, 
    enum: ['Pending', 'Under Review', 'In Progress', 'Resolved', 'Rejected'], 
    default: 'Pending' 
  },
  
  // 'reporter' is a special field. It stores the unique ID (ObjectId) of the User who created the report.
  // The "ref: 'User'" tells Mongoose that this ID belongs to the User model, so we can easily get the user's name later.
  reporter: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  
  // 'upvotes' is an array of User IDs. It keeps track of exactly who upvoted this report.
  upvotes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  
  // 'upvoteCount' is just a quick number to show how many upvotes we have, so we don't have to count the array every time.
  upvoteCount: { type: Number, default: 0 },

  // 'commentCount' is the same idea for comments (see models/ReportComment.js) —
  // a running total so the feed can show counts without querying comments per report.
  commentCount: { type: Number, default: 0 },
  
  // 'images' is an array of objects. Each object stores the URL of the image and its ID on Cloudinary.
  images: [{ url: String, publicId: String }],

  // 'resolutionPointsAwarded' guards the resolve bonus: the reporter earns bonus
  // points only ONCE, even if an admin flips the status away from and back to 'Resolved'.
  resolutionPointsAwarded: { type: Boolean, default: false },
  
  // 'createdAt' automatically saves the exact time the report was submitted.
  createdAt: { type: Date, default: Date.now },
  
  // 'aiAnalysis' stores the results of Gemini's analysis of the report (image and/or text)
  aiAnalysis: {
    verifiedCategory: { type: String }, // What category the AI thinks it is
    severity: { type: String, enum: ['High', 'Medium', 'Low', 'Unknown'], default: 'Unknown' },
    severityScore: { type: Number, min: 0, max: 100 }, // AI-assigned severity score (0-100)
    summary: { type: String }, // A short AI-generated summary of the issue
    analysisStatus: { type: String, enum: ['completed', 'failed'] } // Absent on reports created before AI analysis ran
  }
});

// Export the Report model so we can use it to save or search for reports in our routes.
export default mongoose.model('Report', reportSchema);
