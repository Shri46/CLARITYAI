const mongoose = require('mongoose');

const geminiCacheSchema = new mongoose.Schema({
  description_hash: {
    type: String,
    required: true,
    unique: true
  },
  category: {
    type: String,
    required: true
  },
  created_at: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('GeminiCache', geminiCacheSchema);
