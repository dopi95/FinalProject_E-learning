const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Grade = require('../models/Grade');
const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');

// POST /api/grades — instructor submits grade for a student
router.post('/', auth, async (req, res) => {
  try {
    if (req.user.role !== 'instructor' && req.user.role !== 'superadmin') {
      return res.status(403).json({ message: 'Access denied' });
    }
    const { studentId, courseId, fields, gradeLetter } = req.body;
    if (!studentId || !courseId || !gradeLetter) {
      return res.status(400).json({ message: 'studentId, courseId and gradeLetter required' });
    }

    const totalMark = (fields || []).reduce((s, f) => s + (parseFloat(f.mark) || 0), 0);
    const cleanFields = (fields || []).map(f => ({ ...f, mark: parseFloat(f.mark) || 0 }));

    const grade = await Grade.findOneAndUpdate(
      { student: studentId, course: courseId },
      { student: studentId, course: courseId, instructor: req.user._id || req.user.id, fields: cleanFields, totalMark, gradeLetter, submittedAt: new Date() },
      { upsert: true, new: true }
    );

    // Mark enrollment as completed
    await Enrollment.findOneAndUpdate(
      { user: studentId, course: courseId },
      { status: 'completed' }
    );

    res.json({ success: true, grade });
  } catch (error) {
    console.error('Submit grade error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/grades/bulk — instructor submits same grade for multiple students
router.post('/bulk', auth, async (req, res) => {
  try {
    if (req.user.role !== 'instructor' && req.user.role !== 'superadmin') {
      return res.status(403).json({ message: 'Access denied' });
    }
    const { studentIds, courseId, fields, gradeLetter } = req.body;
    if (!studentIds?.length || !courseId || !gradeLetter) {
      return res.status(400).json({ message: 'studentIds, courseId and gradeLetter required' });
    }

    const totalMark = (fields || []).reduce((s, f) => s + (parseFloat(f.mark) || 0), 0);
    const instructorId = req.user._id || req.user.id;

    await Promise.all(studentIds.map(async (studentId) => {
      await Grade.findOneAndUpdate(
        { student: studentId, course: courseId },
        { student: studentId, course: courseId, instructor: instructorId, fields: fields || [], totalMark, gradeLetter, submittedAt: new Date() },
        { upsert: true, new: true }
      );
      await Enrollment.findOneAndUpdate(
        { user: studentId, course: courseId },
        { status: 'completed' }
      );
    }));

    res.json({ success: true, count: studentIds.length });
  } catch (error) {
    console.error('Bulk grade error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/grades/my — student gets their own grades
router.get('/my', auth, async (req, res) => {
  try {
    const grades = await Grade.find({ student: req.user._id || req.user.id })
      .populate('course', 'title')
      .populate('instructor', 'name')
      .sort({ submittedAt: -1 })
      .lean();
    res.json({ success: true, grades });
  } catch (error) {
    console.error('Get my grades error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// GET /api/grades/course/:courseId — instructor gets all grades for a course
router.get('/course/:courseId', auth, async (req, res) => {
  try {
    const grades = await Grade.find({ course: req.params.courseId })
      .populate('student', 'name email systemId profileImage');
    res.json({ success: true, grades });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
