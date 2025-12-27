const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

const createSuperAdmin = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Check if super admin already exists
    const existingAdmin = await User.findOne({ email: 'admin@aau.edu.et' });
    if (existingAdmin) {
      console.log('Super admin already exists');
      process.exit(0);
    }

    // Create super admin
    const superAdmin = new User({
      name: 'Super Administrator',
      email: 'admin@aau.edu.et',
      password: 'AAU@Admin2024',
      role: 'admin',
      isVerified: true
    });

    await superAdmin.save();
    console.log('Super admin created successfully!');
    console.log('Email: admin@aau.edu.et');
    console.log('Password: AAU@Admin2024');
    
  } catch (error) {
    console.error('Error creating super admin:', error);
  } finally {
    mongoose.connection.close();
  }
};

createSuperAdmin();