const express = require('express');
const router = express.Router();
const Course = require('../models/Course');
const User = require('../models/User');
const auth = require('../middleware/auth');
const multer = require('multer');
const cloudinary = require('../config/cloudinary');

// Multer storage for course images
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

// Get top 3 featured courses
router.get('/featured', async (req, res) => {
  try {
    const courses = await Course.find({ isActive: true })
      .populate('instructor', 'name email profileImage')
      .populate('stars', 'name profileImage')
      .sort({ createdAt: -1 })
      .limit(3);
    
    res.json({ courses });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all courses with search and filter
router.get('/', async (req, res) => {
  try {
    const { search, category, page = 1, limit = 10 } = req.query;
    
    let query = { isActive: true };
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (category && category !== 'all') {
      query.category = category;
    }
    
    const courses = await Course.find(query)
      .populate('instructor', 'name email profileImage')
      .populate('stars', 'name profileImage')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const total = await Course.countDocuments(query);
    
    res.json({
      courses,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get instructor's assigned courses
router.get('/instructor/courses', auth, async (req, res) => {
  try {
    if (req.user.role !== 'instructor') {
      return res.status(403).json({ message: 'Access denied. Instructors only.' });
    }

    const courses = await Course.find({ instructor: req.user.id })
      .populate('instructor', 'name email profileImage')
      .populate('students', 'name email')
      .populate('stars', 'name profileImage')
      .sort({ createdAt: -1 });
    
    res.json({ courses });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
// Get instructors
router.get('/instructors', auth, async (req, res) => {
  try {
    const instructors = await User.find({ 
      role: 'instructor',
      isVerified: true 
    }).select('name email');
    
    res.json({ instructors });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create course
router.post('/', auth, upload.single('image'), async (req, res) => {
  try {
    if (req.user.role !== 'superadmin' && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { title, description, about, price, category, instructor, registrationStart, registrationEnd } = req.body;
    
    let imageUrl = null;
    if (req.file) {
      const result = await cloudinary.uploader.upload(
        `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`,
        {
          folder: 'courses',
          transformation: [{ width: 800, height: 600, crop: 'fill' }]
        }
      );
      imageUrl = result.secure_url;
    }
    
    const courseData = {
      title,
      description,
      about,
      price: Number(price),
      category,
      instructor,
      image: imageUrl
    };
    
    if (registrationStart) {
      courseData.registrationStart = new Date(registrationStart);
    }
    if (registrationEnd) {
      courseData.registrationEnd = new Date(registrationEnd);
    }
    
    const course = new Course(courseData);
    await course.save();
    
    const populatedCourse = await Course.findById(course._id)
      .populate('instructor', 'name email profileImage');
    
    // Send notifications
    try {
      const emailService = require('../utils/emailService');
      const Subscription = require('../models/Subscription');
      
      // Get student subscribers only
      const subscriptions = await Subscription.find({ isActive: true }).populate('user');
      const studentSubscriberEmails = subscriptions
        .filter(sub => {
          // Include if user is a student or if no user linked (newsletter subscribers)
          return !sub.user || sub.user.role === 'student';
        })
        .map(sub => sub.email);
      
      // Send new course notification only to student subscribers
      if (studentSubscriberEmails.length > 0) {
        for (const email of studentSubscriberEmails) {
          await emailService.sendNewCourseNotificationToStudents(
            email, 
            populatedCourse.title, 
            populatedCourse.instructor.name
          );
        }
      }
      
      // Send assignment notification only to the assigned instructor
      await emailService.sendInstructorAssignmentEmail(
        populatedCourse.instructor.email,
        populatedCourse.title,
        populatedCourse.instructor.name
      );
    } catch (emailError) {
      console.error('Email notification error:', emailError);
      // Don't fail course creation if email fails
    }
    
    res.status(201).json({ course: populatedCourse });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get single course
router.get('/:id', async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate('instructor', 'name email profileImage')
      .populate('students', 'name email')
      .populate('stars', 'name profileImage');
    
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    
    res.json({ course });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update course
router.put('/:id', auth, upload.single('image'), async (req, res) => {
  try {
    if (req.user.role !== 'superadmin' && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { title, description, about, price, category, instructor, registrationStart, registrationEnd } = req.body;
    
    // Get current course to check for instructor changes
    const currentCourse = await Course.findById(req.params.id).populate('instructor', 'name email');
    if (!currentCourse) {
      return res.status(404).json({ message: 'Course not found' });
    }
    
    const updateData = {
      title,
      description,
      about,
      price: Number(price),
      category,
      instructor
    };
    
    if (registrationStart) {
      updateData.registrationStart = new Date(registrationStart);
    }
    if (registrationEnd) {
      updateData.registrationEnd = new Date(registrationEnd);
    }
    
    if (req.file) {
      const result = await cloudinary.uploader.upload(
        `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`,
        {
          folder: 'courses',
          transformation: [{ width: 800, height: 600, crop: 'fill' }]
        }
      );
      updateData.image = result.secure_url;
    }
    
    const course = await Course.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('instructor', 'name email profileImage');
    
    // Handle instructor change notifications
    if (instructor && instructor !== currentCourse.instructor._id.toString()) {
      try {
        const emailService = require('../utils/emailService');
        
        // Notify previous instructor about unassignment
        await emailService.sendInstructorUnassignmentEmail(
          currentCourse.instructor.email,
          currentCourse.title,
          currentCourse.instructor.name
        );
        
        // Notify new instructor about assignment
        await emailService.sendInstructorAssignmentEmail(
          course.instructor.email,
          course.title,
          course.instructor.name
        );
      } catch (emailError) {
        console.error('Email notification error:', emailError);
        // Don't fail course update if email fails
      }
    }
    
    res.json({ course });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete course
router.delete('/:id', auth, async (req, res) => {
  try {
    if (req.user.role !== 'superadmin' && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const course = await Course.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );
    
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    
    res.json({ message: 'Course deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Star/Unstar course
router.post('/:id/star', auth, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    
    const isStarred = course.stars.includes(req.user.id);
    
    if (isStarred) {
      // Unstar
      course.stars = course.stars.filter(userId => userId.toString() !== req.user.id);
    } else {
      // Star
      course.stars.push(req.user.id);
    }
    
    await course.save();
    
    res.json({ 
      message: isStarred ? 'Course unstarred' : 'Course starred',
      isStarred: !isStarred,
      starCount: course.stars.length
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;