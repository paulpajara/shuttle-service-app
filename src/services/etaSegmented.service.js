const TripSchedule = require('../models/TripSchedule');
const ShuttleStatus = require('../models/ShuttleStatus');
const { haversineKm } = require('../utils/geo');

function findNearestSegment(stops, shuttleLoc) {
  let minDist = Infinity;
  let closestSegment = 0;
  for (let i = 0; i < stops.length - 1; i++) {
    const mid = {
      lat: (stops[i].lat + stops[i+1].lat) / 2,
      lng: (stops[i].lng + stops[i+1].lng) / 2
    };
    const d = haversineKm(shuttleLoc, mid);
    if (d < minDist) {
      minDist = d;
      closestSegment = i;
    }
  }
  return closestSegment;
}

async function etaSegmented(tripScheduleId, stopIdentifier) {
  const trip = await TripSchedule.findById(tripScheduleId).populate('route');
  if (!trip) throw new Error('Trip not found');
  const route = trip.route;
  if (!route) throw new Error('Route not found');

  let stop;
  if (typeof stopIdentifier === 'number') {
    stop = route.stops.find(s => s.order === stopIdentifier);
  } else {
    stop = route.stops.find(s => s.name.toLowerCase() === stopIdentifier.toLowerCase());
  }
  if (!stop) throw new Error('Stop not found');

  const targetIndex = stop.order;
  const status = await ShuttleStatus.findOne({ tripSchedule: trip._id }).sort({ timestamp: -1 });
  if (!status) throw new Error('No shuttle status found');

  const shuttleLoc = status.location;
  const currSegment = findNearestSegment(route.stops, shuttleLoc);

  if (currSegment >= targetIndex) {
    return { eta: new Date(), debug: 'Shuttle already past stop' };
  }

  let remainingMinutes = 0;
  const currStop = route.stops[currSegment];
  const nextStop = route.stops[currSegment + 1];

  const distFull = haversineKm(currStop, nextStop);
  const distCurrent = haversineKm(currStop, shuttleLoc);
  const progress = Math.min(distCurrent / distFull, 1);
  const currSegMinutes = route.segmentTimes && route.segmentTimes[currSegment] ? route.segmentTimes[currSegment] : 3;
  const remainingCurrSeg = currSegMinutes * (1 - progress);
  remainingMinutes += remainingCurrSeg;

  for (let i = currSegment + 1; i < targetIndex; i++) {
    remainingMinutes += (route.segmentTimes && route.segmentTimes[i]) ? route.segmentTimes[i] : 3;
  }

  const eta = new Date(Date.now() + remainingMinutes * 60 * 1000);

  return {
    eta,
    remainingMinutes,
    shuttleLocation: shuttleLoc,
    currentSegment: currSegment,
    segmentsRemaining: targetIndex - currSegment
  };
}

module.exports = { etaSegmented };
