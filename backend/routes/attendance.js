const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Attendance = require('../models/Attendance');
const Schedule = require('../models/Schedule');
const Course = require('../models/Course');

// POST /api/attendance/join — student records attendance when joining a session
router.post('/join', auth, async (req, res) => {
  try {
    const { courseId, sessionDay } = req.body;
    if (!courseId) return res.status(400).json({ message: 'courseId required' });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const existing = await Attendance.findOne({
      student: req.user.id,
      course: courseId,
      sessionDate: today
    });

    if (!existing) {
      await Attendance.create({
        student: req.user.id,
        course: courseId,
        sessionDay: sessionDay || null,
        sessionDate: today,
        joinedAt: new Date()
      });
    }

    res.json({ success: true, message: existing ? 'Already recorded today' : 'Attendance recorded' });
  } catch (error) {
    console.error('Attendance join error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/attendance/course/:courseId — instructor gets attendance for all students
router.get('/course/:courseId', auth, async (req, res) => {
  try {
    const { courseId } = req.params;

    const course = await Course.findById(courseId).select('title students instructor');
    if (!course) return res.status(404).json({ message: 'Course not found' });
    if (
      req.user.role !== 'superadmin' &&
      course.instructor?.toString() !== (req.user._id || req.user.id)?.toString()
    ) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Get all attendance records for this course
    const allAttendance = await Attendance.find({ course: courseId })
      .populate('student', 'name email systemId profileImage gender');

    // Total sessions = unique dates where at least one student joined
    // (instructor sent a link on those days and students actually attended)
    const allDates = new Set(
      allAttendance.map(a => a.sessionDate.toISOString().split('T')[0])
    );
    const totalHeld = Math.max(allDates.size, 1);

    // Group attendance by student
    const studentMap = {};
    allAttendance.forEach(a => {
      const sid = a.student?._id?.toString();
      if (!sid) return;
      if (!studentMap[sid]) {
        studentMap[sid] = { student: a.student, dates: new Set() };
      }
      studentMap[sid].dates.add(a.sessionDate.toISOString().split('T')[0]);
    });

    const result = Object.values(studentMap).map(({ student, dates }) => ({
      student,
      attended: dates.size,
      total: totalHeld,
      percentage: Math.min(100, Math.round((dates.size / totalHeld) * 100))
    }));

    res.json({ success: true, attendance: result, totalSessions: totalHeld });
  } catch (error) {
    console.error('Get attendance error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/attendance/my/:courseId — student gets their own attendance
router.get('/my/:courseId', auth, async (req, res) => {
  try {
    const allAttendance = await Attendance.find({ course: req.params.courseId });
    const allDates = new Set(allAttendance.map(a => a.sessionDate.toISOString().split('T')[0]));
    const totalHeld = Math.max(allDates.size, 1);

    const myRecords = await Attendance.find({ student: req.user.id, course: req.params.courseId });
    const myDates = new Set(myRecords.map(r => r.sessionDate.toISOString().split('T')[0]));

    res.json({
      success: true,
      attended: myDates.size,
      total: totalHeld,
      percentage: Math.min(100, Math.round((myDates.size / totalHeld) * 100))
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
