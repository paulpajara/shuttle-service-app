const mongoose = require('mongoose');

const DriverApplicationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  licenseNumber: String,
  vehicleInfo: String,
  status: { type: String, enum: ['pending','approved','rejected'], default: 'pending' },
  submittedAt: { type: Date, default: Date.now },
  reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  reviewedAt: Date,
  reviewNotes: String
}, { timestamps: true });

module.exports = mongoose.model('DriverApplication', DriverApplicationSchema);
