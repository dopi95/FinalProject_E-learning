const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Assignment = require('../models/Assignment');
const auth = require('../middleware/auth');

// Local storage for assignment files
const assignmentStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, '../uploads/assignments');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  }
});

// Local storage for submission files
const submissionStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, '../uploads/submissions');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  }
});

const uploadAssignment = multer({ storage: assignmentStorage, limits: { fileSize: 100 * 1024 * 1024 } });
const uploadSubmission = multer({ storage: submissionStorage, limits: { fileSize: 100 * 1024 * 1024 } });

const getBaseUrl = (req) => `${req.protocol}://${req.get('host')}`;

// @route   GET /api/assignments/instructor
router.get('/instructor', auth, async (req, res) => {
  try {
    if (req.user.role !== 'instructor') return res.status(403).json({ message: 'Access denied.' });
    const assignments = await Assignment.find({ instructor: req.user.id })
      .populate('submissions.student', 'name email')
      .sort({ createdAt: -1 });
    res.json({ success: true, assignments });
  } catch (error) {
    console.error('Get instructor assignments error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/assignments
router.post('/', auth, uploadAssignment.single('file'), async (req, res) => {
  try {
    if (req.user.role !== 'instructor') return res.status(403).json({ message: 'Access denied.' });
    const { title, instructions, dueDate, course, totalMarks, weightMarks } = req.body;
    if (!title || !instructions || !dueDate || !course || !req.file) {
      return res.status(400).json({ message: 'Title, instructions, due date, course, and file are required' });
    }
    const marks = parseInt(totalMarks) || 100;
    const weight = parseInt(weightMarks) || 10;
    const fileUrl = `${getBaseUrl(req)}/uploads/assignments/${req.file.filename}`;
    const assignment = new Assignment({
      title, instructions, dueDate: new Date(dueDate),
      totalMarks: marks, weightMarks: weight, course,
      instructor: req.user.id,
      file: { fileName: req.file.originalname, fileUrl, fileType: req.file.mimetype, fileSize: req.file.size }
    });
    await assignment.save();
    res.status(201).json({ success: true, message: 'Assignment created successfully', assignment });
  } catch (error) {
    console.error('Create assignment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/assignments/:id
router.put('/:id', auth, uploadAssignment.single('file'), async (req, res) => {
  try {
    if (req.user.role !== 'instructor') return res.status(403).json({ message: 'Access denied.' });
    const assignment = await Assignment.findOne({ _id: req.params.id, instructor: req.user.id });
    if (!assignment) return res.status(404).json({ message: 'Assignment not found' });
    const { title, instructions, dueDate } = req.body;
    if (title) assignment.title = title;
    if (instructions) assignment.instructions = instructions;
    if (dueDate) assignment.dueDate = new Date(dueDate);
    if (req.file) {
      // Delete old file if local
      if (assignment.file?.fileUrl?.includes('/uploads/')) {
        const oldPath = path.join(__dirname, '../uploads/assignments', path.basename(assignment.file.fileUrl));
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }
      assignment.file = {
        fileName: req.file.originalname,
        fileUrl: `${getBaseUrl(req)}/uploads/assignments/${req.file.filename}`,
        fileType: req.file.mimetype,
        fileSize: req.file.size
      };
    }
    await assignment.save();
    res.json({ success: true, message: 'Assignment updated successfully', assignment });
  } catch (error) {
    console.error('Update assignment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/assignments/:id/send
router.post('/:id/send', auth, async (req, res) => {
  try {
    if (req.user.role !== 'instructor') return res.status(403).json({ message: 'Access denied.' });
    const assignment = await Assignment.findOne({ _id: req.params.id, instructor: req.user.id }).populate('course');
    if (!assignment) return res.status(404).json({ message: 'Assignment not found' });
    if (assignment.status === 'active') return res.status(400).json({ message: 'Already sent' });
    const Enrollment = require('../models/Enrollment');
    const enrollments = await Enrollment.find({ course: assignment.course._id, status: 'active' });
    const count = enrollments.length;
    if (count === 0) return res.status(400).json({ message: 'No students enrolled' });
    assignment.status = 'active';
    assignment.sentAt = new Date();
    assignment.sentToStudents = count;
    await assignment.save();
    res.json({ success: true, message: `Assignment sent to ${count} students`, assignment, studentsCount: count });
  } catch (error) {
    console.error('Send assignment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/assignments/student
router.get('/student', auth, async (req, res) => {
  try {
    if (req.user.role !== 'student') return res.status(403).json({ message: 'Access denied.' });
    const Enrollment = require('../models/Enrollment');
    const enrollments = await Enrollment.find({ user: req.user.id }).populate('course');
    const courseIds = enrollments.map(e => e.course._id);
    const assignments = await Assignment.find({ course: { $in: courseIds }, status: 'active' })
      .populate('course', 'title').populate('instructor', 'name').sort({ createdAt: -1 });
    const assignmentsWithStatus = assignments.map(assignment => {
      const submission = assignment.submissions.find(s => s.student.toString() === req.user.id);
      return {
        ...assignment.toObject(),
        submissionStatus: submission ? (submission.grade !== undefined ? 'graded' : 'submitted') : 'pending',
        submission: submission || null
      };
    });
    res.json({ success: true, assignments: assignmentsWithStatus });
  } catch (error) {
    console.error('Get student assignments error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/assignments/:id/submit
router.post('/:id/submit', auth, uploadSubmission.single('file'), async (req, res) => {
  try {
    if (req.user.role !== 'student') return res.status(403).json({ message: 'Access denied.' });
    if (!req.file) return res.status(400).json({ message: 'File is required' });
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) return res.status(404).json({ message: 'Assignment not found' });
    if (assignment.status !== 'active') return res.status(400).json({ message: 'Assignment is not active' });
    if (new Date() > assignment.dueDate) return res.status(400).json({ message: 'Deadline has passed' });
    if (assignment.submissions.find(s => s.student.toString() === req.user.id)) {
      return res.status(400).json({ message: 'Already submitted' });
    }
    const fileUrl = `${getBaseUrl(req)}/uploads/submissions/${req.file.filename}`;
    assignment.submissions.push({
      student: req.user.id,
      file: { fileName: req.file.originalname, fileUrl, fileType: req.file.mimetype, fileSize: req.file.size }
    });
    await assignment.save();
    res.json({ success: true, message: 'Assignment submitted successfully' });
  } catch (error) {
    console.error('Submit assignment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/assignments/:assignmentId/grade/:submissionId
router.put('/:assignmentId/grade/:submissionId', auth, async (req, res) => {
  try {
    if (req.user.role !== 'instructor') return res.status(403).json({ message: 'Access denied.' });
    const { grade, feedback } = req.body;
    const assignment = await Assignment.findOne({ _id: req.params.assignmentId, instructor: req.user.id });
    if (!assignment) return res.status(404).json({ message: 'Assignment not found' });
    const submission = assignment.submissions.id(req.params.submissionId);
    if (!submission) return res.status(404).json({ message: 'Submission not found' });
    submission.grade = grade;
    submission.feedback = feedback || '';
    submission.gradedAt = new Date();
    submission.gradedBy = req.user.id;
    await assignment.save();
    res.json({ success: true, message: 'Graded successfully' });
  } catch (error) {
    console.error('Grade assignment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/assignments/:assignmentId/download/:submissionId (instructor)
router.get('/:assignmentId/download/:submissionId', auth, async (req, res) => {
  try {
    if (req.user.role !== 'instructor') return res.status(403).json({ message: 'Access denied.' });
    const assignment = await Assignment.findOne({ _id: req.params.assignmentId, instructor: req.user.id });
    if (!assignment) return res.status(404).json({ message: 'Assignment not found' });
    const submission = assignment.submissions.id(req.params.submissionId);
    if (!submission?.file) return res.status(404).json({ message: 'Submission file not found' });
    const filePath = path.join(__dirname, '../uploads/submissions', path.basename(submission.file.fileUrl));
    if (!fs.existsSync(filePath)) return res.status(404).json({ message: 'File not found on server' });
    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(submission.file.fileName)}"`);
    res.setHeader('Content-Type', submission.file.fileType || 'application/octet-stream');
    res.sendFile(filePath);
  } catch (error) {
    console.error('Download submission error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/assignments/file-info/:assignmentId
router.get('/file-info/:assignmentId', auth, async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.assignmentId);
    if (!assignment?.file) return res.status(404).json({ message: 'Assignment file not found' });
    res.json({ success: true, file: { url: assignment.file.fileUrl, fileName: assignment.file.fileName, fileType: assignment.file.fileType, fileSize: assignment.file.fileSize } });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/assignments/submission-info/:assignmentId
router.get('/submission-info/:assignmentId', auth, async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.assignmentId);
    if (!assignment) return res.status(404).json({ message: 'Assignment not found' });
    const submission = assignment.submissions.find(s => s.student.toString() === req.user.id);
    if (!submission?.file) return res.status(404).json({ message: 'Submission not found' });
    res.json({ success: true, file: { url: submission.file.fileUrl, fileName: submission.file.fileName, fileType: submission.file.fileType, fileSize: submission.file.fileSize } });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/assignments/download/:assignmentId (student or instructor)
router.get('/download/:assignmentId', auth, async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.assignmentId);
    if (!assignment?.file) return res.status(404).json({ message: 'Assignment file not found' });
    const filePath = path.join(__dirname, '../uploads/assignments', path.basename(assignment.file.fileUrl));
    if (!fs.existsSync(filePath)) return res.status(404).json({ message: 'File not found on server' });
    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(assignment.file.fileName)}"`);
    res.setHeader('Content-Type', assignment.file.fileType || 'application/octet-stream');
    res.sendFile(filePath);
  } catch (error) {
    console.error('Download assignment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/assignments/download-submission/:assignmentId (student)
router.get('/download-submission/:assignmentId', auth, async (req, res) => {
  try {
    if (req.user.role !== 'student') return res.status(403).json({ message: 'Access denied.' });
    const assignment = await Assignment.findById(req.params.assignmentId);
    if (!assignment) return res.status(404).json({ message: 'Assignment not found' });
    const submission = assignment.submissions.find(s => s.student.toString() === req.user.id);
    if (!submission?.file) return res.status(404).json({ message: 'Submission file not found' });
    const filePath = path.join(__dirname, '../uploads/submissions', path.basename(submission.file.fileUrl));
    if (!fs.existsSync(filePath)) return res.status(404).json({ message: 'File not found on server' });
    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(submission.file.fileName)}"`);
    res.setHeader('Content-Type', submission.file.fileType || 'application/octet-stream');
    res.sendFile(filePath);
  } catch (error) {
    console.error('Download submission error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/assignments/:id
router.delete('/:id', auth, async (req, res) => {
  try {
    if (req.user.role !== 'instructor') return res.status(403).json({ message: 'Access denied.' });
    const assignment = await Assignment.findOneAndDelete({ _id: req.params.id, instructor: req.user.id });
    if (assignment?.file?.fileUrl?.includes('/uploads/')) {
      const filePath = path.join(__dirname, '../uploads/assignments', path.basename(assignment.file.fileUrl));
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }
    res.json({ success: true, message: 'Assignment deleted successfully' });
  } catch (error) {
    console.error('Delete assignment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
