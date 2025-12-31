const express = require('express');
const router = express.Router();
const Enrollment = require('../models/Enrollment');
const Course = require('../models/Course');
const auth = require('../middleware/auth');

// Get user's enrolled courses
router.get('/my-courses', auth, async (req, res) => {
  try {
    const enrollments = await Enrollment.find({ 
      user: req.user.id,
      status: 'active'
    })
    .populate({
      path: 'course',
      populate: {
        path: 'instructor',
        select: 'name email'
      }
    })
    .sort({ enrollmentDate: -1 });

    const courses = enrollments.map(enrollment => ({
      ...enrollment.course.toObject(),
      enrollmentId: enrollment._id,
      enrollmentDate: enrollment.enrollmentDate,
      progress: enrollment.progress,
      status: enrollment.status
    }));

    res.json({
      success: true,
      courses,
      count: courses.length
    });
  } catch (error) {
    console.error('Get enrolled courses error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch enrolled courses'
    });
  }
});

module.exports = router;