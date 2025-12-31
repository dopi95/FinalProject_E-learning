const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  role: {
    type: String,
    enum: ['student', 'instructor', 'admin', 'superadmin'],
    required: true
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  // Profile fields
  profileImage: {
    type: String,
    default: null
  },
  phone: {
    type: String,
    trim: true
  },
  dateOfBirth: {
    type: Date
  },
  address: {
    type: String,
    trim: true
  },
  city: {
    type: String,
    trim: true
  },
  studentId: {
    type: String,
    trim: true
  },
  systemId: {
    type: String,
    unique: true,
    sparse: true
  },
  program: {
    type: String,
    trim: true
  },
  fieldOfStudy: {
    type: String,
    trim: true
  },
  yearOfStudy: {
    type: String,
    trim: true
  },
  institution: {
    type: String,
    trim: true
  },
  bio: {
    type: String,
    trim: true
  },
  // Additional profile fields
  department: {
    type: String,
    trim: true
  },
  specialization: {
    type: String,
    trim: true
  },
  experience: {
    type: String,
    trim: true
  },
  adminId: {
    type: String,
    trim: true
  },
  accessLevel: {
    type: String,
    trim: true
  },
  // Auth fields
  otp: {
    type: String
  },
  otpExpires: {
    type: Date
  },
  resetPasswordToken: {
    type: String
  },
  resetPasswordExpires: {
    type: Date
  }
}, {
  timestamps: true
});

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Generate system ID before saving
userSchema.pre('save', async function(next) {
  if (this.isNew && (this.role === 'student' || this.role === 'instructor')) {
    const year = new Date().getFullYear().toString().slice(-2);
    const prefix = this.role === 'student' ? 'AAU' : 'INS';
    
    // Find the last user with the same role and year
    const lastUser = await this.constructor.findOne({
      role: this.role,
      systemId: new RegExp(`^${prefix}/\\d{4}/${year}$`)
    }).sort({ systemId: -1 });
    
    let nextNumber = 1;
    if (lastUser && lastUser.systemId) {
      const match = lastUser.systemId.match(new RegExp(`^${prefix}/(\\d{4})/${year}$`));
      if (match) {
        nextNumber = parseInt(match[1]) + 1;
      }
    }
    
    this.systemId = `${prefix}/${nextNumber.toString().padStart(4, '0')}/${year}`;
  }
  next();
});

userSchema.methods.comparePassword = async function(password) {
  return await bcrypt.compare(password, this.password);
};

userSchema.methods.toJSON = function() {
  const user = this.toObject();
  delete user.password;
  delete user.otp;
  delete user.otpExpires;
  delete user.resetPasswordToken;
  delete user.resetPasswordExpires;
  return user;
};

module.exports = mongoose.model('User', userSchema);