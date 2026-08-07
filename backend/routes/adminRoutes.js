import express from 'express';
import Report from '../models/Report.js';
import User from '../models/User.js';
// Import middleware to make sure ONLY logged in admins can access these stats.
import { protect, adminOnly } from '../middleware/auth.js';

const router = express.Router();

// Apply the protect and adminOnly middlewares to ALL routes in this file.
// If a normal user tries to access /api/admin/stats, they will be blocked!
router.use(protect, adminOnly);

// --- ROUTE: GET SYSTEM WIDE STATS ---
// GET /api/admin/stats
// This provides data for an admin dashboard (like a control panel for city officials).
router.get('/stats', async (req, res) => {
  try {
    // 1. We use countDocuments() to quickly count how many reports exist with specific statuses.
    // We do this concurrently (at the same time) using Promise.all to make the request faster,
    // but doing it line by line is also fine for beginners!
    
    // Count ALL reports in the database
    const totalReports = await Report.countDocuments();
    
    // Count only reports that are 'Pending'
    const pendingReports = await Report.countDocuments({ status: 'Pending' });
    
    // Count only reports that are 'In Progress'
    const inProgressReports = await Report.countDocuments({ status: 'In Progress' });
    
    // Count only reports that are 'Resolved'
    const resolvedReports = await Report.countDocuments({ status: 'Resolved' });
    
    // Count only reports that are 'Rejected'
    const rejectedReports = await Report.countDocuments({ status: 'Rejected' });
    
    // 2. Count the total number of registered users in the database
    const totalUsers = await User.countDocuments();

    // 3. Group reports by category so the dashboard can draw a category distribution chart.
    // $group works like "GROUP BY" in SQL: it counts how many reports share each category.
    const categoryCounts = await Report.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // 4. Send all these numbers back as a single object for the admin dashboard to display charts/graphs.
    res.json({
      totalReports,
      pendingReports,
      inProgressReports,
      resolvedReports,
      rejectedReports,
      totalUsers,
      categoryCounts
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching admin stats', error: error.message });
  }
});

// --- ROUTE: GET ALL REPORTS FOR MANAGEMENT (Admin Only) ---
// GET /api/admin/reports?status=Pending&category=Safety&page=1&limit=10
// Unlike /api/reports/active, this returns EVERY report (including Resolved/Rejected)
// so admins can manage the full list from the dashboard.
router.get('/reports', async (req, res) => {
  try {
    const { status, category, search, limit = 10, page = 1 } = req.query;

    // Build the filter from whichever query params were provided.
    const filter = {};
    if (status) filter.status = status;
    if (category) filter.category = category;
    if (search) {
      // Search by title or location, case-insensitively.
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } }
      ];
    }

    const reports = await Report.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .populate('reporter', 'name avatarUrl email');

    const total = await Report.countDocuments(filter);

    res.json({
      reports,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit)
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching reports', error: error.message });
  }
});

export default router;
