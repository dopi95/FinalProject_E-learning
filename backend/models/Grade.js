const mongoose = require('mongoose');

const gradeSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  instructor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  fields: [{ name: String, mark: mongoose.Schema.Types.Mixed, max: Number, auto: Boolean }],
  totalMark: { type: Number, default: 0 },
  gradeLetter: { type: String, default: '' },
  submittedAt: { type: Date, default: Date.now }
}, { timestamps: true });

gradeSchema.index({ student: 1, course: 1 }, { unique: true });

module.exports = mongoose.model('Grade', gradeSchema);
