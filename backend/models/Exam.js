const mongoose = require('mongoose');

const examSchema = new mongoose.Schema({
  title: { type: String, required: true },
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  instructor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  duration: { type: mongoose.Schema.Types.Mixed, required: true },
  totalMarks: { type: mongoose.Schema.Types.Mixed, required: true },
  passingMarks: { type: Number, required: false },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  instructions: { type: String },
  showResults: { type: Boolean, default: false },
  questions: [{
    question: { type: String, required: true },
    type: { type: String, enum: ['mcq', 'true-false', 'fill-blank', 'matching'], required: true },
    options: [String],
    correctAnswer: { type: String, required: true },
    marks: { type: Number, required: true },
    matchingPairs: [{ left: String, right: String }]
  }],
  submissions: [{
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    answers: [{ questionIndex: Number, answer: String }],
    score: Number,
    submittedAt: { type: Date, default: Date.now },
    timeTaken: Number // in minutes
  }],
  status: { type: String, enum: ['draft', 'active', 'completed'], default: 'draft' },
  streamStatus: { type: mongoose.Schema.Types.Mixed, default: {} }
}, { timestamps: true });

module.exports = mongoose.model('Exam', examSchema);
