const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Enrollment = require('../models/Enrollment');
const Course = require('../models/Course');

// Get user enrollments
router.get('/my-enrollments', auth, async (req, res) => {
  try {
    const enrollments = await Enrollment.find({ user: req.user.id })
      .populate('course', 'title description image price instructor')
      .populate('payment', 'amount receiptNumber createdAt')
      .populate({
        path: 'course',
        populate: {
          path: 'instructor',
          select: 'name'
        }
      })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: enrollments
    });
  } catch (error) {
    console.error('Enrollments fetch error:', error);
    res.status(500).json({ message: 'Server error fetching enrollments' });
  }
});

// Check enrollment status
router.get('/check/:courseId', auth, async (req, res) => {
  try {
    const { courseId } = req.params;
    
    const enrollment = await Enrollment.findOne({ 
      user: req.user.id, 
      course: courseId 
    }).populate('payment');

    res.json({
      success: true,
      data: {
        isEnrolled: !!enrollment,
        enrollment
      }
    });
  } catch (error) {
    console.error('Enrollment check error:', error);
    res.status(500).json({ message: 'Server error checking enrollment' });
  }
});

module.exports = router;