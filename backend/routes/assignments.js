const express = require('express');
const router = express.Router();
const multer = require('multer');
const cloudinary = require('../config/cloudinary');
const Assignment = require('../models/Assignment');
const auth = require('../middleware/auth');

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 100 * 1024 * 1024 }
});

// @route   GET /api/assignments/instructor
// @desc    Get assignments for instructor
// @access  Private (Instructor)
router.get('/instructor', auth, async (req, res) => {
  try {
    if (req.user.role !== 'instructor') {
      return res.status(403).json({ message: 'Access denied. Instructor role required.' });
    }

    const assignments = await Assignment.find({ instructor: req.user.id })
      .populate('submissions.student', 'name email')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      assignments
    });
  } catch (error) {
    console.error('Get instructor assignments error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/assignments
// @desc    Create new assignment
// @access  Private (Instructor)
router.post('/', auth, upload.single('file'), async (req, res) => {
  try {
    if (req.user.role !== 'instructor') {
      return res.status(403).json({ message: 'Access denied. Instructor role required.' });
    }

    const { title, instructions, dueDate, course, totalMarks, weightMarks } = req.body;

    if (!title || !instructions || !dueDate || !course || !req.file) {
      return res.status(400).json({ 
        message: 'Title, instructions, due date, course, and file are required' 
      });
    }

    // Validate totalMarks
    const marks = parseInt(totalMarks) || 100;
    if (marks < 1 || marks > 100) {
      return res.status(400).json({ 
        message: 'Total marks must be between 1 and 100' 
      });
    }

    // Validate weightMarks
    const weight = parseInt(weightMarks) || 10;
    if (weight < 1 || weight > 100) {
      return res.status(400).json({ 
        message: 'Weight marks must be between 1 and 100' 
      });
    }

    // Upload file to cloudinary
    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        { resource_type: 'auto', folder: 'assignments' },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      ).end(req.file.buffer);
    });

    const assignment = new Assignment({
      title,
      instructions,
      dueDate: new Date(dueDate),
      totalMarks: marks,
      weightMarks: weight,
      course,
      instructor: req.user.id,
      file: {
        fileName: req.file.originalname,
        fileUrl: result.secure_url,
        fileType: req.file.mimetype,
        fileSize: req.file.size
      }
    });

    await assignment.save();

    res.status(201).json({
      success: true,
      message: 'Assignment created successfully',
      assignment
    });
  } catch (error) {
    console.error('Create assignment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/assignments/:id
// @desc    Update assignment
// @access  Private (Instructor)
router.put('/:id', auth, upload.single('file'), async (req, res) => {
  try {
    if (req.user.role !== 'instructor') {
      return res.status(403).json({ message: 'Access denied. Instructor role required.' });
    }

    const assignment = await Assignment.findOne({
      _id: req.params.id,
      instructor: req.user.id
    });

    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    const { title, instructions, dueDate } = req.body;

    // Update fields
    if (title) assignment.title = title;
    if (instructions) assignment.instructions = instructions;
    if (dueDate) assignment.dueDate = new Date(dueDate);

    // Handle file upload if provided
    if (req.file) {
      const result = await new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
          { resource_type: 'auto', folder: 'assignments' },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        ).end(req.file.buffer);
      });

      assignment.file = {
        fileName: req.file.originalname,
        fileUrl: result.secure_url,
        fileType: req.file.mimetype,
        fileSize: req.file.size
      };
    }

    await assignment.save();

    res.json({
      success: true,
      message: 'Assignment updated successfully',
      assignment
    });
  } catch (error) {
    console.error('Update assignment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/assignments/:id/send
// @desc    Send assignment to enrolled students
// @access  Private (Instructor)
router.post('/:id/send', auth, async (req, res) => {
  try {
    if (req.user.role !== 'instructor') {
      return res.status(403).json({ message: 'Access denied. Instructor role required.' });
    }

    const assignment = await Assignment.findOne({
      _id: req.params.id,
      instructor: req.user.id
    }).populate('course');

    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    if (assignment.status === 'active') {
      return res.status(400).json({ message: 'Assignment has already been sent to students' });
    }

    // Get enrolled students for this course
    const Enrollment = require('../models/Enrollment');
    const enrollments = await Enrollment.find({ 
      course: assignment.course._id,
      status: 'active' // Only active enrollments
    }).populate('user', 'name email');
    
    const enrolledStudents = enrollments.map(e => e.user);
    const enrolledStudentCount = enrolledStudents.length;

    if (enrolledStudentCount === 0) {
      return res.status(400).json({ message: 'No students are enrolled in this course' });
    }

    // Update assignment status to active
    assignment.status = 'active';
    assignment.sentAt = new Date();
    assignment.sentToStudents = enrolledStudentCount;
    await assignment.save();

    res.json({
      success: true,
      message: `Assignment sent to ${enrolledStudentCount} enrolled students successfully`,
      assignment,
      studentsCount: enrolledStudentCount
    });
  } catch (error) {
    console.error('Send assignment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/assignments/student
// @desc    Get assignments for student
// @access  Private (Student)
router.get('/student', auth, async (req, res) => {
  try {
    if (req.user.role !== 'student') {
      return res.status(403).json({ message: 'Access denied. Student role required.' });
    }

    const Enrollment = require('../models/Enrollment');
    
    // Get student's enrolled courses (only active enrollments)
    const enrollments = await Enrollment.find({ 
      user: req.user.id, 
      status: 'active' 
    }).populate('course');
    const courseIds = enrollments.map(e => e.course._id);

    // Get assignments for enrolled courses
    const assignments = await Assignment.find({
      course: { $in: courseIds },
      status: 'active'
    })
    .populate('course', 'title')
    .populate('instructor', 'name')
    .sort({ createdAt: -1 });

    // Add submission status for each assignment
    const assignmentsWithStatus = assignments.map(assignment => {
      const submission = assignment.submissions.find(s => s.student.toString() === req.user.id);
      return {
        ...assignment.toObject(),
        submissionStatus: submission ? (submission.grade !== undefined ? 'graded' : 'submitted') : 'pending',
        submission: submission || null
      };
    });

    res.json({
      success: true,
      assignments: assignmentsWithStatus
    });
  } catch (error) {
    console.error('Get student assignments error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/assignments/:id/submit
// @desc    Submit assignment (student)
// @access  Private (Student)
router.post('/:id/submit', auth, upload.single('file'), async (req, res) => {
  try {
    if (req.user.role !== 'student') {
      return res.status(403).json({ message: 'Access denied. Student role required.' });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'File is required' });
    }

    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    // Check if assignment is still active and not overdue
    if (assignment.status !== 'active') {
      return res.status(400).json({ message: 'Assignment is not active' });
    }

    if (new Date() > assignment.dueDate) {
      return res.status(400).json({ message: 'Assignment deadline has passed' });
    }

    // Check if student already submitted
    const existingSubmission = assignment.submissions.find(s => s.student.toString() === req.user.id);
    if (existingSubmission) {
      return res.status(400).json({ message: 'You have already submitted this assignment' });
    }

    // Upload file to cloudinary
    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        { resource_type: 'auto', folder: 'assignment-submissions' },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      ).end(req.file.buffer);
    });

    // Add submission to assignment
    assignment.submissions.push({
      student: req.user.id,
      file: {
        fileName: req.file.originalname,
        fileUrl: result.secure_url,
        fileType: req.file.mimetype,
        fileSize: req.file.size
      }
    });

    await assignment.save();

    res.json({
      success: true,
      message: 'Assignment submitted successfully'
    });
  } catch (error) {
    console.error('Submit assignment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/assignments/:assignmentId/grade/:submissionId
// @desc    Grade assignment submission (instructor)
// @access  Private (Instructor)
router.put('/:assignmentId/grade/:submissionId', auth, async (req, res) => {
  try {
    if (req.user.role !== 'instructor') {
      return res.status(403).json({ message: 'Access denied. Instructor role required.' });
    }

    const { grade, feedback } = req.body;

    const assignment = await Assignment.findOne({
      _id: req.params.assignmentId,
      instructor: req.user.id
    });

    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    const totalMarks = assignment.totalMarks || 100;
    
    if (grade === undefined || grade < 0 || grade > totalMarks) {
      return res.status(400).json({ message: `Valid grade (0-${totalMarks}) is required` });
    }

    const submission = assignment.submissions.id(req.params.submissionId);
    if (!submission) {
      return res.status(404).json({ message: 'Submission not found' });
    }

    // Update submission with grade
    submission.grade = grade;
    submission.feedback = feedback || '';
    submission.gradedAt = new Date();
    submission.gradedBy = req.user.id;

    await assignment.save();

    res.json({
      success: true,
      message: 'Assignment graded successfully'
    });
  } catch (error) {
    console.error('Grade assignment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/assignments/:assignmentId/download/:submissionId
// @desc    Download submission file
// @access  Private (Instructor)
router.get('/:assignmentId/download/:submissionId', auth, async (req, res) => {
  try {
    if (req.user.role !== 'instructor') {
      return res.status(403).json({ message: 'Access denied. Instructor role required.' });
    }

    const assignment = await Assignment.findOne({
      _id: req.params.assignmentId,
      instructor: req.user.id
    });

    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    const submission = assignment.submissions.id(req.params.submissionId);
    if (!submission || !submission.file) {
      return res.status(404).json({ message: 'Submission file not found' });
    }

    // Set proper headers for file download
    const fileName = submission.file.fileName;
    const fileType = submission.file.fileType || 'application/octet-stream';
    
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.setHeader('Content-Type', fileType);
    
    // Return file info for frontend to handle download
    res.json({
      success: true,
      file: {
        url: submission.file.fileUrl,
        fileName: submission.file.fileName,
        fileType: submission.file.fileType,
        fileSize: submission.file.fileSize
      }
    });
  } catch (error) {
    console.error('Download submission error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/assignments/download/:assignmentId
// @desc    Download assignment file (student)
// @access  Private (Student)
router.get('/download/:assignmentId', auth, async (req, res) => {
  try {
    if (req.user.role !== 'student') {
      return res.status(403).json({ message: 'Access denied. Student role required.' });
    }

    const assignment = await Assignment.findById(req.params.assignmentId);
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    if (!assignment.file) {
      return res.status(404).json({ message: 'Assignment file not found' });
    }

    // Set proper headers for file download
    const fileName = assignment.file.fileName;
    const fileType = assignment.file.fileType || 'application/octet-stream';
    
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.setHeader('Content-Type', fileType);
    
    // Return file info for frontend to handle download
    res.json({
      success: true,
      file: {
        url: assignment.file.fileUrl,
        fileName: assignment.file.fileName,
        fileType: assignment.file.fileType,
        fileSize: assignment.file.fileSize
      }
    });
  } catch (error) {
    console.error('Download assignment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/assignments/download-submission/:assignmentId
// @desc    Download student's own submission file
// @access  Private (Student)
router.get('/download-submission/:assignmentId', auth, async (req, res) => {
  try {
    if (req.user.role !== 'student') {
      return res.status(403).json({ message: 'Access denied. Student role required.' });
    }

    const assignment = await Assignment.findById(req.params.assignmentId);
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    // Find student's own submission
    const submission = assignment.submissions.find(s => s.student.toString() === req.user.id);
    if (!submission || !submission.file) {
      return res.status(404).json({ message: 'Submission file not found' });
    }

    // Set proper headers for file download
    const fileName = submission.file.fileName;
    const fileType = submission.file.fileType || 'application/octet-stream';
    
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.setHeader('Content-Type', fileType);
    
    // Return file info for frontend to handle download
    res.json({
      success: true,
      file: {
        url: submission.file.fileUrl,
        fileName: submission.file.fileName,
        fileType: submission.file.fileType,
        fileSize: submission.file.fileSize
      }
    });
  } catch (error) {
    console.error('Download submission error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/assignments/:id
// @desc    Delete assignment
// @access  Private (Instructor)
router.delete('/:id', auth, async (req, res) => {
  try {
    if (req.user.role !== 'instructor') {
      return res.status(403).json({ message: 'Access denied. Instructor role required.' });
    }

    await Assignment.findOneAndDelete({
      _id: req.params.id,
      instructor: req.user.id
    });

    res.json({
      success: true,
      message: 'Assignment deleted successfully'
    });
  } catch (error) {
    console.error('Delete assignment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;