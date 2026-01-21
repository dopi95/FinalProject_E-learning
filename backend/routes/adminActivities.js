const express = require('express');
const router = express.Router();
const { getRecentActivities } = require('../utils/adminActivityLogger');
const auth = require('../middleware/auth');

// Get recent admin activities
router.get('/recent-activities', auth, async (req, res) => {
  try {
    // Only allow admins and superadmins to view activities
    if (req.user.role !== 'admin' && req.user.role !== 'superadmin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const limit = parseInt(req.query.limit) || 5;
    const activities = await getRecentActivities(limit);
    
    res.json({
      success: true,
      activities
    });
  } catch (error) {
    console.error('Get recent activities error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;