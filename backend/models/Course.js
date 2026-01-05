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
  registrationStart: {
    type: Date,
    default: null
  },
  registrationEnd: {
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

courseSchema.virtual('registrationStatus').get(function() {
  const now = new Date();
  if (!this.registrationStart || !this.registrationEnd) {
    return 'open';
  }
  if (now < this.registrationStart) {
    return 'not_started';
  }
  if (now > this.registrationEnd) {
    return 'closed';
  }
  return 'open';
});

courseSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Course', courseSchema);