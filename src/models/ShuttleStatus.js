const mongoose = require('mongoose');

const ShuttleStatusSchema = new mongoose.Schema({
  shuttleId: String,
  tripSchedule: { type: mongoose.Schema.Types.ObjectId, ref: 'TripSchedule' },
  location: { lat: Number, lng: Number },
  speed: Number,
  heading: Number,
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('ShuttleStatus', ShuttleStatusSchema);
