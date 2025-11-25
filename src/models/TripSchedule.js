const mongoose = require('mongoose');

const TripScheduleSchema = new mongoose.Schema({
  route: { type: mongoose.Schema.Types.ObjectId, ref: 'Route' },
  departureTime: Date,
  arrivalTime: Date,
  shuttleId: String,
  driver: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  capacity: Number,
  fare: Number,
  status: { type: String, enum: ['scheduled','ongoing','completed','cancelled'], default: 'scheduled' }
}, { timestamps: true });

module.exports = mongoose.model('TripSchedule', TripScheduleSchema);
