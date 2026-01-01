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
        select: 'name email profileImage bio department specialization experience'
      }
    })
    .sort({ enrollmentDate: -1 });

    const courses = await Promise.all(enrollments.map(async (enrollment) => {
      // Get enrolled student count for this course
      const enrolledCount = await Enrollment.countDocuments({
        course: enrollment.course._id,
        status: 'active'
      });

      return {
        ...enrollment.course.toObject(),
        enrollmentId: enrollment._id,
        enrollmentDate: enrollment.enrollmentDate,
        progress: enrollment.progress,
        status: enrollment.status,
        enrolledStudents: enrolledCount
      };
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

// Check enrollment status for a specific course
router.get('/check/:courseId', auth, async (req, res) => {
  try {
    const enrollment = await Enrollment.findOne({
      user: req.user.id,
      course: req.params.courseId,
      status: 'active'
    });

    res.json({
      success: true,
      data: {
        isEnrolled: !!enrollment,
        enrollment: enrollment || null
      }
    });
  } catch (error) {
    console.error('Check enrollment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check enrollment status'
    });
  }
});

// Get user enrollments
router.get('/my-enrollments', auth, async (req, res) => {
  try {
    const enrollments = await Enrollment.find({ 
      user: req.user.id 
    })
    .populate('course')
    .sort({ enrollmentDate: -1 });

    res.json({
      success: true,
      data: enrollments
    });
  } catch (error) {
    console.error('Get enrollments error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch enrollments'
    });
  }
});

module.exports = router;