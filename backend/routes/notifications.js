const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
const User = require('../models/User');
const auth = require('../middleware/auth');

// Send notification (Super Admin and Admin only)
router.post('/send', auth, async (req, res) => {
  try {
    const { title, message, role, course } = req.body;
    const sender = req.user;

    // Check if user has permission to send notifications
    if (sender.role !== 'superadmin' && sender.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Only admins can send notifications.' });
    }

    // Validate required fields
    if (!title || !message) {
      return res.status(400).json({ message: 'Title and message are required' });
    }

    // Determine target users based on role
    let targetUsers = [];
    
    if (role === 'all') {
      if (sender.role === 'superadmin') {
        // Super admin can send to everyone
        targetUsers = await User.find({ 
          role: { $in: ['student', 'instructor', 'admin'] },
          isVerified: true 
        }).select('_id');
      } else {
        // Regular admin can only send to students and instructors
        targetUsers = await User.find({ 
          role: { $in: ['student', 'instructor'] },
          isVerified: true 
        }).select('_id');
      }
    } else if (role === 'admin' && sender.role === 'superadmin') {
      // Only super admin can send to admins
      targetUsers = await User.find({ 
        role: 'admin',
        isVerified: true 
      }).select('_id');
    } else if (role === 'student' || role === 'instructor') {
      targetUsers = await User.find({ 
        role: role,
        isVerified: true 
      }).select('_id');
    } else {
      return res.status(403).json({ message: 'You do not have permission to send notifications to this role' });
    }

    if (targetUsers.length === 0) {
      return res.status(404).json({ message: 'No users found for the specified role' });
    }

    // Create recipients array
    const recipients = targetUsers.map(user => ({
      user: user._id,
      read: false
    }));

    // Create notification
    const notification = new Notification({
      title,
      message,
      sender: sender._id,
      recipients,
      targetRole: role,
      type: 'info',
      course: course || null
    });

    await notification.save();

    res.status(201).json({
      message: 'Notification sent successfully',
      notification: {
        id: notification._id,
        title: notification.title,
        message: notification.message,
        targetRole: notification.targetRole,
        recipientCount: recipients.length,
        createdAt: notification.createdAt
      }
    });

  } catch (error) {
    console.error('Send notification error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get notifications for current user
router.get('/my-notifications', auth, async (req, res) => {
  try {
    const userId = req.user._id;
    const { page = 1, limit = 20 } = req.query;

    const notifications = await Notification.find({
      'recipients.user': userId
    })
    .populate('sender', 'name role')
    .populate('course', 'title')
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

    // Transform notifications to include read status for current user
    const userNotifications = notifications.map(notification => {
      const userRecipient = notification.recipients.find(
        recipient => recipient.user.toString() === userId.toString()
      );

      return {
        id: notification._id,
        title: notification.title,
        message: notification.message,
        type: notification.type,
        sender: notification.sender,
        course: notification.course,
        read: userRecipient ? userRecipient.read : false,
        readAt: userRecipient ? userRecipient.readAt : null,
        createdAt: notification.createdAt,
        time: getTimeAgo(notification.createdAt)
      };
    });

    // Get unread count
    const unreadCount = await Notification.countDocuments({
      'recipients': {
        $elemMatch: {
          user: userId,
          read: false
        }
      }
    });

    res.json({
      notifications: userNotifications,
      unreadCount,
      currentPage: parseInt(page),
      totalPages: Math.ceil(await Notification.countDocuments({ 'recipients.user': userId }) / limit)
    });

  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Mark notification as read
router.patch('/:notificationId/read', auth, async (req, res) => {
  try {
    const { notificationId } = req.params;
    const userId = req.user._id;

    const notification = await Notification.findOneAndUpdate(
      {
        _id: notificationId,
        'recipients.user': userId
      },
      {
        $set: {
          'recipients.$.read': true,
          'recipients.$.readAt': new Date()
        }
      },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    res.json({ message: 'Notification marked as read' });

  } catch (error) {
    console.error('Mark notification as read error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Mark all notifications as read
router.patch('/mark-all-read', auth, async (req, res) => {
  try {
    const userId = req.user._id;

    await Notification.updateMany(
      {
        'recipients.user': userId,
        'recipients.read': false
      },
      {
        $set: {
          'recipients.$.read': true,
          'recipients.$.readAt': new Date()
        }
      }
    );

    res.json({ message: 'All notifications marked as read' });

  } catch (error) {
    console.error('Mark all notifications as read error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete notification (for current user)
router.delete('/:notificationId', auth, async (req, res) => {
  try {
    const { notificationId } = req.params;
    const userId = req.user._id;

    const notification = await Notification.findOneAndUpdate(
      {
        _id: notificationId,
        'recipients.user': userId
      },
      {
        $pull: {
          recipients: { user: userId }
        }
      },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    // If no recipients left, delete the notification entirely
    if (notification.recipients.length === 0) {
      await Notification.findByIdAndDelete(notificationId);
    }

    res.json({ message: 'Notification deleted successfully' });

  } catch (error) {
    console.error('Delete notification error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Helper function to get time ago
function getTimeAgo(date) {
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);
  
  if (diffInSeconds < 60) {
    return 'Just now';
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  } else {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days} day${days > 1 ? 's' : ''} ago`;
  }
}

module.exports = router;