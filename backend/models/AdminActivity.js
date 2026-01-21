const mongoose = require('mongoose');

const adminActivitySchema = new mongoose.Schema({
  admin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  action: {
    type: String,
    required: true,
    enum: [
      'user_created',
      'user_deleted', 
      'course_created',
      'course_updated',
      'course_deleted',
      'schedule_created',
      'schedule_updated',
      'contact_replied',
      'review_moderated',
      'notification_sent',
      'admin_created',
      'permissions_updated',
      'category_created',
      'category_updated',
      'category_deleted',
      'reel_uploaded',
      'reel_deleted',
      'login'
    ]
  },
  description: {
    type: String,
    required: true
  },
  targetType: {
    type: String,
    enum: ['User', 'Course', 'Schedule', 'Contact', 'Review', 'Category', 'Reel', 'Notification'],
    required: false
  },
  targetId: {
    type: mongoose.Schema.Types.ObjectId,
    required: false
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true
});

// Index for efficient querying
adminActivitySchema.index({ createdAt: -1 });
adminActivitySchema.index({ admin: 1, createdAt: -1 });

module.exports = mongoose.model('AdminActivity', adminActivitySchema);