const express = require('express');
const router = express.Router();
const Schedule = require('../models/Schedule');
const Course = require('../models/Course');
const { logAdminActivity } = require('../utils/adminActivityLogger');
const auth = require('../middleware/auth');
const NotificationService = require('../utils/notificationService');

// Middleware to check admin/superadmin role
const isAdmin = (req, res, next) => {
  if (!req.user || (req.user.role !== 'admin' && req.user.role !== 'superadmin')) {
    return res.status(403).json({ success: false, message: 'Access denied' });
  }
  next();
};

// @route   GET /api/schedules
// @desc    Get all schedules
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const { course } = req.query;
    let filter = course ? { course } : {};
    
    // If instructor, only show schedules for their courses
    if (req.user.role === 'instructor') {
      const instructorCourses = await Course.find({ instructor: req.user._id || req.user.id }).select('_id');
      const courseIds = instructorCourses.map(c => c._id);
      filter = course ? { course, course: { $in: courseIds } } : { course: { $in: courseIds } };
    }
    
    const schedules = await Schedule.find(filter)
      .populate({ path: 'course', select: 'title', strictPopulate: false })
      .populate({ path: 'createdBy', select: 'name email', strictPopulate: false })
      .lean()
      .sort({ createdAt: -1 });
    
    res.json({ success: true, schedules });
  } catch (error) {
    res.json({ success: true, schedules: [] });
  }
});

// @route   GET /api/schedules/:id
// @desc    Get schedule by ID
// @access  Private (Admin/SuperAdmin)
router.get('/:id', auth, isAdmin, async (req, res) => {
  try {
    const schedule = await Schedule.findById(req.params.id)
      .populate({ path: 'course', select: 'title', strictPopulate: false })
      .populate({ path: 'createdBy', select: 'name email', strictPopulate: false })
      .lean();
    
    if (!schedule) {
      return res.status(404).json({ success: false, message: 'Schedule not found' });
    }
    
    res.json({ success: true, schedule });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/schedules
// @desc    Create new schedule
// @access  Private (Admin/SuperAdmin)
router.post('/', auth, isAdmin, async (req, res) => {
  try {
    const { course, sessions } = req.body;
    
    if (!course || !sessions || sessions.length === 0) {
      return res.status(400).json({ success: false, message: 'Course and sessions are required' });
    }
    
    const courseExists = await Course.findById(course);
    if (!courseExists) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }
    
    for (const session of sessions) {
      if (!session.day || !session.startTime || !session.endTime) {
        return res.status(400).json({ success: false, message: 'All session fields are required' });
      }
    }
    
    const schedule = await Schedule.create({
      course,
      sessions,
      createdBy: req.user._id || req.user.id
    });
    
    const populatedSchedule = await Schedule.findById(schedule._id)
      .populate({ path: 'course', select: 'title instructor', strictPopulate: false })
      .populate({ path: 'createdBy', select: 'name email', strictPopulate: false })
      .lean();
    
    // Send notification to instructor and students
    await NotificationService.notifyScheduleCreated(populatedSchedule, req.user._id || req.user.id);
    
    // Log schedule creation activity
    await logAdminActivity(
      req.user._id,
      'schedule_created',
      `Created schedule for course "${populatedSchedule.course?.title || 'Unknown'}" with ${sessions.length} session(s)`,
      'Schedule',
      schedule._id,
      { courseTitle: populatedSchedule.course?.title, sessionCount: sessions.length }
    );
    
    res.status(201).json({ success: true, schedule: populatedSchedule });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   PUT /api/schedules/:id
// @desc    Update schedule
// @access  Private (Admin/SuperAdmin)
router.put('/:id', auth, isAdmin, async (req, res) => {
  try {
    const { sessions } = req.body;
    
    if (!sessions || sessions.length === 0) {
      return res.status(400).json({ success: false, message: 'Sessions are required' });
    }
    
    for (const session of sessions) {
      if (!session.day || !session.startTime || !session.endTime) {
        return res.status(400).json({ success: false, message: 'All session fields are required' });
      }
    }
    
    const schedule = await Schedule.findByIdAndUpdate(
      req.params.id,
      { sessions },
      { new: true, runValidators: true }
    )
      .populate({ path: 'course', select: 'title instructor', strictPopulate: false })
      .populate({ path: 'createdBy', select: 'name email', strictPopulate: false })
      .lean();
    
    if (!schedule) {
      return res.status(404).json({ success: false, message: 'Schedule not found' });
    }
    
    // Send notification to instructor and students
    await NotificationService.notifyScheduleUpdated(schedule, req.user._id || req.user.id);
    
    // Log schedule update activity
    await logAdminActivity(
      req.user._id,
      'schedule_updated',
      `Updated schedule for course "${schedule.course?.title || 'Unknown'}" with ${sessions.length} session(s)`,
      'Schedule',
      schedule._id,
      { courseTitle: schedule.course?.title, sessionCount: sessions.length }
    );
    
    res.json({ success: true, schedule });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   DELETE /api/schedules/:id
// @desc    Delete schedule
// @access  Private (Admin/SuperAdmin)
router.delete('/:id', auth, isAdmin, async (req, res) => {
  try {
    const schedule = await Schedule.findById(req.params.id);
    
    if (!schedule) {
      return res.status(404).json({ success: false, message: 'Schedule not found' });
    }
    
    await schedule.deleteOne();
    
    res.json({ success: true, message: 'Schedule deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   DELETE /api/schedules/course/:courseId
// @desc    Delete all schedules for a course
// @access  Private (Admin/SuperAdmin)
router.delete('/course/:courseId', auth, isAdmin, async (req, res) => {
  try {
    const result = await Schedule.deleteMany({ course: req.params.courseId });
    
    res.json({ 
      success: true, 
      message: `${result.deletedCount} schedule(s) deleted successfully` 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   PUT /api/schedules/:id/session-link
// @desc    Add/Update session link
// @access  Private (Instructor)
router.put('/:id/session-link', auth, async (req, res) => {
  try {
    const { day, startTime, link } = req.body;
    
    if (!day || !startTime || !link) {
      return res.status(400).json({ success: false, message: 'Day, start time, and link are required' });
    }
    
    const schedule = await Schedule.findById(req.params.id).populate('course');
    
    if (!schedule) {
      return res.status(404).json({ success: false, message: 'Schedule not found' });
    }
    
    // Check if user is instructor of this course
    if (req.user.role === 'instructor' && schedule.course.instructor.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }
    
    // Find and update the session
    const sessionIndex = schedule.sessions.findIndex(s => s.day === day && s.startTime === startTime);
    
    if (sessionIndex === -1) {
      return res.status(404).json({ success: false, message: 'Session not found' });
    }
    
    schedule.sessions[sessionIndex].link = link;
    await schedule.save();
    
    // Send notification to students about session link update
    await NotificationService.notifyInstructorScheduleUpdate(schedule, req.user._id || req.user.id);
    
    res.json({ success: true, message: 'Session link updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   DELETE /api/schedules/:id/session-link
// @desc    Remove session link
// @access  Private (Instructor)
router.delete('/:id/session-link', auth, async (req, res) => {
  try {
    const { day, startTime } = req.body;
    
    if (!day || !startTime) {
      return res.status(400).json({ success: false, message: 'Day and start time are required' });
    }
    
    const schedule = await Schedule.findById(req.params.id).populate('course');
    
    if (!schedule) {
      return res.status(404).json({ success: false, message: 'Schedule not found' });
    }
    
    // Check if user is instructor of this course
    if (req.user.role === 'instructor' && schedule.course.instructor.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }
    
    // Find and update the session
    const sessionIndex = schedule.sessions.findIndex(s => s.day === day && s.startTime === startTime);
    
    if (sessionIndex === -1) {
      return res.status(404).json({ success: false, message: 'Session not found' });
    }
    
    schedule.sessions[sessionIndex].link = '';
    await schedule.save();
    
    res.json({ success: true, message: 'Session link removed successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
