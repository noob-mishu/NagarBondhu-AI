import express from "express";
import Report from "../models/Report.js";
import ReportComment from "../models/ReportComment.js";
import Notification from "../models/Notification.js";
import User from "../models/User.js";
// Import auth middleware to check who is logged in and if they are an admin.
import { protect, adminOnly } from "../middleware/auth.js";
// Import upload tools. 'upload' handles the incoming files, 'uploadToCloudinary' sends them to cloud storage.
import { upload, uploadToCloudinary } from "../middleware/upload.js";
// Import AI helpers. Analysis now runs securely on the backend using OpenAI.
import { performAnalysis, sanitizeAnalysis } from "../services/aiService.js";

const router = express.Router();

// Gamification: how many points civic actions are worth.
const POINTS_PER_REPORT = 10; // earned for every report submitted
const POINTS_RESOLVED_BONUS = 50; // special bonus when a report gets resolved

// --- ROUTE 1: CREATE A NEW REPORT (Protected) ---
// POST /api/reports
// 'protect' ensures only logged in users can report.
// 'upload.array('images', 5)' tells our server to expect up to 5 image files attached to the request under the field name 'images'.
router.post("/", protect, upload.array("images", 5), async (req, res) => {
  try {
    // 1. Get the text details from the request body.
    const { title, description, category, location } = req.body;

    // 2. Create a new Report object in memory.
    // We set 'reporter' to 'req.user._id' so we know exactly who submitted this.
    const report = new Report({
      title,
      description,
      category,
      location,
      reporter: req.user._id,
      images: [], // Start with an empty array for images
    });

    // 3. Check if the user uploaded any files.
    if (req.files && req.files.length > 0) {
      // Loop through every file uploaded
      for (const file of req.files) {
        // Send the file's raw data (buffer) to Cloudinary into the 'nagarbondhu/reports' folder.
        const result = await uploadToCloudinary(
          file.buffer,
          "nagarbondhu/reports",
        );
        // If successful, push the secure URL and the public ID into our report's images array.
        if (result) {
          report.images.push({
            url: result.url,
            publicId: result.publicId,
          });
        }
      }
    }

    // 4. Save the report to the database. AI analysis is performed later via backend OpenAI.
    const savedReport = await report.save();

    // 5. "Populate" the reporter field.
    // Instead of just seeing the user's ID string, populate tells Mongoose to go fetch the user's actual 'name' and 'avatarUrl' from the User collection and stick it in the response.
    await savedReport.populate("reporter", "name avatarUrl");

    // 6. Post-save side effects: reward the reporter and notify everyone else.
    // A failure here must not fail the report itself, so it's wrapped in its own try/catch.
    try {
      // Every submitted report earns the reporter points (gamification).
      await User.findByIdAndUpdate(req.user._id, {
        $inc: { points: POINTS_PER_REPORT },
      });

      // Notify everyone (citizens and admins) that a new issue was reported.
      // The reporter is excluded — they don't need a notification about their own report.
      // insertMany creates one notification document per user in a single DB call.
      const users = await User.find({ _id: { $ne: req.user._id } }).select("_id");
      if (users.length > 0) {
        await Notification.insertMany(
          users.map((u) => ({
            recipient: u._id,
            sender: req.user._id,
            type: "new_report",
            message: `New issue reported: "${savedReport.title}" at ${savedReport.location}`,
            link: `/issue/${savedReport._id}`,
            report: savedReport._id,
          })),
        );
      }
    } catch (sideEffectError) {
      console.error(
        "Failed to award points / send new report notifications:",
        sideEffectError.message,
      );
    }

    // 7. Return the successfully created report with a 201 (Created) status code.
    res.status(201).json(savedReport);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error creating report", error: error.message });
  }
});

// --- ROUTE 2: GET ACTIVE REPORTS FOR COMMUNITY FEED (Public) ---
// GET /api/reports/active
// Anyone can view active issues. We don't need 'protect' here.
router.get("/active", async (req, res) => {
  try {
    // 1. Get query parameters from the URL (e.g., /api/reports/active?ward=Ward10&page=2)
    // Default limit is 10 items per page, default page is 1.
    const { ward, status, limit = 10, page = 1 } = req.query;

    // 2. Build our search filter. By default we show reports that are NOT resolved
    // or rejected yet, but the feed can ask for one specific status (e.g. 'Resolved'
    // to celebrate fixed issues).
    const validStatuses = ["Pending", "Under Review", "In Progress", "Resolved", "Rejected"];
    const filter = {
      status: validStatuses.includes(status)
        ? status
        : { $in: ["Pending", "Under Review", "In Progress"] },
    };

    // 3. If a specific ward was provided in the search, add a location filter using a regular expression (regex) to match it case-insensitively.
    if (ward) {
      filter.location = { $regex: ward, $options: "i" };
    }

    // 4 & 5. Find the reports using the filter.
    // .sort({ createdAt: -1 }) sorts them from newest to oldest.
    // .skip() and .limit() handle pagination (e.g., if page 2, limit 10, skip the first 10 items).
    const reports = await Report.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .populate("reporter", "name avatarUrl"); // 6. Bring in the reporter's name and picture

    // 7. Count the total number of reports that match this filter so the frontend knows how many pages there are total.
    const total = await Report.countDocuments(filter);

    // 8. Return all the data needed for the feed and pagination buttons.
    res.json({
      reports,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching active reports", error: error.message });
  }
});

// --- ROUTE 3: GET MY OWN REPORTS (Protected) ---
// GET /api/reports/my-reports
router.get("/my-reports", protect, async (req, res) => {
  try {
    // 1. Setup pagination.
    const { limit = 10, page = 1 } = req.query;

    // 2 & 3. Find only reports where 'reporter' matches the logged-in user's ID (req.user._id). Sort from newest to oldest.
    const reports = await Report.find({ reporter: req.user._id })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Report.countDocuments({ reporter: req.user._id });

    // 4. Return the data.
    res.json({
      reports,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching your reports", error: error.message });
  }
});

// --- ROUTE 4: GET A SINGLE REPORT BY ID (Public) ---
// GET /api/reports/:id
router.get("/:id", async (req, res) => {
  try {
    // 1. Find the report by the ID passed in the URL (req.params.id)
    // Populate the reporter to get their name, avatar, and email.
    const report = await Report.findById(req.params.id).populate(
      "reporter",
      "name avatarUrl email",
    );

    // 2. If no report is found with that ID, send a 404 Not Found error.
    if (!report) {
      return res.status(404).json({ message: "Report not found" });
    }

    // 3. Return the report data.
    res.json(report);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching report", error: error.message });
  }
});

// --- ROUTE 5: UPVOTE OR DOWNVOTE A REPORT (Protected) ---
// PUT /api/reports/:id/upvote
// Users can vote on issues to show they care about them too.
router.put("/:id/upvote", protect, async (req, res) => {
  try {
    // 1. Find the report they want to vote on.
    const report = await Report.findById(req.params.id);

    if (!report) return res.status(404).json({ message: "Report not found" });

    // 2. Check if the user has ALREADY upvoted this.
    // report.upvotes is an array of IDs. We check if req.user._id is inside it.
    const alreadyUpvotedIndex = report.upvotes.findIndex(
      (userId) => userId.toString() === req.user._id.toString(),
    );

    let isUpvoted;

    if (alreadyUpvotedIndex !== -1) {
      // 3. If yes (they already voted), it means they want to remove their vote (toggle off).
      report.upvotes.splice(alreadyUpvotedIndex, 1); // Remove their ID from the array
      report.upvoteCount -= 1; // Decrease the count
      isUpvoted = false;
    } else {
      // 4. If no (they haven't voted yet), add their vote (toggle on).
      report.upvotes.push(req.user._id); // Add their ID to the array
      report.upvoteCount += 1; // Increase the count
      isUpvoted = true;
    }

    // 5. Save the updated report to the database.
    await report.save();

    // Return the new count and whether the user is currently upvoting it or not.
    res.json({ upvoteCount: report.upvoteCount, upvoted: isUpvoted });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error upvoting report", error: error.message });
  }
});

// --- ROUTE 6: SAVE AI ANALYSIS FOR A REPORT (Protected, reporter only) ---
// PUT /api/reports/:id/ai-analysis
// This endpoint performs AI analysis on the backend with OpenAI and saves the result.
router.put("/:id/ai-analysis", protect, async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);
    if (!report) return res.status(404).json({ message: "Report not found" });

    // Only the citizen who created the report may attach its analysis.
    if (report.reporter.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "Not authorized to update this report" });
    }

    // Never overwrite an analysis that already completed (retries are only for failures).
    if (report.aiAnalysis?.analysisStatus === "completed") {
      return res
        .status(409)
        .json({ message: "AI analysis already completed for this report" });
    }

    // The frontend runs the analysis in the browser with Puter AI (free) and
    // sends the result as 'analysis'. sanitizeAnalysis clamps every value, so a
    // forged payload can't inject invalid categories/severities/scores.
    // If no client analysis arrives (Puter blocked, sign-in cancelled), fall
    // back to running the analysis on the backend.
    const { title, description, imageUrl, analysis } = req.body;
    const rawAnalysis =
      analysis && analysis.analysisStatus === "completed"
        ? analysis
        : await performAnalysis({ title, description, imageUrl });
    report.aiAnalysis = sanitizeAnalysis(rawAnalysis);
    await report.save();

    res.json(report.aiAnalysis);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error saving AI analysis", error: error.message });
  }
});

// --- ROUTE 7: CHANGE REPORT STATUS (Protected + Admin Only) ---
// PUT /api/reports/:id/status
// Only admins (like city officials) can change a report's status (e.g., from 'Pending' to 'Resolved').
router.put("/:id/status", protect, adminOnly, async (req, res) => {
  try {
    // 1. Get the new status from the request body.
    const { status } = req.body;

    // 2. Validate that the status is one of the allowed words.
    const validStatuses = [
      "Pending",
      "Under Review",
      "In Progress",
      "Resolved",
      "Rejected",
    ];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    // Find the report
    const report = await Report.findById(req.params.id);
    if (!report) return res.status(404).json({ message: "Report not found" });

    // 3. Update the status. If this resolves the report for the FIRST time,
    // the reporter earns a special bonus. 'resolutionPointsAwarded' makes sure
    // flipping the status away and back to 'Resolved' can never award it twice.
    report.status = status;
    const awardBonus = status === "Resolved" && !report.resolutionPointsAwarded;
    if (awardBonus) report.resolutionPointsAwarded = true;

    const updatedReport = await report.save();

    // 4. Hand out the bonus + congratulation notification (never fails the request).
    if (awardBonus) {
      try {
        await User.findByIdAndUpdate(report.reporter, {
          $inc: { points: POINTS_RESOLVED_BONUS },
        });
        await Notification.create({
          recipient: report.reporter,
          sender: req.user._id,
          type: "points_awarded",
          message: `🎉 Your report "${report.title}" was resolved — you earned ${POINTS_RESOLVED_BONUS} bonus points!`,
          link: `/issue/${report._id}`,
          report: report._id,
        });
      } catch (bonusError) {
        console.error("Failed to award resolve bonus:", bonusError.message);
      }
    }

    res.json(updatedReport);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating status", error: error.message });
  }
});

// --- ROUTE 8: GET ALL COMMENTS OF A REPORT (Public) ---
// GET /api/reports/:id/comments
// Returns a flat list, oldest first, with each commenter's name and avatar.
router.get("/:id/comments", async (req, res) => {
  try {
    const comments = await ReportComment.find({ report: req.params.id })
      .sort({ createdAt: 1 })
      .populate("user", "name avatarUrl role");

    res.json(comments);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching comments", error: error.message });
  }
});

// --- ROUTE 9: ADD A COMMENT TO A REPORT (Protected) ---
// POST /api/reports/:id/comments
router.post("/:id/comments", protect, async (req, res) => {
  try {
    const { comment } = req.body;
    if (!comment || !comment.trim()) {
      return res.status(400).json({ message: "Comment text is required" });
    }

    const report = await Report.findById(req.params.id);
    if (!report) return res.status(404).json({ message: "Report not found" });

    const saved = await ReportComment.create({
      report: report._id,
      user: req.user._id,
      comment: comment.trim(),
    });

    // Keep the denormalized counter in sync so the feed can show counts cheaply.
    report.commentCount = (report.commentCount || 0) + 1;
    await report.save();

    // Tell the reporter someone commented on their issue (never about their own comment).
    // A notification failure must not fail the comment itself.
    if (report.reporter.toString() !== req.user._id.toString()) {
      try {
        await Notification.create({
          recipient: report.reporter,
          sender: req.user._id,
          type: "report_comment",
          message: `${req.user.name} commented on your report "${report.title}"`,
          link: `/issue/${report._id}`,
          report: report._id,
        });
      } catch (notifyError) {
        console.error("Failed to send comment notification:", notifyError.message);
      }
    }

    await saved.populate("user", "name avatarUrl role");
    res.status(201).json(saved);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error creating comment", error: error.message });
  }
});

// --- ROUTE 10: DELETE A REPORT COMMENT (Protected — Owner or Admin) ---
// DELETE /api/reports/comments/:commentId
router.delete("/comments/:commentId", protect, async (req, res) => {
  try {
    const comment = await ReportComment.findById(req.params.commentId);
    if (!comment) return res.status(404).json({ message: "Comment not found" });

    const isOwner = comment.user.toString() === req.user._id.toString();
    if (!isOwner && req.user.role !== "admin") {
      return res
        .status(403)
        .json({ message: "Not authorized to delete this comment" });
    }

    await comment.deleteOne();
    await Report.findByIdAndUpdate(comment.report, { $inc: { commentCount: -1 } });

    res.json({ message: "Comment deleted" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error deleting comment", error: error.message });
  }
});

export default router;
