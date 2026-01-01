const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Enrollment = require('../models/Enrollment');
const Payment = require('../models/Payment');
const Course = require('../models/Course');
const auth = require('../middleware/auth');

// Get all users with filtering
router.get('/', auth, async (req, res) => {
  try {
    if (req.user.role !== 'superadmin' && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { role, course, search, page = 1, limit = 20 } = req.query;
    
    let query = {};
    
    // Role filter
    if (role && role !== 'all') {
      query.role = role;
    }
    
    // Search filter
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { systemId: { $regex: search, $options: 'i' } }
      ];
    }

    let users = await User.find(query)
      .select('-password -otp -otpExpires -resetPasswordToken -resetPasswordExpires')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    // Course filter for students/instructors
    if (course && course !== 'all' && (role === 'student' || role === 'instructor')) {
      if (role === 'student') {
        const enrollments = await Enrollment.find({ course }).populate('user');
        const enrolledUserIds = enrollments.map(e => e.user._id.toString());
        users = users.filter(user => enrolledUserIds.includes(user._id.toString()));
      } else if (role === 'instructor') {
        const courses = await Course.find({ instructor: { $in: users.map(u => u._id) } });
        const instructorIds = courses.filter(c => c._id.toString() === course).map(c => c.instructor.toString());
        users = users.filter(user => instructorIds.includes(user._id.toString()));
      }
    }

    const total = await User.countDocuments(query);

    res.json({
      success: true,
      users,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users'
    });
  }
});

// Get user details with enrollments and payments
router.get('/:id', auth, async (req, res) => {
  try {
    if (req.user.role !== 'superadmin' && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const user = await User.findById(req.params.id)
      .select('-password -otp -otpExpires -resetPasswordToken -resetPasswordExpires');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    let enrollments = [];
    let payments = [];
    let courses = [];

    // Get student data
    if (user.role === 'student') {
      try {
        enrollments = await Enrollment.find({ user: user._id })
          .populate({
            path: 'course',
            populate: {
              path: 'instructor',
              select: 'name email'
            }
          })
          .sort({ enrollmentDate: -1 });
      } catch (err) {
        console.log('Enrollment error:', err);
      }

      try {
        payments = await Payment.find({ 
          user: user._id,
          status: 'success'
        })
          .populate('course')
          .sort({ createdAt: -1 });
        
        // Remove duplicates by course ID
        const uniquePayments = [];
        const seenCourses = new Set();
        
        for (const payment of payments) {
          if (payment.course && !seenCourses.has(payment.course._id.toString())) {
            seenCourses.add(payment.course._id.toString());
            uniquePayments.push(payment);
          }
        }
        
        payments = uniquePayments;
      } catch (err) {
        console.log('Payment error:', err);
      }
    }

    // Get instructor data
    if (user.role === 'instructor') {
      try {
        courses = await Course.find({ instructor: user._id })
          .select('-description')
          .sort({ createdAt: -1 });
      } catch (err) {
        console.log('Course error:', err);
      }
    }

    res.json({
      success: true,
      user,
      enrollments,
      payments,
      courses
    });
  } catch (error) {
    console.error('Get user details error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user details',
      error: error.message
    });
  }
});

// Delete user
router.delete('/:id', auth, async (req, res) => {
  try {
    if (req.user.role !== 'superadmin') {
      return res.status(403).json({ message: 'Access denied. Super admin only.' });
    }

    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Don't allow deleting other super admins
    if (user.role === 'superadmin') {
      return res.status(403).json({ message: 'Cannot delete super admin users' });
    }

    await User.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete user'
    });
  }
});

module.exports = router;