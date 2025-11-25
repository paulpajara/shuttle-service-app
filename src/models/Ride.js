const mongoose = require('mongoose');

const RideSchema = new mongoose.Schema({
  passenger: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  tripSchedule: { type: mongoose.Schema.Types.ObjectId, ref: 'TripSchedule' },
  pickupStop: String,
  dropoffStop: String,
  status: { type: String, enum: ['booked','boarded','completed','cancelled'], default: 'booked' },
  timeBooked: { type: Date, default: Date.now },
  boardedAt: Date,
  completedAt: Date,
  fareCharged: Number
}, { timestamps: true });

module.exports = mongoose.model('Ride', RideSchema);
