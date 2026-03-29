const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Attendance = require('../models/Attendance');
const Course = require('../models/Course');

// POST /api/attendance/join
router.post('/join', auth, async (req, res) => {
  try {
    const { courseId, sessionDay, sessionStartTime } = req.body;
    if (!courseId) return res.status(400).json({ message: 'courseId required' });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Unique per student + course + date + startTime (one per session per day)
    const query = {
      student: req.user.id,
      course: courseId,
      sessionDate: today,
      sessionStartTime: sessionStartTime || 'unknown'
    };

    const existing = await Attendance.findOne(query);
    if (!existing) {
      await Attendance.create({
        ...query,
        sessionDay: sessionDay || null,
        joinedAt: new Date()
      });
    }

    res.json({ success: true, message: existing ? 'Already recorded' : 'Attendance recorded' });
  } catch (error) {
    console.error('Attendance join error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Helper: unique session key = date + startTime
const sessionKey = (date, startTime) => `${date}__${startTime || 'unknown'}`;

// GET /api/attendance/course/:courseId — instructor view
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

    const allAttendance = await Attendance.find({ course: courseId })
      .populate('student', 'name email systemId profileImage gender');

    // Total = unique (date + startTime) combos across all records
    const allSessions = new Set(
      allAttendance.map(a => sessionKey(
        a.sessionDate.toISOString().split('T')[0],
        a.sessionStartTime
      ))
    );
    const totalHeld = Math.max(allSessions.size, 1);

    // Group by student — count unique sessions they attended
    const studentMap = {};
    allAttendance.forEach(a => {
      const sid = a.student?._id?.toString();
      if (!sid) return;
      if (!studentMap[sid]) studentMap[sid] = { student: a.student, sessions: new Set() };
      studentMap[sid].sessions.add(sessionKey(
        a.sessionDate.toISOString().split('T')[0],
        a.sessionStartTime
      ));
    });

    const result = Object.values(studentMap).map(({ student, sessions }) => ({
      student,
      attended: sessions.size,
      total: totalHeld,
      percentage: Math.min(100, Math.round((sessions.size / totalHeld) * 100))
    }));

    res.json({ success: true, attendance: result, totalSessions: totalHeld });
  } catch (error) {
    console.error('Get attendance error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/attendance/my/:courseId — student view
router.get('/my/:courseId', auth, async (req, res) => {
  try {
    const allAttendance = await Attendance.find({ course: req.params.courseId });
    const allSessions = new Set(
      allAttendance.map(a => sessionKey(
        a.sessionDate.toISOString().split('T')[0],
        a.sessionStartTime
      ))
    );
    const totalHeld = Math.max(allSessions.size, 1);

    const myRecords = await Attendance.find({ student: req.user.id, course: req.params.courseId });
    const mySessions = new Set(
      myRecords.map(a => sessionKey(
        a.sessionDate.toISOString().split('T')[0],
        a.sessionStartTime
      ))
    );

    res.json({
      success: true,
      attended: mySessions.size,
      total: totalHeld,
      percentage: Math.min(100, Math.round((mySessions.size / totalHeld) * 100))
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
