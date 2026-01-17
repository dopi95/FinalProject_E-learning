const express = require('express');
const router = express.Router();
const multer = require('multer');
const cloudinary = require('../config/cloudinary');
const Reel = require('../models/Reel');
const ReelComment = require('../models/ReelComment');
const auth = require('../middleware/auth');

// Optional auth middleware
const optionalAuth = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  
  if (token) {
    try {
      const jwt = require('jsonwebtoken');
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
    } catch (error) {
      // Invalid token, continue without user
    }
  }
  next();
};

// Configure multer for video uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 100 * 1024 * 1024 // 100MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      cb(new Error('Only video files are allowed'), false);
    }
  }
});

// Upload reel video
router.post('/upload', auth, upload.single('video'), async (req, res) => {
  try {
    const { title, description } = req.body;

    if (!title || !description) {
      return res.status(400).json({ message: 'Title and description are required' });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'Video file is required' });
    }

    // Upload video to Cloudinary
    const uploadResult = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: 'video',
          folder: 'reels',
          quality: 'auto',
          format: 'mp4'
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      uploadStream.end(req.file.buffer);
    });

    // Create reel record
    const reel = new Reel({
      title,
      description,
      videoUrl: uploadResult.secure_url,
      thumbnailUrl: uploadResult.secure_url.replace('.mp4', '.jpg'),
      uploadedBy: req.user.id
    });

    await reel.save();
    await reel.populate('uploadedBy', 'name email');

    res.status(201).json({
      success: true,
      message: 'Reel uploaded successfully',
      reel
    });
  } catch (error) {
    console.error('Upload reel error:', error);
    res.status(500).json({ message: 'Failed to upload reel', error: error.message });
  }
});

// Get all reels (public access)
router.get('/', async (req, res) => {
  try {
    const reels = await Reel.find({ isActive: true })
      .populate('uploadedBy', 'name email')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      reels
    });
  } catch (error) {
    console.error('Get reels error:', error);
    res.status(500).json({ message: 'Failed to fetch reels' });
  }
});

// Get single reel (public access)
router.get('/:id', async (req, res) => {
  try {
    const reel = await Reel.findById(req.params.id)
      .populate('uploadedBy', 'name email');

    if (!reel) {
      return res.status(404).json({ message: 'Reel not found' });
    }

    // Increment views for all users (logged and non-logged)
    reel.views += 1;
    await reel.save();

    res.json({
      success: true,
      reel
    });
  } catch (error) {
    console.error('Get reel error:', error);
    res.status(500).json({ message: 'Failed to fetch reel' });
  }
});

// Increment view count (public access)
router.post('/:id/view', optionalAuth, async (req, res) => {
  try {
    const { sessionId } = req.body;
    const reel = await Reel.findById(req.params.id);
    
    if (!reel) {
      return res.status(404).json({ message: 'Reel not found' });
    }

    let shouldIncrement = false;
    const userId = req.user?.id;

    if (userId) {
      // Logged in user - check if already viewed
      const hasViewed = reel.viewedBy.some(view => 
        view.user && view.user.toString() === userId
      );
      
      if (!hasViewed) {
        reel.viewedBy.push({ user: userId });
        shouldIncrement = true;
      }
    } else if (sessionId) {
      // Non-logged user - check session ID
      const hasViewed = reel.viewedBy.some(view => 
        view.sessionId === sessionId
      );
      
      if (!hasViewed) {
        reel.viewedBy.push({ sessionId });
        shouldIncrement = true;
      }
    }

    if (shouldIncrement) {
      reel.views += 1;
      await reel.save();
    }

    res.json({
      success: true,
      views: reel.views,
      incremented: shouldIncrement
    });
  } catch (error) {
    console.error('Increment view error:', error);
    res.status(500).json({ message: 'Failed to increment view' });
  }
});

// Update reel
router.put('/:id', auth, async (req, res) => {
  try {
    const { title, description } = req.body;
    const reel = await Reel.findById(req.params.id);

    if (!reel) {
      return res.status(404).json({ message: 'Reel not found' });
    }

    // Check if user is admin/superadmin or the uploader
    if (req.user.role !== 'admin' && req.user.role !== 'superadmin' && reel.uploadedBy.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this reel' });
    }

    if (!title || !description) {
      return res.status(400).json({ message: 'Title and description are required' });
    }

    reel.title = title;
    reel.description = description;
    await reel.save();
    await reel.populate('uploadedBy', 'name email');

    res.json({
      success: true,
      message: 'Reel updated successfully',
      reel
    });
  } catch (error) {
    console.error('Update reel error:', error);
    res.status(500).json({ message: 'Failed to update reel' });
  }
});

// Delete reel
router.delete('/:id', auth, async (req, res) => {
  try {
    const reel = await Reel.findById(req.params.id);

    if (!reel) {
      return res.status(404).json({ message: 'Reel not found' });
    }

    // Check if user is admin/superadmin or the uploader
    if (req.user.role !== 'admin' && req.user.role !== 'superadmin' && reel.uploadedBy.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this reel' });
    }

    await Reel.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Reel deleted successfully'
    });
  } catch (error) {
    console.error('Delete reel error:', error);
    res.status(500).json({ message: 'Failed to delete reel' });
  }
});

// Toggle like
router.post('/:id/like', auth, async (req, res) => {
  try {
    const reel = await Reel.findById(req.params.id);

    if (!reel) {
      return res.status(404).json({ message: 'Reel not found' });
    }

    const userId = req.user.id;
    const isLiked = reel.likes.includes(userId);

    if (isLiked) {
      reel.likes = reel.likes.filter(id => id.toString() !== userId);
    } else {
      reel.likes.push(userId);
    }

    await reel.save();

    res.json({
      success: true,
      message: isLiked ? 'Reel unliked' : 'Reel liked',
      likes: reel.likes.length,
      isLiked: !isLiked
    });
  } catch (error) {
    console.error('Toggle like error:', error);
    res.status(500).json({ message: 'Failed to toggle like' });
  }
});

// Get comments for a reel
router.get('/:id/comments', async (req, res) => {
  try {
    const comments = await ReelComment.find({ 
      reel: req.params.id, 
      parentComment: null 
    })
      .populate('user', 'name profileImage')
      .populate({
        path: 'replies',
        populate: {
          path: 'user',
          select: 'name profileImage'
        }
      })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      comments
    });
  } catch (error) {
    console.error('Get comments error:', error);
    res.status(500).json({ message: 'Failed to fetch comments' });
  }
});

// Add comment to reel
router.post('/:id/comments', auth, async (req, res) => {
  try {
    const { comment, parentCommentId } = req.body;

    if (!comment || !comment.trim()) {
      return res.status(400).json({ message: 'Comment is required' });
    }

    const reel = await Reel.findById(req.params.id);
    if (!reel) {
      return res.status(404).json({ message: 'Reel not found' });
    }

    const newComment = new ReelComment({
      reel: req.params.id,
      user: req.user.id,
      comment: comment.trim(),
      parentComment: parentCommentId || null
    });

    await newComment.save();
    await newComment.populate('user', 'name profileImage');

    // If this is a reply, add it to parent's replies array
    if (parentCommentId) {
      await ReelComment.findByIdAndUpdate(
        parentCommentId,
        { $push: { replies: newComment._id } }
      );
    }

    res.status(201).json({
      success: true,
      comment: newComment
    });
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({ message: 'Failed to add comment' });
  }
});

// Delete comment
router.delete('/comments/:commentId', auth, async (req, res) => {
  try {
    const { commentId } = req.params;
    const userId = req.user.id;

    const comment = await ReelComment.findById(commentId);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    // Check if user owns the comment
    if (comment.user.toString() !== userId) {
      return res.status(403).json({ message: 'Not authorized to delete this comment' });
    }

    // Delete the comment and its replies
    await ReelComment.deleteMany({ $or: [{ _id: commentId }, { parentComment: commentId }] });

    res.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    console.error('Delete comment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;