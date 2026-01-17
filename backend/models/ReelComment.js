const mongoose = require('mongoose');

const reelCommentSchema = new mongoose.Schema({
  reel: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Reel',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  comment: {
    type: String,
    required: true,
    trim: true
  },
  parentComment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ReelComment',
    default: null
  },
  replies: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ReelComment'
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('ReelComment', reelCommentSchema);