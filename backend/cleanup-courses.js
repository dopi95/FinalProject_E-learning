const mongoose = require('mongoose');
const Course = require('./models/Course');
const Schedule = require('./models/Schedule');
require('dotenv').config();

const cleanupSchedules = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Find business information course
    const businessCourse = await Course.findOne({
      title: { $regex: /business information/i }
    });
    
    let filter = {};
    if (businessCourse) {
      filter = { course: { $ne: businessCourse._id } };
      console.log(`Keeping schedules for: ${businessCourse.title}`);
    }
    
    const result = await Schedule.deleteMany(filter);
    console.log(`Removed ${result.deletedCount} schedules`);
    
    await mongoose.connection.close();
    console.log('Cleanup completed');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

cleanupSchedules();