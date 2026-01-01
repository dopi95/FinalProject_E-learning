const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course'
  },
  courses: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course'
  }],
  isBulk: {
    type: Boolean,
    default: false
  },
  amount: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    default: 'ETB'
  },
  paymentMethod: {
    type: String,
    enum: ['telebirr', 'cbe'],
    required: true
  },
  chapaReference: {
    type: String,
    required: true,
    unique: true
  },
  status: {
    type: String,
    enum: ['pending', 'success', 'failed'],
    default: 'pending'
  },
  transactionId: {
    type: String,
    default: null
  },
  receiptNumber: {
    type: String,
    unique: true
  }
}, {
  timestamps: true
});

// Generate receipt number before saving
paymentSchema.pre('save', function(next) {
  if (!this.receiptNumber) {
    this.receiptNumber = 'RCP-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9).toUpperCase();
  }
  next();
});

module.exports = mongoose.model('Payment', paymentSchema);