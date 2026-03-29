const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Attendance = require('../models/Attendance');
const Schedule = require('../models/Schedule');
const Course = require('../models/Course');

// Helper: count how many scheduled sessions have occurred up to today
const countPassedSessions = (schedules) => {
  const today = new Date();
  const dayMap = { sunday: 0, monday: 1, tuesday: 2, wednesday: 3, thursday: 4, friday: 5, saturday: 6 };
  const passedDates = new Set();

  schedules.forEach(schedule => {
    schedule.sessions.forEach(session => {
      const targetDay = dayMap[session.day?.toLowerCase()];
      if (targetDay === undefined) return;
      // Go back up to 16 weeks to find all past occurrences of this day
      for (let weeksBack = 0; weeksBack <= 16; weeksBack++) {
        const d = new Date(today);
        d.setDate(today.getDate() - (((today.getDay() - targetDay + 7) % 7) + weeksBack * 7));
        d.setHours(0, 0, 0, 0);
        if (d <= today) {
          passedDates.add(d.toISOString().split('T')[0]);
        }
      }
    });
  });

  return passedDates.size;
};

// POST /api/attendance/join — student records attendance when joining a session
router.post('/join', auth, async (req, res) => {
  try {
    const { courseId, scheduleId, sessionDay } = req.body;
    if (!courseId) return res.status(400).json({ message: 'courseId required' });

    // Use today's date only (no time) to prevent duplicates per day
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

    // Allow instructor who owns the course or superadmin
    const course = await Course.findById(courseId).select('title students instructor');
    if (!course) return res.status(404).json({ message: 'Course not found' });
    if (req.user.role !== 'superadmin' && course.instructor?.toString() !== (req.user._id || req.user.id)?.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Count total sessions that have passed based on schedule
    const schedules = await Schedule.find({ course: courseId });
    const totalHeld = Math.max(countPassedSessions(schedules), 1);

    // Get all attendance records for this course
    const allAttendance = await Attendance.find({ course: courseId })
      .populate('student', 'name email systemId profileImage gender');

    // Group by student
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
    const schedules = await Schedule.find({ course: req.params.courseId });
    const totalHeld = Math.max(countPassedSessions(schedules), 1);
    const records = await Attendance.find({ student: req.user.id, course: req.params.courseId });
    const uniqueDates = new Set(records.map(r => r.sessionDate.toISOString().split('T')[0]));
    const attended = uniqueDates.size;
    res.json({
      success: true,
      attended,
      total: totalHeld,
      percentage: Math.min(100, Math.round((attended / totalHeld) * 100))
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
