const express = require('express');
const router = express.Router();
const Exam = require('../models/Exam');
const Course = require('../models/Course');
const auth = require('../middleware/auth');

// Get instructor's exams
router.get('/instructor', auth, async (req, res) => {
  try {
    const exams = await Exam.find({ instructor: req.user._id })
      .populate({ path: 'course', select: 'title', strictPopulate: false })
      .populate({ path: 'submissions.student', select: 'name email', strictPopulate: false })
      .sort({ createdAt: -1 })
      .lean();
    res.json({ exams });
  } catch (error) {
    console.error('Get instructor exams error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Create exam
router.post('/', auth, async (req, res) => {
  try {
    const exam = new Exam({ ...req.body, instructor: req.user._id });
    await exam.save();
    const populatedExam = await Exam.findById(exam._id)
      .populate({ path: 'course', select: 'title', strictPopulate: false })
      .lean();
    res.status(201).json({ exam: populatedExam });
  } catch (error) {
    console.error('Create exam error:', error);
    res.status(400).json({ message: error.message });
  }
});

// Update exam
router.put('/:id', auth, async (req, res) => {
  try {
    const exam = await Exam.findOneAndUpdate(
      { _id: req.params.id, instructor: req.user._id },
      req.body,
      { new: true }
    )
      .populate({ path: 'course', select: 'title', strictPopulate: false })
      .lean();
    if (!exam) return res.status(404).json({ message: 'Exam not found' });
    res.json({ exam });
  } catch (error) {
    console.error('Update exam error:', error);
    res.status(400).json({ message: error.message });
  }
});

// Delete exam
router.delete('/:id', auth, async (req, res) => {
  try {
    const exam = await Exam.findOneAndDelete({ _id: req.params.id, instructor: req.user._id });
    if (!exam) return res.status(404).json({ message: 'Exam not found' });
    res.json({ message: 'Exam deleted' });
  } catch (error) {
    console.error('Delete exam error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get exam details with submissions
router.get('/:id', auth, async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.id)
      .populate('course', 'title')
      .populate('submissions.student', 'name email');
    if (!exam) return res.status(404).json({ message: 'Exam not found' });
    res.json({ exam });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get student's exams
router.get('/student/my-exams', auth, async (req, res) => {
  try {
    const Enrollment = require('../models/Enrollment');
    const enrollments = await Enrollment.find({ user: req.user._id, status: 'active' });
    const courseIds = enrollments.map(e => e.course);
    
    const exams = await Exam.find({ 
      course: { $in: courseIds },
      status: 'active'
    })
    .populate({ path: 'course', select: 'title', strictPopulate: false })
    .select('title course duration totalMarks startDate endDate instructions showResults questions submissions.student submissions.submittedAt')
    .sort({ startDate: -1 })
    .lean();
    
    res.json({ exams });
  } catch (error) {
    console.error('Get student exams error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Submit exam
router.post('/:id/submit', auth, async (req, res) => {
  try {
    const { answers, timeTaken } = req.body;
    const exam = await Exam.findById(req.params.id).populate('instructor', 'name');
    
    if (!exam) return res.status(404).json({ message: 'Exam not found' });
    
    // Check if already submitted
    const existingSubmission = exam.submissions.find(
      s => s.student.toString() === req.user._id.toString()
    );
    if (existingSubmission) {
      return res.status(400).json({ message: 'Already submitted' });
    }
    
    // Calculate score
    let score = 0;
    answers.forEach(answer => {
      const question = exam.questions[answer.questionIndex];
      if (question && question.correctAnswer.trim().toLowerCase() === answer.answer.trim().toLowerCase()) {
        score += question.marks;
      }
    });
    
    exam.submissions.push({
      student: req.user._id,
      answers,
      score,
      timeTaken
    });
    
    await exam.save();
    
    // Send notification to instructor
    try {
      const Notification = require('../models/Notification');
      await Notification.create({
        user: exam.instructor._id,
        title: 'New Exam Submission',
        message: `${req.user.name} submitted "${exam.title}" - Score: ${score}/${exam.totalMarks} (${((score / exam.totalMarks) * 100).toFixed(1)}%)`,
        type: 'info',
        read: false
      });
    } catch (notifError) {
      console.error('Notification error:', notifError);
    }
    
    res.json({ message: 'Exam submitted successfully', score });
  } catch (error) {
    console.error('Submit exam error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Publish exam
router.patch('/:id/publish', auth, async (req, res) => {
  try {
    const exam = await Exam.findOne({ _id: req.params.id, instructor: req.user._id });
    
    if (!exam) return res.status(404).json({ message: 'Exam not found' });
    
    exam.status = 'active';
    await exam.save();
    
    // Send notifications to enrolled students
    try {
      const Notification = require('../models/Notification');
      const Enrollment = require('../models/Enrollment');
      
      const enrollments = await Enrollment.find({ course: exam.course, status: 'active' }).populate('user', 'name email');
      
      if (enrollments.length > 0) {
        const notifications = enrollments.map(enrollment => ({
          user: enrollment.user._id,
          title: 'New Exam Available',
          message: `New exam "${exam.title}" is now available. Duration: ${exam.duration} min, Total Marks: ${exam.totalMarks}`,
          type: 'info',
          read: false
        }));
        await Notification.insertMany(notifications);
      }
    } catch (notifError) {
      console.error('Notification error:', notifError);
    }
    
    const populatedExam = await Exam.findById(exam._id)
      .populate({ path: 'course', select: 'title', strictPopulate: false })
      .lean();
    
    res.json({ exam: populatedExam });
  } catch (error) {
    console.error('Publish exam error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Unpublish exam
router.patch('/:id/unpublish', auth, async (req, res) => {
  try {
    const exam = await Exam.findOne({ _id: req.params.id, instructor: req.user._id });
    
    if (!exam) return res.status(404).json({ message: 'Exam not found' });
    
    exam.status = 'draft';
    await exam.save();
    
    const populatedExam = await Exam.findById(exam._id)
      .populate({ path: 'course', select: 'title', strictPopulate: false })
      .lean();
    
    res.json({ exam: populatedExam });
  } catch (error) {
    console.error('Unpublish exam error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Update student stream status (camera/screen) during exam
router.post('/:id/stream-status', auth, async (req, res) => {
  try {
    const { camera, screen } = req.body;
    const exam = await Exam.findById(req.params.id);
    if (!exam) return res.status(404).json({ message: 'Exam not found' });
    const sub = exam.submissions.find(s => s.student.toString() === req.user._id.toString());
    if (sub) {
      sub.camera = !!camera;
      sub.screen = !!screen;
    } else {
      // Student hasn't submitted yet — store in a separate map on the exam
      if (!exam.streamStatus) exam.streamStatus = {};
      exam.streamStatus[req.user._id.toString()] = { camera: !!camera, screen: !!screen, updatedAt: new Date() };
      exam.markModified('streamStatus');
    }
    await exam.save();
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get stream status for all students in an exam (instructor)
router.get('/:id/stream-status', auth, async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.id).lean();
    if (!exam) return res.status(404).json({ message: 'Exam not found' });
    res.json({ streamStatus: exam.streamStatus || {} });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get student's exam submission
router.get('/:id/submission', auth, async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.id)
      .populate({ path: 'course', select: 'title', strictPopulate: false })
      .lean();
    
    if (!exam) return res.status(404).json({ message: 'Exam not found' });
    
    const submission = exam.submissions.find(
      s => s.student.toString() === req.user._id.toString()
    );
    
    if (!submission) return res.status(404).json({ message: 'Submission not found' });
    
    res.json({ exam, submission });
  } catch (error) {
    console.error('Get submission error:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
