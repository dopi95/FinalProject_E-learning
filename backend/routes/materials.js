const express = require('express');
const router = express.Router();
const Material = require('../models/Material');
const Course = require('../models/Course');
const auth = require('../middleware/auth');
const multer = require('multer');
const cloudinary = require('../config/cloudinary');

const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'image/', 'video/', 'application/pdf', 'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation'
    ];
    
    if (allowedTypes.some(type => file.mimetype.startsWith(type) || file.mimetype === type)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'), false);
    }
  }
});

// Get materials for a course
router.get('/course/:courseId', auth, async (req, res) => {
  try {
    const materials = await Material.find({ 
      course: req.params.courseId,
      isActive: true 
    })
      .populate('instructor', 'name email')
      .sort({ createdAt: -1 });
    
    res.json({ materials });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get materials for student's enrolled courses
router.get('/student/courses', auth, async (req, res) => {
  try {
    if (req.user.role !== 'student') {
      return res.status(403).json({ message: 'Access denied. Students only.' });
    }

    const Enrollment = require('../models/Enrollment');
    
    // Get student's enrolled courses
    const enrollments = await Enrollment.find({ 
      user: req.user.id,
      status: 'active'
    }).populate('course');
    
    const courseIds = enrollments.map(enrollment => enrollment.course._id);
    
    // Get materials for all enrolled courses
    const materials = await Material.find({ 
      course: { $in: courseIds },
      isActive: true 
    })
      .populate('instructor', 'name email')
      .populate('course', 'title')
      .sort({ createdAt: -1 });
    
    // Group materials by course
    const materialsByCourse = {};
    materials.forEach(material => {
      const courseId = material.course._id.toString();
      if (!materialsByCourse[courseId]) {
        materialsByCourse[courseId] = {
          course: material.course,
          materials: []
        };
      }
      materialsByCourse[courseId].materials.push(material);
    });
    
    res.json({ 
      success: true,
      materialsByCourse,
      totalMaterials: materials.length
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Upload material
router.post('/upload', auth, upload.single('file'), async (req, res) => {
  try {
    if (req.user.role !== 'instructor') {
      return res.status(403).json({ message: 'Access denied. Instructors only.' });
    }

    const { title, description, type, courseId, youtubeLink } = req.body;

    // Verify course belongs to instructor
    const course = await Course.findOne({ 
      _id: courseId, 
      instructor: req.user.id 
    });
    
    if (!course) {
      return res.status(403).json({ message: 'Course not found or access denied' });
    }

    let fileUrl = '';
    let publicId = '';
    let fileType = '';
    let fileSize = 0;
    let fileName = '';

    // Handle YouTube link
    if (type === 'video' && youtubeLink) {
      fileUrl = youtubeLink;
      fileType = 'youtube';
    } 
    // Handle file upload
    else if (req.file) {
      let resourceType = 'raw';
      let uploadOptions = {
        folder: `materials/${type}`,
        resource_type: 'raw',
        type: 'upload',
        access_mode: 'public'
      };
      
      // For videos and images, use appropriate resource type
      if (req.file.mimetype.startsWith('video/')) {
        resourceType = 'video';
        uploadOptions.resource_type = 'video';
      } else if (req.file.mimetype.startsWith('image/')) {
        resourceType = 'image';
        uploadOptions.resource_type = 'image';
      }
      
      const result = await cloudinary.uploader.upload(
        `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`,
        uploadOptions
      );
      
      fileUrl = result.secure_url;
      publicId = result.public_id;
      fileType = req.file.mimetype;
      fileSize = req.file.size;
      fileName = req.file.originalname;
    } else {
      return res.status(400).json({ message: 'File or YouTube link required' });
    }

    const material = new Material({
      title,
      description,
      type,
      course: courseId,
      instructor: req.user.id,
      fileUrl,
      fileName,
      publicId,
      fileType,
      fileSize,
      youtubeLink: type === 'video' && youtubeLink ? youtubeLink : undefined
    });

    await material.save();
    
    const populatedMaterial = await Material.findById(material._id)
      .populate('instructor', 'name email');

    res.status(201).json({ material: populatedMaterial });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update material
router.put('/:id', auth, async (req, res) => {
  try {
    const { title, description } = req.body;
    
    const material = await Material.findOne({ 
      _id: req.params.id,
      instructor: req.user.id 
    });
    
    if (!material) {
      return res.status(404).json({ message: 'Material not found or access denied' });
    }

    material.title = title || material.title;
    material.description = description || material.description;
    
    await material.save();
    
    const populatedMaterial = await Material.findById(material._id)
      .populate('instructor', 'name email');

    res.json({ material: populatedMaterial });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete material
router.delete('/:id', auth, async (req, res) => {
  try {
    const material = await Material.findOne({ 
      _id: req.params.id,
      instructor: req.user.id 
    });
    
    if (!material) {
      return res.status(404).json({ message: 'Material not found or access denied' });
    }

    // Delete from Cloudinary if not YouTube
    if (material.publicId) {
      const resourceType = material.fileType?.startsWith('video/') ? 'video' : 
                          material.fileType?.startsWith('image/') ? 'image' : 'raw';
      await cloudinary.uploader.destroy(material.publicId, { resource_type: resourceType });
    }

    material.isActive = false;
    await material.save();

    res.json({ message: 'Material deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Download material (for students)
router.get('/download/:materialId', auth, async (req, res) => {
  try {
    const material = await Material.findById(req.params.materialId)
      .populate('course', 'title');
    
    if (!material || !material.isActive) {
      return res.status(404).json({ message: 'Material not found' });
    }

    // Check if student is enrolled in the course
    if (req.user.role === 'student') {
      const Enrollment = require('../models/Enrollment');
      const enrollment = await Enrollment.findOne({
        user: req.user.id,
        course: material.course._id,
        status: 'active'
      });
      
      if (!enrollment) {
        return res.status(403).json({ message: 'Access denied. Not enrolled in this course.' });
      }
    }

    // Return download URL
    res.json({ 
      success: true,
      downloadUrl: material.fileUrl,
      fileName: material.fileName || `${material.title}.${material.fileType?.split('/')[1] || 'file'}`,
      fileType: material.fileType
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
