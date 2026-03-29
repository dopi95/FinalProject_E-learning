const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  schedule: { type: mongoose.Schema.Types.ObjectId, ref: 'Schedule' },
  sessionDay: { type: String },
  sessionDate: { type: Date, default: Date.now },
  joinedAt: { type: Date, default: Date.now }
}, { timestamps: true });

// Prevent duplicate attendance for same student/course/date
attendanceSchema.index({ student: 1, course: 1, sessionDate: 1 });

module.exports = mongoose.model('Attendance', attendanceSchema);
