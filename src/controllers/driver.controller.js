/**
 * driver.controller.js (extended)
 *
 * - apply: driver application (existing)
 * - endTrip: driver explicitly ends an ongoing trip (marks trip completed)
 *
 * Keep other driver responsibilities minimal here.
 */

const DriverApplication = require('../models/DriverApplication');
const TripSchedule = require('../models/TripSchedule');
const Ride = require('../models/Ride');
const { sendExpoPush } = require('../services/notifications.service');
const notifications = require('./notifications.controller');

exports.apply = async (req, res) => {
  try {
    const userId = req.user.id;
    const { licenseNumber, vehicleInfo } = req.body;
    const exists = await DriverApplication.findOne({ user: userId, status: 'pending' });
    if (exists) return res.status(400).json({ error: 'Application already pending' });

    const app = await DriverApplication.create({ user: userId, licenseNumber, vehicleInfo });

    const io = req.app.get('io');
    if (io) io.to('admin:notifications').emit('application:new', { applicationId: app._id });

    res.json({ message: 'Application submitted', applicationId: app._id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

/**
 * Driver explicitly ends a trip (driver-initiated end).
 * Marks trip as completed and notifies passengers.
 */
exports.endTrip = async (req, res) => {
  try {
    const driverId = req.user.id;
    const tripId = req.params.tripId;
    const trip = await TripSchedule.findById(tripId);
    if (!trip) return res.status(404).json({ error: 'Trip not found' });
    if (String(trip.driver) !== String(driverId)) return res.status(403).json({ error: 'Not your trip' });

    trip.status = 'completed';
    await trip.save();

    const io = req.app.get('io');
    if (io) io.to(`trip:${trip._id}`).emit('trip:completed', { tripId: trip._id });

    // notify passengers via push
    try {
      const rides = await Ride.find({ tripSchedule: trip._id }).populate('passenger');
      const tokens = [];
      for (const r of rides) {
        const t = notifications.getTokensForUser(r.passenger._id);
        tokens.push(...t);
      }
      if (tokens.length) {
        await sendExpoPush(tokens, {
          title: 'Trip ended',
          body: `Driver has ended trip ${trip._id}.`,
          data: { tripId: trip._id }
        });
      }
    } catch (err) {
      console.warn('endTrip push failed', err.message);
    }

    res.json({ message: 'Trip ended', trip });
  } catch (err) {
    console.error('endTrip', err);
    res.status(500).json({ error: 'Server error' });
  }
};
