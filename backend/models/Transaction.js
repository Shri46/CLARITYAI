const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  statement_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Statement',
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  category: {
    type: String
  },
  confidence: {
    type: Number
  },
  source: {
    type: String // 'rules', 'gemini', 'cache', etc.
  }
});

module.exports = mongoose.model('Transaction', transactionSchema);
