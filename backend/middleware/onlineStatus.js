const User = require('../models/User');

// Middleware to update user's online status
const updateOnlineStatus = async (req, res, next) => {
  try {
    if (req.user && req.user.id) {
      // Update user's online status and last seen time
      await User.findByIdAndUpdate(req.user.id, {
        isOnline: true,
        lastSeen: new Date()
      });
    }
  } catch (error) {
    // Don't block the request if online status update fails
    console.error('Online status update error:', error);
  }
  next();
};

// Function to mark user as offline
const markUserOffline = async (userId) => {
  try {
    await User.findByIdAndUpdate(userId, {
      isOnline: false,
      lastSeen: new Date()
    });
  } catch (error) {
    console.error('Mark offline error:', error);
  }
};

// Function to check and update offline users (users inactive for more than 5 minutes)
const checkOfflineUsers = async () => {
  try {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    await User.updateMany(
      {
        isOnline: true,
        lastSeen: { $lt: fiveMinutesAgo }
      },
      {
        isOnline: false
      }
    );
  } catch (error) {
    console.error('Check offline users error:', error);
  }
};

// Run offline check every minute
setInterval(checkOfflineUsers, 60 * 1000);

module.exports = {
  updateOnlineStatus,
  markUserOffline,
  checkOfflineUsers
};