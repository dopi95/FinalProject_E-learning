const express = require('express');
const router = express.Router();
const Review = require('../models/Review');
const auth = require('../middleware/auth');

// Submit review (Students & Instructors only)
router.post('/', auth, async (req, res) => {
  try {
    if (req.user.role === 'admin' || req.user.role === 'superadmin') {
      return res.status(403).json({ message: 'Admins cannot submit reviews' });
    }

    const { rating, message } = req.body;
    
    // Check if user already has a review
    const existingReview = await Review.findOne({ user: req.user.id });
    if (existingReview) {
      return res.status(400).json({ message: 'You have already submitted a review' });
    }
    
    const review = new Review({
      user: req.user.id,
      rating,
      message
    });
    
    await review.save();
    await review.populate('user', 'name email role profileImage');
    
    res.status(201).json({ 
      message: 'Review submitted successfully',
      review 
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get user's own review
router.get('/my-review', auth, async (req, res) => {
  try {
    const review = await Review.findOne({ user: req.user.id })
      .populate('user', 'name email role profileImage')
      .populate('reviewedBy', 'name email');
    
    res.json({ review });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all reviews (Admin & SuperAdmin only)
router.get('/', auth, async (req, res) => {
  try {
    if (req.user.role !== 'superadmin' && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    const reviews = await Review.find()
      .populate('user', 'name email role profileImage')
      .populate('reviewedBy', 'name email')
      .sort({ createdAt: -1 });
    
    res.json({ reviews });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get approved reviews for public display
router.get('/approved', async (req, res) => {
  try {
    const reviews = await Review.find({ status: 'approved' })
      .populate('user', 'name role profileImage')
      .sort({ reviewedAt: -1 });
    
    res.json({ reviews });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update review status (Admin & SuperAdmin only)
router.patch('/:id/status', auth, async (req, res) => {
  try {
    if (req.user.role !== 'superadmin' && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    const { status } = req.body;
    const review = await Review.findById(req.params.id).populate('user', 'name email');
    
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }
    
    review.status = status;
    review.reviewedBy = req.user.id;
    review.reviewedAt = new Date();
    
    await review.save();
    await review.populate('reviewedBy', 'name email');
    
    // Send notification email
    try {
      const emailService = require('../utils/emailService');
      
      if (status === 'approved') {
        await emailService.sendReviewApprovedEmail(
          review.user.email,
          review.user.name,
          review.message
        );
      } else if (status === 'rejected') {
        await emailService.sendReviewRejectedEmail(
          review.user.email,
          review.user.name,
          review.message
        );
      }
    } catch (emailError) {
      console.error('Email notification error:', emailError);
    }
    
    res.json({ 
      message: `Review ${status} successfully`,
      review 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete review (User can delete their own review)
router.delete('/my-review', auth, async (req, res) => {
  try {
    const review = await Review.findOneAndDelete({ user: req.user.id });
    
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }
    
    res.json({ message: 'Review deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete review (Admin & SuperAdmin only)
router.delete('/:id', auth, async (req, res) => {
  try {
    if (req.user.role !== 'superadmin' && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    const review = await Review.findById(req.params.id).populate('user', 'name email');
    
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }
    
    // Send notification email before deletion
    try {
      const emailService = require('../utils/emailService');
      await emailService.sendReviewDeletedEmail(
        review.user.email,
        review.user.name
      );
    } catch (emailError) {
      console.error('Email notification error:', emailError);
    }
    
    await Review.findByIdAndDelete(req.params.id);
    
    res.json({ message: 'Review deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;