import express from 'express';
import Report from '../models/Report.js';

const router = express.Router();

// NOTE: Discussion endpoints used to live here, but the full Community Discussion
// feature now has its own dedicated files: routes/discussionRoutes.js (/api/discussions)
// and routes/commentRoutes.js (/api/comments).

// --- ROUTE: GET COMMUNITY PULSE (Public) ---
// GET /api/community/pulse
// This route provides a quick overview of what's happening in the community right now.
// It gets recently resolved issues (good news!) and the newest issues.
router.get('/pulse', async (req, res) => {
  try {
    // 1. Get the ward and limit from the query. Default to showing 10 items.
    const { ward, limit = 10 } = req.query;

    // We can use a location filter if a specific ward is requested.
    let locationFilter = {};
    if (ward) {
      // If ward is 'Mirpur', this will search for anything containing 'Mirpur' in the location field.
      locationFilter = { location: { $regex: ward, $options: 'i' } };
    }

    // 2. Find the most recently RESOLVED reports.
    // We combine the locationFilter and specify status: 'Resolved'.
    // Then we sort by date descending (newest first) and limit the results.
    const recentlyResolved = await Report.find({ ...locationFilter, status: 'Resolved' })
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .populate('reporter', 'name avatarUrl'); // Get reporter details for the UI

    // 3. Find the most recently CREATED reports, regardless of status.
    const recentReports = await Report.find(locationFilter)
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .populate('reporter', 'name avatarUrl'); // Get reporter details

    // 4. Send back both lists in one convenient response for the frontend dashboard.
    res.json({
      recentlyResolved,
      recentReports
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching community pulse', error: error.message });
  }
});

export default router;
