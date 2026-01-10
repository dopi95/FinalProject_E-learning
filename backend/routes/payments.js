const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');
const auth = require('../middleware/auth');
const Payment = require('../models/Payment');
const Enrollment = require('../models/Enrollment');
const Course = require('../models/Course');
const User = require('../models/User');

// Initialize bulk payment
router.post('/initialize-bulk', auth, async (req, res) => {
  try {
    const { courseIds, paymentMethod } = req.body;
    const userId = req.user.id;

    // Validate courses exist
    const courses = await Course.find({ _id: { $in: courseIds } });
    if (courses.length !== courseIds.length) {
      return res.status(404).json({ message: 'One or more courses not found' });
    }

    // Check if user is already enrolled in any course
    const existingEnrollments = await Enrollment.find({ 
      user: userId, 
      course: { $in: courseIds } 
    });
    if (existingEnrollments.length > 0) {
      return res.status(400).json({ message: 'Already enrolled in one or more courses' });
    }

    // Get user details
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Calculate total amount
    const totalAmount = courses.reduce((sum, course) => sum + course.price, 0);

    // Generate unique transaction reference
    const txRef = `bulk-tx-${Date.now()}-${uuidv4()}`;

    // Create bulk payment record
    const payment = new Payment({
      user: userId,
      courses: courseIds,
      amount: totalAmount,
      paymentMethod,
      chapaReference: txRef,
      isBulk: true
    });
    await payment.save();

    // For demo purposes, return a mock checkout URL
    const frontendUrl = process.env.FRONTEND_URL || 'https://aau-e-learning.vercel.app';
    const mockCheckoutUrl = `${frontendUrl}/payment/success?tx_ref=${txRef}&status=success`;

    res.json({
      success: true,
      data: {
        checkout_url: mockCheckoutUrl,
        tx_ref: txRef,
        payment_id: payment._id
      }
    });
  } catch (error) {
    console.error('Bulk payment initialization error:', error);
    res.status(500).json({ message: 'Server error during bulk payment initialization' });
  }
});

// Initialize payment
router.post('/initialize', auth, async (req, res) => {
  try {
    const { courseId, paymentMethod } = req.body;
    const userId = req.user.id;

    // Validate course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Check if user is already enrolled
    const existingEnrollment = await Enrollment.findOne({ user: userId, course: courseId });
    if (existingEnrollment) {
      return res.status(400).json({ message: 'Already enrolled in this course' });
    }

    // Get user details
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Generate unique transaction reference
    const txRef = `tx-${Date.now()}-${uuidv4()}`;

    // Create payment record
    const payment = new Payment({
      user: userId,
      course: courseId,
      amount: course.price,
      paymentMethod,
      chapaReference: txRef
    });
    await payment.save();

    // For demo purposes, return a mock checkout URL
    const frontendUrl = process.env.FRONTEND_URL || 'https://aau-e-learning.vercel.app';
    const mockCheckoutUrl = `${frontendUrl}/payment/success?tx_ref=${txRef}&status=success`;

    res.json({
      success: true,
      data: {
        checkout_url: mockCheckoutUrl,
        tx_ref: txRef,
        payment_id: payment._id
      }
    });
  } catch (error) {
    console.error('Payment initialization error:', error);
    res.status(500).json({ message: 'Server error during payment initialization' });
  }
});

// Verify payment
router.post('/verify/:tx_ref', auth, async (req, res) => {
  try {
    const { tx_ref } = req.params;

    // Find payment record
    const payment = await Payment.findOne({ chapaReference: tx_ref })
      .populate('course', 'title image instructor')
      .populate('courses', 'title image instructor')
      .populate('user', 'name email gender')
      .populate({
        path: 'course',
        populate: {
          path: 'instructor',
          select: 'name'
        }
      })
      .populate({
        path: 'courses',
        populate: {
          path: 'instructor',
          select: 'name'
        }
      });

    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    // For demo purposes, automatically mark as successful
    payment.status = 'success';
    payment.transactionId = `demo_${tx_ref}`;
    await payment.save();

    // Handle enrollments for bulk or single payment
    const coursesToEnroll = payment.isBulk ? payment.courses : [payment.course];
    
    for (const courseId of coursesToEnroll) {
      // Check if enrollment already exists
      let enrollment = await Enrollment.findOne({ user: payment.user._id, course: courseId });
      
      if (!enrollment) {
        // Create enrollment
        enrollment = new Enrollment({
          user: payment.user._id,
          course: courseId,
          payment: payment._id
        });
        await enrollment.save();

        // Add student to course
        await Course.findByIdAndUpdate(courseId, {
          $addToSet: { students: payment.user._id }
        });
      }
    }
    
    // Send enrollment confirmation email
    try {
      const emailService = require('../utils/emailService');
      if (payment.isBulk) {
        await emailService.sendBulkEnrollmentConfirmationEmail(
          payment.user.email,
          payment.user.name,
          payment.courses
        );
      } else {
        await emailService.sendEnrollmentConfirmationEmail(
          payment.user.email,
          payment.user.name,
          payment.course.title,
          payment.course.instructor.name
        );
      }
    } catch (emailError) {
      console.error('Enrollment email error:', emailError);
      // Don't fail enrollment if email fails
    }

    res.json({
      success: true,
      message: 'Payment verified and enrollment completed',
      data: {
        payment
      }
    });
  } catch (error) {
    console.error('Payment verification error:', error);
    res.status(500).json({ message: 'Server error during payment verification' });
  }
});

// Get payment receipt
router.get('/receipt/:payment_id', auth, async (req, res) => {
  try {
    const { payment_id } = req.params;
    
    const payment = await Payment.findById(payment_id)
      .populate('user', 'name email systemId gender')
      .populate('course', 'title instructor price')
      .populate('courses', 'title instructor price')
      .populate({
        path: 'course',
        populate: {
          path: 'instructor',
          select: 'name'
        }
      })
      .populate({
        path: 'courses',
        populate: {
          path: 'instructor',
          select: 'name'
        }
      });

    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    // Check if user owns this payment or is admin/superadmin
    if (payment.user._id.toString() !== req.user.id && 
        req.user.role !== 'admin' && 
        req.user.role !== 'superadmin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Generate receipt number if not exists
    if (!payment.receiptNumber) {
      payment.receiptNumber = `RCP-${Date.now()}-${payment._id.toString().slice(-6).toUpperCase()}`;
      await payment.save();
    }

    res.json({
      success: true,
      data: payment
    });
  } catch (error) {
    console.error('Receipt fetch error:', error);
    res.status(500).json({ message: 'Server error fetching receipt' });
  }
});

// Get public receipt (no auth required)
router.get('/public-receipt/:tx_ref', async (req, res) => {
  try {
    const { tx_ref } = req.params;
    
    const payment = await Payment.findOne({ chapaReference: tx_ref })
      .populate('user', 'name email systemId gender')
      .populate('course', 'title instructor price')
      .populate('courses', 'title instructor price')
      .populate({
        path: 'course',
        populate: {
          path: 'instructor',
          select: 'name'
        }
      })
      .populate({
        path: 'courses',
        populate: {
          path: 'instructor',
          select: 'name'
        }
      });

    if (!payment || payment.status !== 'success') {
      return res.status(404).json({ message: 'Receipt not found' });
    }

    // Generate receipt number if not exists
    if (!payment.receiptNumber) {
      payment.receiptNumber = `RCP-${Date.now()}-${payment._id.toString().slice(-6).toUpperCase()}`;
      await payment.save();
    }

    res.json({
      success: true,
      data: payment
    });
  } catch (error) {
    console.error('Public receipt fetch error:', error);
    res.status(500).json({ message: 'Server error fetching receipt' });
  }
});

// Get user payments
router.get('/my-payments', auth, async (req, res) => {
  try {
    const payments = await Payment.find({ 
      user: req.user.id,
      status: 'success'
    })
      .populate('course')
      .populate('user')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: payments
    });
  } catch (error) {
    console.error('Payments fetch error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error fetching payments',
      error: error.message
    });
  }
});

// Get all payments (Admin only)
router.get('/', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.user.role !== 'superadmin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { course } = req.query;
    let query = { status: 'success' };
    
    if (course) {
      query.$or = [
        { course: course },
        { courses: { $in: [course] } }
      ];
    }

    const payments = await Payment.find(query)
      .populate('course')
      .populate('courses')
      .populate('user')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      payments: payments
    });
  } catch (error) {
    console.error('Admin payments fetch error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error fetching payments',
      error: error.message
    });
  }
});

module.exports = router;