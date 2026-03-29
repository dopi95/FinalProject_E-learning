const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Attendance = require('../models/Attendance');
const Schedule = require('../models/Schedule');
const Course = require('../models/Course');

// POST /api/attendance/join — student records attendance when joining a session
router.post('/join', auth, async (req, res) => {
  try {
    const { courseId, scheduleId, sessionDay } = req.body;
    if (!courseId) return res.status(400).json({ message: 'courseId required' });

    // Use today's date (date only, no time) to prevent duplicates per day
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
        schedule: scheduleId || null,
        sessionDay: sessionDay || null,
        sessionDate: today,
        joinedAt: new Date()
      });
    }

    res.json({ success: true, message: 'Attendance recorded' });
  } catch (error) {
    console.error('Attendance join error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/attendance/course/:courseId — instructor gets attendance for a course
router.get('/course/:courseId', auth, async (req, res) => {
  try {
    const { courseId } = req.params;

    // Verify instructor owns this course
    const course = await Course.findOne({ _id: courseId, instructor: req.user.id }).select('title students');
    if (!course && req.user.role !== 'superadmin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Get all schedules for this course to count total sessions
    const schedules = await Schedule.find({ course: courseId });
    const totalSessions = schedules.reduce((sum, s) => sum + s.sessions.length, 0);

    // Count sessions that have passed (based on schedule days since course start)
    // We'll count unique attendance dates as total possible sessions
    const allAttendance = await Attendance.find({ course: courseId })
      .populate('student', 'name email systemId profileImage gender');

    // Group by student
    const studentMap = {};
    allAttendance.forEach(a => {
      const sid = a.student?._id?.toString();
      if (!sid) return;
      if (!studentMap[sid]) {
        studentMap[sid] = { student: a.student, attended: new Set() };
      }
      studentMap[sid].attended.add(a.sessionDate.toISOString().split('T')[0]);
    });

    // Count total unique session dates across all students (= total sessions held)
    const allDates = new Set(allAttendance.map(a => a.sessionDate.toISOString().split('T')[0]));
    const totalHeld = allDates.size || 1;

    const result = Object.values(studentMap).map(({ student, attended }) => ({
      student,
      attended: attended.size,
      total: totalHeld,
      percentage: Math.round((attended.size / totalHeld) * 100)
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
    const records = await Attendance.find({ student: req.user.id, course: req.params.courseId });
    const allAttendance = await Attendance.find({ course: req.params.courseId });
    const allDates = new Set(allAttendance.map(a => a.sessionDate.toISOString().split('T')[0]));
    const totalHeld = allDates.size || 1;
    const attended = records.length;
    res.json({ success: true, attended, total: totalHeld, percentage: Math.round((attended / totalHeld) * 100) });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
