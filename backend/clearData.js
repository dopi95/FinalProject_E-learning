const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const Payment = require('./models/Payment');
const Enrollment = require('./models/Enrollment');
const Course = require('./models/Course');

async function clearData() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/aau-elearning');
    console.log('Connected to MongoDB');

    // Delete all payments
    const paymentResult = await Payment.deleteMany({});
    console.log(`Deleted ${paymentResult.deletedCount} payments`);

    // Delete all enrollments
    const enrollmentResult = await Enrollment.deleteMany({});
    console.log(`Deleted ${enrollmentResult.deletedCount} enrollments`);

    // Clear students array from all courses
    const courseResult = await Course.updateMany({}, { $set: { students: [] } });
    console.log(`Updated ${courseResult.modifiedCount} courses`);

    console.log('✅ All enrollment and payment data cleared successfully!');
    
    // Close connection
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error clearing data:', error);
    process.exit(1);
  }
}

clearData();