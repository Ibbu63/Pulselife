const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Notification = require('../models/Notification');
const memoryStore = require('../memoryStore');
const { verifyToken } = require('../middleware/auth');

const isDbConnected = () => mongoose.connection.readyState === 1;

router.get('/', verifyToken, async (req, res) => {
  try {
    if (isDbConnected()) {
      const notifications = await Notification.find({ receiverId: req.user.id }).sort({ createdAt: -1 });
      return res.json(notifications);
    } else {
      return res.json(memoryStore.notifications);
    }
  } catch (error) {
    res.status(500).json({ message: 'Error fetching notifications' });
  }
});

router.put('/read-all', verifyToken, async (req, res) => {
  try {
    if (isDbConnected()) {
      await Notification.updateMany({ receiverId: req.user.id }, { read: true });
    } else {
      memoryStore.notifications.forEach(n => n.read = true);
    }
    res.json({ message: 'Notifications marked as read' });
  } catch (error) {
    res.status(500).json({ message: 'Error marking notifications' });
  }
});

module.exports = router;
