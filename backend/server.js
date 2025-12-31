const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? (process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : '*')
    : ['http://localhost:3000', 'http://localhost:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/aau-elearning')
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

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

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});