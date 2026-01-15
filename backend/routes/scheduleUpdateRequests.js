const express = require('express');
const router = express.Router();
const ScheduleUpdateRequest = require('../models/ScheduleUpdateRequest');
const Schedule = require('../models/Schedule');
const auth = require('../middleware/auth');

const isAdmin = (req, res, next) => {
  if (!req.user || (req.user.role !== 'admin' && req.user.role !== 'superadmin')) {
    return res.status(403).json({ success: false, message: 'Access denied' });
  }
  next();
};

// @route   POST /api/schedule-update-requests
// @desc    Create schedule update request (Instructor)
// @access  Private (Instructor)
router.post('/', auth, async (req, res) => {
  try {
    const { schedule, course, newSessions, reason } = req.body;
    
    if (!schedule || !course || !newSessions || newSessions.length === 0 || !reason) {
      return res.status(400).json({ success: false, message: 'All fields including reason are required' });
    }
    
    const updateRequest = await ScheduleUpdateRequest.create({
      schedule,
      course,
      requestedBy: req.user._id || req.user.id,
      newSessions,
      reason,
      status: 'pending'
    });
    
    const populatedRequest = await ScheduleUpdateRequest.findById(updateRequest._id)
      .populate({ path: 'course', select: 'title' })
      .populate({ path: 'requestedBy', select: 'name email' })
      .lean();
    
    res.status(201).json({ success: true, request: populatedRequest });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/schedule-update-requests
// @desc    Get all schedule update requests
// @access  Private (Admin/SuperAdmin)
router.get('/', auth, isAdmin, async (req, res) => {
  try {
    const requests = await ScheduleUpdateRequest.find()
      .populate({ path: 'course', select: 'title' })
      .populate({ path: 'schedule' })
      .populate({ path: 'requestedBy', select: 'name email' })
      .populate({ path: 'reviewedBy', select: 'name email' })
      .sort({ createdAt: -1 })
      .lean();
    
    res.json({ success: true, requests });
  } catch (error) {
    res.json({ success: true, requests: [] });
  }
});

// @route   GET /api/schedule-update-requests/my-requests
// @desc    Get instructor's own requests
// @access  Private (Instructor)
router.get('/my-requests', auth, async (req, res) => {
  try {
    const requests = await ScheduleUpdateRequest.find({ 
      requestedBy: req.user._id || req.user.id,
      dismissed: false
    })
      .populate({ path: 'course', select: 'title' })
      .populate({ path: 'reviewedBy', select: 'name email' })
      .sort({ createdAt: -1 })
      .lean();
    
    res.json({ success: true, requests });
  } catch (error) {
    res.json({ success: true, requests: [] });
  }
});

// @route   PUT /api/schedule-update-requests/:id/approve
// @desc    Approve schedule update request
// @access  Private (Admin/SuperAdmin)
router.put('/:id/approve', auth, isAdmin, async (req, res) => {
  try {
    const updateRequest = await ScheduleUpdateRequest.findById(req.params.id);
    
    if (!updateRequest) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }
    
    if (updateRequest.status !== 'pending') {
      return res.status(400).json({ success: false, message: 'Request already processed' });
    }
    
    // Update the schedule
    await Schedule.findByIdAndUpdate(updateRequest.schedule, {
      sessions: updateRequest.newSessions
    });
    
    // Update request status
    updateRequest.status = 'approved';
    updateRequest.reviewedBy = req.user._id || req.user.id;
    updateRequest.reviewedAt = new Date();
    await updateRequest.save();
    
    // Send notification to instructor
    const Notification = require('../models/Notification');
    const populatedReq = await ScheduleUpdateRequest.findById(updateRequest._id).populate('course');
    await Notification.create({
      user: updateRequest.requestedBy,
      title: 'Schedule Update Approved',
      message: `Your schedule update request for "${populatedReq.course.title}" has been approved.`,
      type: 'success'
    });
    
    const populatedRequest = await ScheduleUpdateRequest.findById(updateRequest._id)
      .populate({ path: 'course', select: 'title' })
      .populate({ path: 'requestedBy', select: 'name email' })
      .populate({ path: 'reviewedBy', select: 'name email' })
      .lean();
    
    res.json({ success: true, request: populatedRequest });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   PUT /api/schedule-update-requests/:id/reject
// @desc    Reject schedule update request
// @access  Private (Admin/SuperAdmin)
router.put('/:id/reject', auth, isAdmin, async (req, res) => {
  try {
    const { reason } = req.body;
    
    if (!reason || reason.trim() === '') {
      return res.status(400).json({ success: false, message: 'Rejection reason is required' });
    }
    
    const updateRequest = await ScheduleUpdateRequest.findById(req.params.id);
    
    if (!updateRequest) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }
    
    if (updateRequest.status !== 'pending') {
      return res.status(400).json({ success: false, message: 'Request already processed' });
    }
    
    updateRequest.status = 'rejected';
    updateRequest.reviewedBy = req.user._id || req.user.id;
    updateRequest.reviewedAt = new Date();
    updateRequest.rejectionReason = reason;
    await updateRequest.save();
    
    // Send notification to instructor
    const Notification = require('../models/Notification');
    const populatedReq = await ScheduleUpdateRequest.findById(updateRequest._id).populate('course');
    await Notification.create({
      user: updateRequest.requestedBy,
      title: 'Schedule Update Rejected',
      message: `Your schedule update request for "${populatedReq.course.title}" has been rejected. Reason: ${reason}`,
      type: 'error'
    });
    
    const populatedRequest = await ScheduleUpdateRequest.findById(updateRequest._id)
      .populate({ path: 'course', select: 'title' })
      .populate({ path: 'requestedBy', select: 'name email' })
      .populate({ path: 'reviewedBy', select: 'name email' })
      .lean();
    
    res.json({ success: true, request: populatedRequest });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   PUT /api/schedule-update-requests/:id/dismiss
// @desc    Dismiss schedule update request notification
// @access  Private (Instructor)
router.put('/:id/dismiss', auth, async (req, res) => {
  try {
    const updateRequest = await ScheduleUpdateRequest.findById(req.params.id);
    
    if (!updateRequest) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }
    
    if (updateRequest.requestedBy.toString() !== (req.user._id || req.user.id).toString()) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }
    
    updateRequest.dismissed = true;
    await updateRequest.save();
    
    res.json({ success: true, message: 'Request dismissed' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
