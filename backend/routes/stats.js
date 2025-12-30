const express = require('express');
const router = express.Router();
const Course = require('../models/Course');
const User = require('../models/User');

// Get platform statistics
router.get('/', async (req, res) => {
  try {
    const [studentCount, courseCount, instructorCount] = await Promise.all([
      User.countDocuments({ role: 'student', isVerified: true }),
      Course.countDocuments({ isActive: true }),
      User.countDocuments({ role: 'instructor', isVerified: true })
    ]);

    res.json({
      students: studentCount,
      courses: courseCount,
      instructors: instructorCount
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;