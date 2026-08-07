import express from 'express';
import Notification from '../models/Notification.js';
// Notifications are personal — every route here requires a logged-in user.
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Apply 'protect' to ALL routes: you can only ever see or change YOUR OWN notifications.
router.use(protect);

// --- ROUTE 1: GET MY NOTIFICATIONS ---
// GET /api/notifications
router.get('/', async (req, res) => {
  try {
    // Newest first, capped at 50 so the payload stays small.
    const notifications = await Notification.find({ recipient: req.user._id })
      .sort({ createdAt: -1 })
      .limit(50)
      .populate('sender', 'name avatarUrl');

    // Also send the unread count so the bell badge doesn't need a second request.
    const unreadCount = await Notification.countDocuments({ recipient: req.user._id, read: false });

    res.json({ notifications, unreadCount });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching notifications', error: error.message });
  }
});

// --- ROUTE 2: MARK ALL AS READ ---
// PATCH /api/notifications/read-all
router.patch('/read-all', async (req, res) => {
  try {
    await Notification.updateMany({ recipient: req.user._id, read: false }, { read: true });
    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    res.status(500).json({ message: 'Error marking notifications as read', error: error.message });
  }
});

// --- ROUTE 3: MARK ONE AS READ ---
// PATCH /api/notifications/:id/read
router.patch('/:id/read', async (req, res) => {
  try {
    // The filter includes 'recipient' so users can't touch someone else's notification.
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, recipient: req.user._id },
      { read: true },
      { new: true }
    );
    if (!notification) return res.status(404).json({ message: 'Notification not found' });
    res.json(notification);
  } catch (error) {
    res.status(500).json({ message: 'Error marking notification as read', error: error.message });
  }
});

// --- ROUTE 4: DELETE A NOTIFICATION ---
// DELETE /api/notifications/:id
router.delete('/:id', async (req, res) => {
  try {
    const notification = await Notification.findOneAndDelete({
      _id: req.params.id,
      recipient: req.user._id
    });
    if (!notification) return res.status(404).json({ message: 'Notification not found' });
    res.json({ message: 'Notification removed' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting notification', error: error.message });
  }
});

export default router;
