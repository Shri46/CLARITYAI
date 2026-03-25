const mongoose = require('mongoose');

const budgetSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  category: {
    type: String,
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// A user can only have one budget per category
budgetSchema.index({ user_id: 1, category: 1 }, { unique: true });

module.exports = mongoose.model('Budget', budgetSchema);
