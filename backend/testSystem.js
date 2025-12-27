const mongoose = require('mongoose');
const User = require('./models/User');
const emailService = require('./utils/emailService');
require('dotenv').config();

const testSystem = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Test super admin login
    const admin = await User.findOne({ email: 'admin@aau.edu.et' });
    if (admin) {
      console.log('✅ Super admin found:', {
        name: admin.name,
        email: admin.email,
        role: admin.role,
        isVerified: admin.isVerified
      });
      
      // Test password
      const isMatch = await admin.comparePassword('AAU@Admin2024');
      console.log('✅ Password check:', isMatch ? 'CORRECT' : 'INCORRECT');
    } else {
      console.log('❌ Super admin not found');
    }

    // Test email service
    console.log('\n🧪 Testing email service...');
    try {
      const result = await emailService.sendOTPEmail('test@example.com', '123456', 'Test User');
      console.log('✅ Email service test result:', result);
    } catch (error) {
      console.log('❌ Email service error:', error.message);
    }

  } catch (error) {
    console.error('❌ Test error:', error);
  } finally {
    mongoose.connection.close();
  }
};

testSystem();