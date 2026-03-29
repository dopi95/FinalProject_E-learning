const AdminActivity = require('../models/AdminActivity');

const logAdminActivity = async (adminId, action, description, targetType = null, targetId = null, metadata = {}) => {
  try {
    const data = { admin: adminId, action, description, metadata };
    if (targetType) data.targetType = targetType;
    if (targetId) data.targetId = targetId;
    await AdminActivity.create(data);
  } catch (error) {
    // silently ignore logging errors
  }
};

const getRecentActivities = async (limit = 5) => {
  try {
    const activities = await AdminActivity.find()
      .populate('admin', 'name role')
      .sort({ createdAt: -1 })
      .limit(limit);
    
    return activities;
  } catch (error) {
    console.error('Error fetching recent activities:', error);
    return [];
  }
};

module.exports = {
  logAdminActivity,
  getRecentActivities
};