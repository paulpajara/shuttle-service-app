 //handles POST /api/telemetry as a fallback
 //intentionally duplicates alot of the socket handler logic so telemetry POSTs and socket telemetry behave consistently (TODO: evaluate if need change)

const ShuttleStatus = require('../models/ShuttleStatus');
const TripSchedule = require('../models/TripSchedule');
const Ride = require('../models/Ride');
const { haversineKm } = require('../utils/geo');
const notifications = require('./notifications.controller'); // to fetch tokens
const { sendExpoPush } = require('../services/notifications.service');

exports.postTelemetry = async (req, res) => {
  try {
    const { tripScheduleId, routeId, shuttleId, lat, lng, speed = null, heading = null, timestamp = null } = req.body;
    if (typeof lat === 'undefined' || typeof lng === 'undefined') return res.status(400).json({ error: 'lat/lng required' });

    //persist telemetry
    const ss = await ShuttleStatus.create({
      shuttleId: shuttleId || null,
      tripSchedule: tripScheduleId || null,
      location: { lat, lng },
      speed,
      heading,
      timestamp: timestamp ? new Date(timestamp) : new Date()
    });

    const io = req.app.get('io');

    //broadcast telemetry to appropriate rooms
    if (io) {
      if (routeId) io.to(`route:${routeId}`).emit('shuttle:update', ss);
      else if (tripScheduleId) io.to(`trip:${tripScheduleId}`).emit('shuttle:update', ss);
      else io.emit('shuttle:update', ss);
    }

    //if telemetry belongs to a trip, possibly auto-start the trip (if scheduled)
    if (tripScheduleId) {
      const trip = await TripSchedule.findById(tripScheduleId);
      if (trip && trip.status === 'scheduled') {
        //update to ongoing and emit event so drivers/passengers know trip started
        trip.status = 'ongoing';
        await trip.save();
        if (io) io.to(`trip:${trip._id}`).emit('trip:started', { tripId: trip._id });

        // TODO: log audit action
      }
    }

    //notify passengers nearing pickup stop
    if (tripScheduleId) {
      const trip = await TripSchedule.findById(tripScheduleId).populate('route');
      if (trip && trip.route && trip.route.stops && trip.route.stops.length) {
        const bookedRides = await Ride.find({ tripSchedule: tripScheduleId, status: 'booked' }).populate('passenger');
        for (const ride of bookedRides) {
          // find stop by name
          const stop = trip.route.stops.find(s => s.name.toLowerCase() === (ride.pickupStop || '').toLowerCase());
          if (!stop) continue;

          //compute ETA
          const from = { lat, lng };
          const to = { lat: stop.lat, lng: stop.lng };
          const avgSpeedKmH = speed && speed > 2 ? speed : 20;
          const hours = haversineKm(from, to) / avgSpeedKmH;
          const etaMs = Date.now() + Math.round(hours * 3600 * 1000);

          // threshold: 2 minutes
          const thresholdMs = 2 * 60 * 1000;
          if (etaMs - Date.now() <= thresholdMs) {
            //send socket notification if possible
            if (io) {
              io.to(`passenger:${ride.passenger._id}`).emit('notification:arriving', {
                rideId: ride._id,
                tripScheduleId,
                eta: new Date(etaMs),
                message: `Shuttle arriving at pickup ${ride.pickupStop} shortly`
              });
            }
            //send push notificationif passenger registered tokens
            const tokens = await notifications.getTokensForUser(ride.passenger._id);
            if (tokens && tokens.length) {
              try {
                await sendExpoPush(tokens, {
                  title: 'Shuttle arriving soon',
                  body: `Shuttle arriving at ${ride.pickupStop} in ~${Math.max(1, Math.round((etaMs - Date.now())/60000))} min`,
                  data: { rideId: ride._id, tripScheduleId }
                });
              } catch (err) {
                console.warn('push send failed', err.message);
              }
            }
          }
        }
      }
    }

    return res.json({ message: 'Telemetry saved', ss });
  } catch (err) {
    console.error('postTelemetry', err);
    res.status(500).json({ error: 'Server error' });
  }
};
