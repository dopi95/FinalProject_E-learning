const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const axios = require('axios');
const auth = require('../middleware/auth');
const Payment = require('../models/Payment');
const Enrollment = require('../models/Enrollment');
const Course = require('../models/Course');
const User = require('../models/User');

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
    const mockCheckoutUrl = `${process.env.FRONTEND_URL}/payment/success?tx_ref=${txRef}&status=success`;

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
      .populate('user', 'name email')
      .populate({
        path: 'course',
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

    // Check if enrollment already exists
    let enrollment = await Enrollment.findOne({ user: payment.user._id, course: payment.course._id });
    
    if (!enrollment) {
      // Create enrollment
      enrollment = new Enrollment({
        user: payment.user._id,
        course: payment.course._id,
        payment: payment._id
      });
      await enrollment.save();

      // Add student to course
      await Course.findByIdAndUpdate(payment.course._id, {
        $addToSet: { students: payment.user._id }
      });
    }

    res.json({
      success: true,
      message: 'Payment verified and enrollment completed',
      data: {
        payment,
        enrollment
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
      .populate('user', 'name email systemId')
      .populate('course', 'title instructor')
      .populate({
        path: 'course',
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

module.exports = router;