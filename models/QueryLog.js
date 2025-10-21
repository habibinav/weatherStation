// models/QueryLog.js
const mongoose = require('mongoose');

const queryLogSchema = new mongoose.Schema({
  queryType: { type: String, required: true }, // e.g. "current weather", "history"
  timestamp: { type: Date, default: Date.now },
  status: { type: String, default: 'success' },
  errorMessage: { type: String }
});

module.exports = mongoose.model('QueryLog', queryLogSchema);

