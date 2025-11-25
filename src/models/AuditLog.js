const mongoose = require('mongoose');

const AuditLogSchema = new mongoose.Schema({
  actor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  action: String,
  targetType: String,
  targetId: mongoose.Schema.Types.ObjectId,
  summary: String,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('AuditLog', AuditLogSchema);
