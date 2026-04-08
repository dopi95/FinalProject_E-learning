const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  about: {
    type: String,
    required: true,
    trim: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  category: {
    type: String,
    required: true
  },
  instructor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  image: {
    type: String,
    default: null
  },
  startDate: {
    type: Date,
    default: null
  },
  endDate: {
    type: Date,
    default: null
  },
  students: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  stars: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  totalHours: {
    type: Number,
    default: null
  }
}, {
  timestamps: true
});

courseSchema.virtual('studentCount').get(function() {
  return this.students.length;
});

courseSchema.virtual('starCount').get(function() {
  return this.stars.length;
});

courseSchema.virtual('commentCount').get(function() {
  return this.comments || 0;
});

courseSchema.virtual('courseStatus').get(function() {
  const now = new Date();
  if (!this.startDate || !this.endDate) {
    return 'active';
  }
  if (now < this.startDate) {
    return 'not_started';
  }
  // Set time to end of day for endDate comparison
  const endOfDay = new Date(this.endDate);
  endOfDay.setHours(23, 59, 59, 999);
  if (now > endOfDay) {
    return 'closed';
  }
  return 'active';
});

courseSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Course', courseSchema);