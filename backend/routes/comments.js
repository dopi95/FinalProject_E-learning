const express = require('express');
const router = express.Router();
const Comment = require('../models/Comment');
const auth = require('../middleware/auth');

// Get comments for a course
router.get('/course/:courseId', async (req, res) => {
  try {
    const { courseId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const comments = await Comment.find({ 
      course: courseId, 
      parentComment: null,
      isActive: true 
    })
    .populate('author', 'name profileImage')
    .populate({
      path: 'replies',
      match: { isActive: true },
      populate: {
        path: 'author',
        select: 'name profileImage'
      },
      options: { sort: { createdAt: 1 } }
    })
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

    const total = await Comment.countDocuments({ 
      course: courseId, 
      parentComment: null,
      isActive: true 
    });

    res.json({
      success: true,
      comments,
      totalPages: Math.ceil(total / limit),
      currentPage: page
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Add a comment
router.post('/', auth, async (req, res) => {
  try {
    const { content, courseId, parentCommentId } = req.body;

    const comment = new Comment({
      content,
      author: req.user.id,
      course: courseId,
      parentComment: parentCommentId || null
    });

    await comment.save();
    await comment.populate('author', 'name profileImage');

    res.status(201).json({
      success: true,
      comment
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Like/unlike a comment
router.post('/:commentId/like', auth, async (req, res) => {
  try {
    const { commentId } = req.params;
    const userId = req.user.id;

    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({ success: false, message: 'Comment not found' });
    }

    const isLiked = comment.likes.includes(userId);
    
    if (isLiked) {
      comment.likes.pull(userId);
    } else {
      comment.likes.push(userId);
    }

    await comment.save();

    res.json({
      success: true,
      isLiked: !isLiked,
      likeCount: comment.likes.length
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Delete a comment
router.delete('/:commentId', auth, async (req, res) => {
  try {
    const { commentId } = req.params;
    const userId = req.user.id;

    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({ success: false, message: 'Comment not found' });
    }

    if (comment.author.toString() !== userId) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    comment.isActive = false;
    await comment.save();

    res.json({ success: true, message: 'Comment deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;