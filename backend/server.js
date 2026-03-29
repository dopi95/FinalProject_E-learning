const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 9000;

// Middleware
const corsOptions = {
  origin: ['https://aau-e-learning.vercel.app', 'http://localhost:3000', 'http://localhost:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
app.use(express.json());

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

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});