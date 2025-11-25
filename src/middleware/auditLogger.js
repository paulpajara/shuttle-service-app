const AuditLog = require('../models/AuditLog');

module.exports = async function(req, action, targetType, targetId, summary){
  try {
    await AuditLog.create({
      actor: req.user ? req.user.id : null,
      action, targetType, targetId, summary
    });
  } catch (err) {
    console.error('Audit log failed', err);
  }
};
