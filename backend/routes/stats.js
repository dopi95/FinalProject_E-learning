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

// Get gender distribution statistics
router.get('/gender-distribution', async (req, res) => {
  try {
    const [studentGenderStats, instructorGenderStats] = await Promise.all([
      User.aggregate([
        { $match: { role: 'student', isVerified: true } },
        { $group: { _id: '$gender', count: { $sum: 1 } } }
      ]),
      User.aggregate([
        { $match: { role: 'instructor', isVerified: true } },
        { $group: { _id: '$gender', count: { $sum: 1 } } }
      ])
    ]);

    // Format the data
    const formatGenderData = (stats) => {
      const result = { male: 0, female: 0 };
      stats.forEach(stat => {
        if (stat._id === 'male' || stat._id === 'female') {
          result[stat._id] = stat.count;
        }
      });
      return result;
    };

    res.json({
      students: formatGenderData(studentGenderStats),
      instructors: formatGenderData(instructorGenderStats)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;