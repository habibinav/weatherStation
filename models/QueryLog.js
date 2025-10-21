// models/QueryLog.js
const mongoose = require('mongoose');

const QueryLogSchema = new mongoose.Schema({
  requesterEmail: { type: String, required: true },
  subject: String,
  queryText: { type: String, required: true },
  parsedParams: { type: Object, default: {} },
  receivedAt: { type: Date, default: Date.now },
  processedAt: Date,
  status: { 
    type: String, 
    enum: ['received','processing','completed','failed'], 
    default: 'received' 
  },
  responseFilename: String,
  responseSent: { type: Boolean, default: false },
  notes: String
});

module.exports = mongoose.model('QueryLog', QueryLogSchema);
