/**
 * Ride booking and lifecycle:
 * - createRide: validate stops, capacity, prevent duplicates, emit ride:booked
 * - markBoarded / markCompleted: driver-only actions, emit socket events to passenger
 * - after a ride is marked 'completed', we check if all rides for the trip are completed.
 *   if so, we mark the TripSchedule as 'completed' and emit trip:completed.
 *
 */

const Ride = require('../models/Ride');
const TripSchedule = require('../models/TripSchedule');
const { sendExpoPush } = require('../services/notifications.service');
const notifications = require('./notifications.controller');

async function createRide(req, res) {
  try {
    const passengerId = req.user.id;
    const { tripScheduleId, pickupStop, dropoffStop } = req.body;
    const trip = await TripSchedule.findById(tripScheduleId).populate('route');
    if (!trip) return res.status(404).json({ error: 'Trip not found' });
    if (trip.status === 'cancelled' || trip.status === 'completed') return res.status(400).json({ error: 'Trip not available' });

    // validate stops exist in route
    const stops = trip.route?.stops || [];
    const pickupExists = stops.some(s => s.name.toLowerCase() === (pickupStop||'').toLowerCase());
    const dropExists = stops.some(s => s.name.toLowerCase() === (dropoffStop||'').toLowerCase());
    if (!pickupExists || !dropExists) return res.status(400).json({ error: 'Invalid pickup/dropoff' });

    //capacity check
    if (trip.capacity) {
      const bookedCount = await Ride.countDocuments({ tripSchedule: tripScheduleId, status: { $in: ['booked','boarded'] } });
      if (bookedCount >= trip.capacity) return res.status(400).json({ error: 'Trip full' });
    }

    //prevent duplicate booking by same passenger for same trip
    const existing = await Ride.findOne({ passenger: passengerId, tripSchedule: tripScheduleId, status: { $in: ['booked','boarded'] } });
    if (existing) return res.status(400).json({ error: 'Already booked' });

    const ride = await Ride.create({
      passenger: passengerId,
      tripSchedule: trip._id,
      pickupStop, dropoffStop,
      status: 'booked',
      timeBooked: new Date()
    });

    //emit socket update for driver/admin to see new booking
    const io = req.app.get('io');
    if (io) {
      io.to(`trip:${trip._id}`).emit('ride:booked', { rideId: ride._id, passenger: passengerId, pickupStop, dropoffStop });
    }

    res.json({ message: 'Ride booked', ride });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
}

async function getRidesForUser(req, res) {
  try {
    const userId = req.user.id;
    const rides = await Ride.find({ passenger: userId }).populate('tripSchedule').sort({ timeBooked: -1 });
    res.json({ rides });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
}

async function markBoarded(req, res) {
  try {
    const rideId = req.params.id;
    const ride = await Ride.findById(rideId);
    if (!ride) return res.status(404).json({ error: 'Ride not found' });

    const trip = await TripSchedule.findById(ride.tripSchedule);
    if (!trip) return res.status(404).json({ error: 'Trip not found' });
    if (String(trip.driver) !== String(req.user.id)) {
      return res.status(403).json({ error: 'Not your assigned trip' });
    }

    ride.status = 'boarded';
    ride.boardedAt = new Date();
    await ride.save();

    const io = req.app.get('io');
    if (io) io.to(`passenger:${ride.passenger}`).emit('ride:boarded', { rideId: ride._id, tripId: trip._id });

    res.json({ message: 'Marked boarded', ride });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
}

async function markCompleted(req, res) {
  try {
    const rideId = req.params.id;
    const ride = await Ride.findById(rideId);
    if (!ride) return res.status(404).json({ error: 'Ride not found' });

    const trip = await TripSchedule.findById(ride.tripSchedule);
    if (!trip) return res.status(404).json({ error: 'Trip not found' });
    if (String(trip.driver) !== String(req.user.id)) {
      return res.status(403).json({ error: 'Not your assigned trip' });
    }

    ride.status = 'completed';
    ride.completedAt = new Date();
    await ride.save();

    const io = req.app.get('io');
    if (io) io.to(`passenger:${ride.passenger}`).emit('ride:completed', { rideId: ride._id, tripId: trip._id });

    //after marking this ride complete, check if all rides for the trip are completed
    const pending = await Ride.countDocuments({ tripSchedule: trip._id, status: { $in: ['booked','boarded'] } });
    if (pending === 0) {
      //mark trip completed
      trip.status = 'completed';
      await trip.save();
      if (io) io.to(`trip:${trip._id}`).emit('trip:completed', { tripId: trip._id });

      //notify all passengers via push that trip finished
      try {
        //gather passenger tokens for every ride
        const rides = await Ride.find({ tripSchedule: trip._id }).populate('passenger');
        const tokens = [];
        const notificationsCtrl = require('./notifications.controller');
        for (const r of rides) {
          const t = await notificationsCtrl.getTokensForUser(ride.passenger._id);
          tokens.push(...t);
        }
        if (tokens.length) {
          await sendExpoPush(tokens, {
            title: 'Trip completed',
            body: `Trip ${trip._id} has completed.`,
            data: { tripId: trip._id }
          });
        }
      } catch (err) {
        console.warn('trip completion push failed', err.message);
      }
    }

    res.json({ message: 'Marked completed', ride });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
}

module.exports = { createRide, getRidesForUser, markBoarded, markCompleted };
