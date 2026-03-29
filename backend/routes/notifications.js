const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
const User = require('../models/User');
const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');
const { logAdminActivity } = require('../utils/adminActivityLogger');
const auth = require('../middleware/auth');

// Debug route to check all notifications
router.get('/debug-all', auth, async (req, res) => {
  try {
    const allNotifications = await Notification.find({})
      .populate('sender', 'name role')
      .populate('course', 'title')
      .sort({ createdAt: -1 });
    
    res.json({
      total: allNotifications.length,
      notifications: allNotifications.map(n => ({
        id: n._id,
        title: n.title,
        message: n.message,
        sender: n.sender,
        course: n.course,
        recipients: n.recipients.length,
        createdAt: n.createdAt
      }))
    });
  } catch (error) {
    console.error('Debug notifications error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Test route to create a notification (for debugging)
router.post('/test-notification', auth, async (req, res) => {
  try {
    const sender = req.user;
    
    // Create a test notification for the current user
    const notification = new Notification({
      title: 'Test Notification',
      message: 'This is a test notification to verify the system works.',
      sender: sender._id,
      recipients: [{
        user: sender._id,
        read: false
      }],
      targetRole: 'student',
      type: 'info'
    });

    await notification.save();
    
    res.status(201).json({
      message: 'Test notification created successfully',
      notification: {
        id: notification._id,
        title: notification.title,
        message: notification.message
      }
    });

  } catch (error) {
    console.error('Test notification error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Send notification (Super Admin, Admin, and Instructors)
router.post('/send', auth, async (req, res) => {
  try {
    const { title, message, role, course } = req.body;
    const sender = req.user;

    // Check if user has permission to send notifications
    if (!['superadmin', 'admin', 'instructor'].includes(sender.role)) {
      return res.status(403).json({ message: 'Access denied. Only admins and instructors can send notifications.' });
    }

    // Validate required fields
    if (!title || !message) {
      return res.status(400).json({ message: 'Title and message are required' });
    }

    // Determine target users based on role and sender
    let targetUsers = [];
    
    if (sender.role === 'instructor') {
      // Instructors can only send to students enrolled in their courses
      if (role !== 'student' || !course) {
        return res.status(403).json({ message: 'Instructors can only send notifications to students in their courses' });
      }
      
      // Verify the instructor teaches this course
      const courseDoc = await Course.findOne({ _id: course, instructor: sender._id });
      if (!courseDoc) {
        return res.status(403).json({ message: 'You can only send notifications to students in courses you teach' });
      }
      
      // Get students enrolled in this specific course
      const enrollments = await Enrollment.find({ course: course, status: 'active' })
        .populate('user', '_id')
        .select('user');
      
      targetUsers = enrollments.map(enrollment => ({ _id: enrollment.user._id }));
      
    } else if (sender.role === 'admin' || sender.role === 'superadmin') {
      // Admin/SuperAdmin logic (existing)
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
        if (course) {
          // Send to specific course students/instructors
          const enrollments = await Enrollment.find({ course: course, status: 'active' })
            .populate('user', '_id role')
            .select('user');
          
          targetUsers = enrollments
            .filter(enrollment => enrollment.user.role === role)
            .map(enrollment => ({ _id: enrollment.user._id }));
        } else {
          // Send to all users of specified role
          targetUsers = await User.find({ 
            role: role,
            isVerified: true 
          }).select('_id');
        }
      } else {
        return res.status(403).json({ message: 'You do not have permission to send notifications to this role' });
      }
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

    // Log notification activity
    await logAdminActivity(
      sender._id,
      'notification_sent',
      `Sent notification "${title}" to ${recipients.length} ${role === 'all' ? 'users' : role + 's'}${course ? ` in course ${courseDoc?.title || 'Unknown'}` : ''}`,
      'Notification',
      notification._id,
      { targetRole: role, recipientCount: recipients.length, courseTitle: courseDoc?.title }
    );

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

    // Get notifications with population
    const notifications = await Notification.find({
      'recipients.user': userId
    })
    .populate('sender', 'name role')
    .populate('course', 'title')
    .sort({ createdAt: -1 })
    .limit(20)
    .lean();

    // Transform notifications with full info
    const userNotifications = notifications.map(notification => {
      const userRecipient = notification.recipients.find(
        recipient => recipient.user.toString() === userId.toString()
      );

      return {
        id: notification._id,
        title: notification.title || 'No title',
        message: notification.message || 'No message',
        type: notification.type || 'info',
        sender: notification.sender ? {
          name: notification.sender.name,
          role: notification.sender.role
        } : null,
        course: notification.course ? {
          title: notification.course.title
        } : null,
        read: userRecipient ? userRecipient.read : false,
        readAt: userRecipient ? userRecipient.readAt : null,
        createdAt: notification.createdAt,
        time: getTimeAgo(notification.createdAt)
      };
    });

    // Get unread count
    const unreadCount = notifications.filter(n => {
      const userRecipient = n.recipients.find(
        recipient => recipient.user.toString() === userId.toString()
      );
      return userRecipient && !userRecipient.read;
    }).length;

    res.json({
      notifications: userNotifications,
      unreadCount,
      currentPage: 1,
      totalPages: Math.ceil(notifications.length / 20)
    });

  } catch (error) {
    console.error('Get notifications error:', error);
    console.error('Error stack:', error.stack);
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
  try {
    if (!date) return 'Unknown time';
    
    const now = new Date();
    const inputDate = new Date(date);
    
    if (isNaN(inputDate.getTime())) {
      return 'Invalid date';
    }
    
    const diffInSeconds = Math.floor((now - inputDate) / 1000);
    
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
  } catch (error) {
    console.error('Error in getTimeAgo:', error);
    return 'Unknown time';
  }
}

module.exports = router;