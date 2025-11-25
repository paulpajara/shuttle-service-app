const TripSchedule = require('../models/TripSchedule');
const { estimateEtaTimestamp, haversineKm } = require('../utils/geo');
const ShuttleStatus = require('../models/ShuttleStatus');

async function etaToStop(tripScheduleId, stopIdentifier, options = {}) {
  const trip = await TripSchedule.findById(tripScheduleId).populate('route');
  if (!trip) throw new Error('TripSchedule not found');

  const route = trip.route;
  if (!route) throw new Error('Route not assigned to trip');

  let stop;
  if (typeof stopIdentifier === 'number') {
    stop = route.stops.find(s => s.order === stopIdentifier) || route.stops[stopIdentifier];
  } else {
    stop = route.stops.find(s => s.name.toLowerCase() === String(stopIdentifier).toLowerCase());
  }
  if (!stop) throw new Error('Stop not found');

  const status = await ShuttleStatus.findOne({ tripSchedule: trip._id }).sort({ timestamp: -1 });
  if (!status) throw new Error('No shuttle telemetry available');

  const avgSpeedKmH = options.avgSpeedKmH || 20;
  const from = { lat: status.location.lat, lng: status.location.lng };
  const to = { lat: stop.lat, lng: stop.lng };

  const eta = estimateEtaTimestamp(from, to, avgSpeedKmH);
  const distanceKm = haversineKm(from, to);

  return { eta, distanceKm, shuttleLocation: from, stop };
}

module.exports = { etaToStop };
