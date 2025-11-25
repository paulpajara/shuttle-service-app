const mongoose = require('mongoose');

const RouteSchema = new mongoose.Schema({
  name: String,
  stops: [{ name: String, lat: Number, lng: Number, order: Number }],
  segmentTimes: [Number]
}, { timestamps: true });

module.exports = mongoose.model('Route', RouteSchema);
