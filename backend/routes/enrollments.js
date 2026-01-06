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
      match: { isActive: true },
      populate: {
        path: 'instructor',
        select: 'name email profileImage bio department specialization experience'
      }
    })
    .sort({ enrollmentDate: -1 });

    // Filter out enrollments where course is null (deleted/inactive courses)
    const validEnrollments = enrollments.filter(enrollment => enrollment.course !== null);

    const courses = await Promise.all(validEnrollments.map(async (enrollment) => {
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
    // First check if the course exists and is active
    const course = await Course.findOne({
      _id: req.params.courseId,
      isActive: true
    });

    if (!course) {
      return res.json({
        success: true,
        data: {
          isEnrolled: false,
          enrollment: null
        }
      });
    }

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
    .populate({
      path: 'course',
      match: { isActive: true }
    })
    .sort({ enrollmentDate: -1 });

    // Filter out enrollments where course is null (deleted/inactive courses)
    const validEnrollments = enrollments.filter(enrollment => enrollment.course !== null);

    res.json({
      success: true,
      data: validEnrollments
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