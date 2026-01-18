const mongoose = require('mongoose');

const assignmentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  instructions: {
    type: String,
    required: true
  },
  dueDate: {
    type: Date,
    required: true
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  instructor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  file: {
    fileName: String,
    fileUrl: String,
    fileType: String,
    fileSize: Number
  },
  status: {
    type: String,
    enum: ['active', 'draft', 'closed'],
    default: 'active'
  },
  submissions: [{
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    submittedAt: {
      type: Date,
      default: Date.now
    },
    file: {
      fileName: String,
      fileUrl: String,
      fileType: String,
      fileSize: Number
    },
    grade: {
      type: Number,
      min: 0,
      max: 100
    },
    feedback: String,
    gradedAt: Date,
    gradedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }]
}, {
  timestamps: true
});

// Index for better query performance
assignmentSchema.index({ course: 1, instructor: 1 });
assignmentSchema.index({ dueDate: 1 });

module.exports = mongoose.model('Assignment', assignmentSchema);