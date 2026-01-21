const AdminActivity = require('../models/AdminActivity');

const logAdminActivity = async (adminId, action, description, targetType = null, targetId = null, metadata = {}) => {
  try {
    await AdminActivity.create({
      admin: adminId,
      action,
      description,
      targetType,
      targetId,
      metadata
    });
  } catch (error) {
    console.error('Error logging admin activity:', error);
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