const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  message: {
    type: String,
    required: true,
    trim: true
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  recipients: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    read: {
      type: Boolean,
      default: false
    },
    readAt: {
      type: Date
    }
  }],
  targetRole: {
    type: String,
    enum: ['all', 'student', 'instructor', 'admin'],
    default: 'all'
  },
  type: {
    type: String,
    enum: ['info', 'success', 'warning', 'error'],
    default: 'info'
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course'
  }
}, {
  timestamps: true
});

// Index for better query performance
notificationSchema.index({ 'recipients.user': 1, createdAt: -1 });
notificationSchema.index({ sender: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);