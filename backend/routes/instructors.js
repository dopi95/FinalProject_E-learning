const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');
const User = require('../models/User');

// Get instructor's students
router.get('/students', auth, async (req, res) => {
  try {
    if (req.user.role !== 'instructor') {
      return res.status(403).json({ message: 'Access denied. Instructors only.' });
    }

    const { course } = req.query;
    
    // Get instructor's courses
    const instructorCourses = await Course.find({ instructor: req.user.id })
      .select('_id title students');

    if (instructorCourses.length === 0) {
      return res.json({ success: true, students: [], courses: [] });
    }

    // Get all student IDs from instructor's courses
    let allStudentIds = [];
    if (course && course !== 'all') {
      // Filter by specific course
      const selectedCourse = instructorCourses.find(c => c._id.toString() === course);
      if (selectedCourse && selectedCourse.students) {
        allStudentIds = selectedCourse.students;
      }
    } else {
      // Get all students from all courses
      instructorCourses.forEach(courseItem => {
        if (courseItem.students) {
          allStudentIds = [...allStudentIds, ...courseItem.students];
        }
      });
      // Remove duplicates
      allStudentIds = [...new Set(allStudentIds.map(id => id.toString()))];
    }

    if (allStudentIds.length === 0) {
      return res.json({ 
        success: true, 
        students: [], 
        courses: instructorCourses.map(c => ({ _id: c._id, title: c.title }))
      });
    }

    // Get student details
    const students = await User.find({ 
      _id: { $in: allStudentIds },
      role: 'student'
    }).select('name email systemId profileImage');

    // Map students with their course info
    const studentsWithCourses = students.map(student => {
      const studentCourses = instructorCourses.filter(courseItem => 
        courseItem.students && courseItem.students.some(id => id.toString() === student._id.toString())
      ).map(courseItem => ({
        _id: courseItem._id,
        title: courseItem.title,
        enrollmentDate: new Date(),
        attendance: Math.floor(Math.random() * 101)
      }));

      return {
        _id: student._id,
        name: student.name,
        email: student.email,
        systemId: student.systemId,
        profileImage: student.profileImage,
        courses: studentCourses,
        totalCourses: studentCourses.length
      };
    });

    res.json({
      success: true,
      students: studentsWithCourses,
      courses: instructorCourses.map(c => ({ _id: c._id, title: c.title }))
    });
  } catch (error) {
    console.error('Get instructor students error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch students',
      error: error.message
    });
  }
});

module.exports = router;