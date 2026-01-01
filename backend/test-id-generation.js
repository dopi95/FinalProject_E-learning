const mongoose = require('mongoose');
const User = require('./models/User');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/elearning', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

async function testIdGeneration() {
  try {
    console.log('Testing ID generation...\n');
    
    // Create test students
    const student1 = new User({
      name: 'Test Student 1',
      email: 'student1@test.com',
      password: 'password123',
      role: 'student'
    });
    
    const student2 = new User({
      name: 'Test Student 2', 
      email: 'student2@test.com',
      password: 'password123',
      role: 'student'
    });
    
    // Create test instructors
    const instructor1 = new User({
      name: 'Test Instructor 1',
      email: 'instructor1@test.com', 
      password: 'password123',
      role: 'instructor'
    });
    
    const instructor2 = new User({
      name: 'Test Instructor 2',
      email: 'instructor2@test.com',
      password: 'password123', 
      role: 'instructor'
    });
    
    // Save users and check IDs
    await student1.save();
    console.log(`Student 1 ID: ${student1.systemId}`);
    
    await student2.save();
    console.log(`Student 2 ID: ${student2.systemId}`);
    
    await instructor1.save();
    console.log(`Instructor 1 ID: ${instructor1.systemId}`);
    
    await instructor2.save();
    console.log(`Instructor 2 ID: ${instructor2.systemId}`);
    
    console.log('\n✅ ID generation test completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    mongoose.connection.close();
  }
}

testIdGeneration();