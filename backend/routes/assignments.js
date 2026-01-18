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

    const { title, instructions, dueDate, course } = req.body;

    if (!title || !instructions || !dueDate || !course || !req.file) {
      return res.status(400).json({ 
        message: 'Title, instructions, due date, course, and file are required' 
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