const express = require('express');
const router = express.Router();
const Subscription = require('../models/Subscription');
const auth = require('../middleware/auth');

// Subscribe to newsletter
router.post('/subscribe', auth, async (req, res) => {
  try {
    const { email } = req.body;
    const userId = req.user.id;

    // Check if already subscribed
    const existingSubscription = await Subscription.findOne({ email });
    
    if (existingSubscription) {
      if (existingSubscription.isActive) {
        return res.status(400).json({ message: 'Already subscribed' });
      } else {
        // Reactivate subscription
        existingSubscription.isActive = true;
        existingSubscription.user = userId;
        await existingSubscription.save();
        return res.json({ message: 'Subscription reactivated successfully' });
      }
    }

    // Create new subscription
    const subscription = new Subscription({
      email,
      user: userId
    });

    await subscription.save();
    res.json({ message: 'Subscribed successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Unsubscribe from newsletter
router.post('/unsubscribe', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { email } = req.body;

    const subscription = await Subscription.findOne({ 
      $or: [{ user: userId }, { email }]
    });

    if (!subscription) {
      return res.status(404).json({ message: 'Subscription not found' });
    }

    subscription.isActive = false;
    await subscription.save();

    res.json({ message: 'Unsubscribed successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get user subscription status
router.get('/status', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const userEmail = req.user.email;

    const subscription = await Subscription.findOne({ 
      $or: [{ user: userId }, { email: userEmail }],
      isActive: true
    });

    res.json({ isSubscribed: !!subscription });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Admin: Get all subscriptions
router.get('/admin/all', auth, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'superadmin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const subscriptions = await Subscription.find({ isActive: true })
      .select('email subscribedAt')
      .sort({ subscribedAt: -1 });

    res.json({ subscriptions });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Send newsletter
router.post('/newsletter', auth, async (req, res) => {
  try {
    if (req.user.role !== 'superadmin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { subject, content, selectedEmails } = req.body;
    
    if (!subject || !content || !selectedEmails?.length) {
      return res.status(400).json({ message: 'Subject, content, and selected emails are required' });
    }

    const emailService = require('../utils/emailService');
    const results = await emailService.sendNewsletter(selectedEmails, subject, content);
    
    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;
    
    res.json({ 
      message: `Newsletter sent to ${successful} subscribers. ${failed} failed.`,
      results,
      stats: { successful, failed, total: selectedEmails.length }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;