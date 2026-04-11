const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const connectDB = require('./config/db');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 9000;

// Middleware
const corsOptions = {
  origin: ['https://aau-e-learning.vercel.app', 'https://aau-elearning.vercel.app', 'http://localhost:3000', 'http://localhost:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
app.use(express.json());
app.use('/uploads', express.static(require('path').join(__dirname, 'uploads')));

// Socket.io for WebRTC signaling
const io = new Server(server, {
  cors: {
    origin: ['https://aau-e-learning.vercel.app', 'https://aau-elearning.vercel.app', 'http://localhost:3000', 'http://localhost:5173'],
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// examId -> { studentId -> socketId }
const examRooms = {};
// socketId -> { examId, userId, role }
const socketMeta = {};

io.on('connection', (socket) => {
  // Student joins exam room
  socket.on('exam:join', ({ examId, userId }) => {
    socket.join(`exam:${examId}`);
    socketMeta[socket.id] = { examId, userId, role: 'student' };
    if (!examRooms[examId]) examRooms[examId] = {};
    examRooms[examId][userId] = socket.id;
    // Notify instructors watching this exam
    socket.to(`exam:${examId}:instructors`).emit('student:joined', { studentId: userId, studentSocketId: socket.id });
    // If instructors are already watching, tell this student about them
    const instrRoom = `exam:${examId}:instructors`;
    const instrSockets = Object.entries(socketMeta)
      .filter(([sid, meta]) => meta.examId === examId && meta.role === 'instructor')
      .map(([sid]) => sid);
    instrSockets.forEach(instrSocketId => {
      socket.emit('instructor:watching', { instructorSocketId: instrSocketId });
    });
  });

  // Instructor opens monitor for an exam
  socket.on('instructor:watch', ({ examId, userId }) => {
    socket.join(`exam:${examId}:instructors`);
    socketMeta[socket.id] = { examId, userId, role: 'instructor' };
    // Tell ALL students in this exam that instructor is watching — triggers them to send offers
    socket.to(`exam:${examId}`).emit('instructor:watching', { instructorSocketId: socket.id });
    // Send list of currently connected students to instructor
    const students = examRooms[examId] || {};
    socket.emit('exam:students', { students: Object.entries(students).map(([sid, sockId]) => ({ studentId: sid, socketId: sockId })) });
    // Also directly notify each student socket so they send offers immediately
    Object.entries(students).forEach(([studentId, studentSocketId]) => {
      io.to(studentSocketId).emit('instructor:watching', { instructorSocketId: socket.id });
    });
  });

  // WebRTC signaling: student sends offer to instructor
  socket.on('webrtc:offer', ({ targetSocketId, offer, studentId }) => {
    io.to(targetSocketId).emit('webrtc:offer', { offer, studentId, fromSocketId: socket.id });
  });

  // Instructor requests student to send an offer (when student joins late)
  socket.on('request:offer', ({ targetSocketId, instructorSocketId }) => {
    io.to(targetSocketId).emit('instructor:watching', { instructorSocketId });
  });

  // WebRTC signaling: instructor sends answer to student
  socket.on('webrtc:answer', ({ targetSocketId, answer, studentId }) => {
    io.to(targetSocketId).emit('webrtc:answer', { answer, studentId, fromSocketId: socket.id });
  });

  // ICE candidate exchange
  socket.on('webrtc:ice', ({ targetSocketId, candidate, studentId }) => {
    io.to(targetSocketId).emit('webrtc:ice', { candidate, studentId, fromSocketId: socket.id });
  });

  // Student stream status update
  socket.on('stream:status', ({ examId, studentId, camera, screen }) => {
    socket.to(`exam:${examId}:instructors`).emit('stream:status', { studentId, camera, screen });
  });

  socket.on('disconnect', () => {
    const meta = socketMeta[socket.id];
    if (meta) {
      if (meta.role === 'student' && examRooms[meta.examId]) {
        delete examRooms[meta.examId][meta.userId];
        io.to(`exam:${meta.examId}:instructors`).emit('student:left', { studentId: meta.userId });
      }
      delete socketMeta[socket.id];
    }
  });
});

// Connect to MongoDB
connectDB();

// Routes
app.get('/', (req, res) => {
  res.json({ 
    message: 'AAU E-learning API is running!',
    environment: process.env.NODE_ENV,
    corsOrigin: process.env.CORS_ORIGIN,
    timestamp: new Date().toISOString()
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Backend is working',
    timestamp: new Date().toISOString()
  });
});

// Auth routes
app.use('/api/auth', require('./routes/auth'));

// Profile routes
app.use('/api/profile', require('./routes/profile'));

// Course routes
app.use('/api/courses', require('./routes/courses'));

// Category routes
app.use('/api/categories', require('./routes/categories'));

// Stats routes
app.use('/api/stats', require('./routes/stats'));

// Contact routes
app.use('/api/contact', require('./routes/contact'));

// Review routes
app.use('/api/reviews', require('./routes/reviews'));

// Payment routes
app.use('/api/payments', require('./routes/payments'));

// Enrollment routes
app.use('/api/enrollments', require('./routes/enrollments'));

// Users routes
app.use('/api/users', require('./routes/users'));

// Instructor routes
app.use('/api/instructors', require('./routes/instructors'));

// Subscription routes
app.use('/api/subscriptions', require('./routes/subscriptions'));

// Comment routes
app.use('/api/comments', require('./routes/comments'));

// Notification routes
app.use('/api/notifications', require('./routes/notifications'));

// Chat History routes
app.use('/api/chat-history', require('./routes/chatHistory'));

// Chat routes
app.use('/api/chat', require('./routes/chat'));

// Schedule routes
app.use('/api/schedules', require('./routes/schedules'));

// Schedule Update Request routes
app.use('/api/schedule-update-requests', require('./routes/scheduleUpdateRequests'));

// Material routes
app.use('/api/materials', require('./routes/materials'));

// Reel routes
app.use('/api/reels', require('./routes/reels'));

// Assignment routes
app.use('/api/assignments', require('./routes/assignments'));

// Exam routes
app.use('/api/exams', require('./routes/exams'));

// Admin Activities routes
app.use('/api/admin', require('./routes/adminActivities'));

// Attendance routes
app.use('/api/attendance', require('./routes/attendance'));

// Grades routes
app.use('/api/grades', require('./routes/grades'));

// Groq AI Chat route
app.use('/api/groq-chat', require('./routes/groqChat'));

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});