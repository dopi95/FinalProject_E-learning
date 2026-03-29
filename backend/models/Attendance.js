const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  schedule: { type: mongoose.Schema.Types.ObjectId, ref: 'Schedule' },
  sessionDay: { type: String },
  sessionStartTime: { type: String }, // e.g. '09:00' — identifies specific session
  sessionDate: { type: Date, default: Date.now },
  joinedAt: { type: Date, default: Date.now }
}, { timestamps: true });

// Prevent duplicate per student/course/date/startTime (one per session per day)
attendanceSchema.index({ student: 1, course: 1, sessionDate: 1, sessionStartTime: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', attendanceSchema);
