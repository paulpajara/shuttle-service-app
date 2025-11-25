const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');

const authRoutes = require('./routes/auth.routes');
const driverRoutes = require('./routes/driver.routes');
const adminRoutes = require('./routes/admin.routes');
const tripsRoutes = require('./routes/trips.routes');
const ridesRoutes = require('./routes/rides.routes');
const telemetryRoutes = require('./routes/telemetry.routes');
const routesRoutes = require('./routes/routes.routes');
const tripsAdminRoutes = require('./routes/tripsAdmin.routes');
const driverAssignmentsRoutes = require('./routes/driverAssignments.routes');
const adminUsersRoutes = require('./routes/adminUsers.routes');
const notificationsRoutes = require('./routes/notifications.routes');

function createApp() {
  const app = express();
  app.use(cors());
  app.use(express.json());

  app.use('/api/auth', authRoutes);
  app.use('/api/driver', driverRoutes);
  app.use('/api/admin', adminRoutes);
  app.use('/api/trips', tripsRoutes);
  app.use('/api/rides', ridesRoutes);
  app.use('/api/telemetry', telemetryRoutes);
  app.use('/api/routes', routesRoutes);
  app.use('/api/trips-admin', tripsAdminRoutes);
  app.use('/api/driver', driverAssignmentsRoutes); // driver assignments mixed into /api/driver
  app.use('/api/admin', adminRoutes);
  app.use('/api/admin', adminUsersRoutes); // admin user management under same admin prefix
  app.use('/api/notifications', notificationsRoutes);

  app.get('/health', (req, res) => res.json({ ok: true }));

  return app;
}

async function createServer({ expressApp }) {
  const server = http.createServer(expressApp);
  const io = new Server(server, { cors: { origin: '*' } });

  expressApp.set('io', io);

  const ShuttleStatus = require('./models/ShuttleStatus');
  const TripSchedule = require('./models/TripSchedule');
  const Ride = require('./models/Ride');
  const { haversineKm } = require('./utils/geo');

  io.on('connection', socket => {
    console.log('Socket connected', socket.id);

    socket.on('join', ({ room }) => {
      if (room) socket.join(room);
    });

    socket.on('shuttle:update', async (data) => {
      try {
        const {
          tripScheduleId, routeId, shuttleId, lat, lng, speed = null, heading = null, timestamp = null
        } = data;

        const ss = await ShuttleStatus.create({
          shuttleId: shuttleId || null,
          tripSchedule: tripScheduleId || null,
          location: { lat, lng },
          speed,
          heading,
          timestamp: timestamp ? new Date(timestamp) : new Date()
        });

        if (routeId) {
          io.to(`route:${routeId}`).emit('shuttle:update', ss);
        } else if (tripScheduleId) {
          io.to(`trip:${tripScheduleId}`).emit('shuttle:update', ss);
        } else {
          io.emit('shuttle:update', ss);
        }

        if (tripScheduleId) {
          const trip = await TripSchedule.findById(tripScheduleId).populate('route');
          if (trip && trip.route && trip.route.stops && trip.route.stops.length) {
            const bookedRides = await Ride.find({ tripSchedule: tripScheduleId, status: 'booked' }).populate('passenger');
            for (const ride of bookedRides) {
              const stop = trip.route.stops.find(s => s.name.toLowerCase() === (ride.pickupStop || '').toLowerCase());
              if (!stop) continue;
              const from = { lat, lng };
              const to = { lat: stop.lat, lng: stop.lng };
              const avgSpeedKmH = speed && speed > 2 ? speed : 20;
              const hours = haversineKm(from, to) / avgSpeedKmH;
              const etaMs = Date.now() + Math.round(hours * 3600 * 1000);
              const eta = new Date(etaMs);
              const thresholdMs = (2 * 60 * 1000);
              if (etaMs - Date.now() <= thresholdMs) {
                io.to(`passenger:${ride.passenger._id}`).emit('notification:arriving', {
                  rideId: ride._id,
                  tripScheduleId,
                  eta,
                  message: `Shuttle arriving at pickup ${ride.pickupStop} in ~${Math.max(1, Math.round((etaMs - Date.now())/60000))} min`
                });
              }
            }
          }
        }

      } catch (err) {
        console.error('shuttle:update error', err);
      }
    });

    socket.on('disconnect', () => {});
  });

  return { server, io };
}

module.exports = { createApp, createServer };
