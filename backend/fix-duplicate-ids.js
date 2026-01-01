const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI);

async function fixDuplicateIds() {
  try {
    const year = new Date().getFullYear().toString().slice(-2);
    
    // Clear all systemIds first
    await User.updateMany({}, { $unset: { systemId: 1 } });
    console.log('Cleared all systemIds');
    
    // Fix students
    const students = await User.find({ role: 'student' }).sort({ createdAt: 1 });
    for (let i = 0; i < students.length; i++) {
      const newId = `AAU/${(i + 1).toString().padStart(4, '0')}/${year}`;
      await User.findByIdAndUpdate(students[i]._id, { systemId: newId });
      console.log(`Updated student: ${students[i].name} -> ${newId}`);
    }
    
    // Fix instructors  
    const instructors = await User.find({ role: 'instructor' }).sort({ createdAt: 1 });
    for (let i = 0; i < instructors.length; i++) {
      const newId = `INS/${(i + 1).toString().padStart(4, '0')}/${year}`;
      await User.findByIdAndUpdate(instructors[i]._id, { systemId: newId });
      console.log(`Updated instructor: ${instructors[i].name} -> ${newId}`);
    }
    
    console.log('✅ Fixed all duplicate IDs');
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    mongoose.connection.close();
  }
}

fixDuplicateIds();