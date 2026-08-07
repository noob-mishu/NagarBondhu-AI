import express from 'express';
import User from '../models/User.js';
import Report from '../models/Report.js';
import Comment from '../models/Comment.js';
// Import our protect middleware. This ensures only logged-in users with valid tokens can access these routes.
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Apply the 'protect' middleware to ALL routes in this file automatically.
// Any request coming here will be checked for a valid JWT token first.
router.use(protect);

// --- ROUTE: SEARCH USERS (for @mentions) ---
// GET /api/users/search?q=rah
// Used by the comment box autocomplete: type "@rah" and we suggest matching users.
router.get('/search', async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || q.trim().length < 1) return res.json([]);

    // Match the query against names or emails, case-insensitively.
    // We exclude the searcher themselves (you can't mention yourself) and cap at 8 results.
    const users = await User.find({
      _id: { $ne: req.user._id },
      $or: [
        { name: { $regex: q.trim(), $options: 'i' } },
        { email: { $regex: q.trim(), $options: 'i' } }
      ]
    })
      .select('name avatarUrl role')
      .limit(8);

    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Error searching users', error: error.message });
  }
});

// --- ROUTE 1: GET MY PROFILE ---
// GET /api/users/me
router.get('/me', (req, res) => {
  // Because of the 'protect' middleware, 'req.user' will hold the currently logged-in user's data.
  // We simply send it back to them.
  res.json(req.user);
});

// --- ROUTE 2: UPDATE MY PROFILE ---
// PUT /api/users/me
router.put('/me', async (req, res) => {
  try {
    // We find the user using the ID from the token (req.user._id)
    const user = await User.findById(req.user._id);

    if (user) {
      // If the user sent a new name, location, or avatarUrl, update it. 
      // If they didn't send a field, keep the old one (user.name || user.name is redundant but safe).
      user.name = req.body.name || user.name;
      user.location = req.body.location || user.location;
      user.avatarUrl = req.body.avatarUrl || user.avatarUrl;

      // Save the updated user to the database.
      const updatedUser = await user.save();

      // Return the updated info (without the password!)
      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        location: updatedUser.location,
        avatarUrl: updatedUser.avatarUrl
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error updating profile', error: error.message });
  }
});

// --- ROUTE 3: GET MY IMPACT STATS ---
// GET /api/users/me/impact-stats
// This tells the user how many issues they have reported and solved, gamifying the experience!
router.get('/me/impact-stats', async (req, res) => {
  try {
    // Find all reports created by the logged-in user.
    const reports = await Report.find({ reporter: req.user._id });

    // Let's count the different statuses of their reports.
    const totalReports = reports.length;
    // We use .filter() to find reports with specific statuses and get the length of that filtered array.
    const resolvedReports = reports.filter(r => r.status === 'Resolved').length;
    const pendingReports = reports.filter(r => r.status === 'Pending').length;
    const inProgressReports = reports.filter(r => r.status === 'In Progress').length;

    // Total upvotes their reports collected, and how many discussion comments they wrote.
    const totalUpvotes = reports.reduce((sum, r) => sum + (r.upvoteCount || 0), 0);
    const totalDiscussions = await Comment.countDocuments({ user: req.user._id });

    // Send the stats back to the user!
    // 'points' is the real gamification balance stored on the user
    // (+10 per report, +50 resolve bonus — awarded in reportRoutes.js).
    res.json({
      totalReports,
      resolvedReports,
      totalResolved: resolvedReports,
      pendingReports,
      inProgressReports,
      totalUpvotes,
      totalDiscussions,
      points: req.user.points || 0,
      impactScore: req.user.points || 0
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching impact stats', error: error.message });
  }
});

// --- ROUTE 4: GET A DAILY INSIGHT ---
// GET /api/users/me/daily-insight
// A fun little route to send a motivational message to the user.
router.get('/me/daily-insight', (req, res) => {
  // A simple hardcoded message. In a real app, this might change based on the day of the week or user activity.
  res.json({ 
    message: 'Your reports are making a difference! Keep it up.', 
    tip: 'Try reporting issues with photos for faster resolution.' 
  });
});

export default router;
