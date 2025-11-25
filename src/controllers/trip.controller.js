const TripSchedule = require('../models/TripSchedule');
const Route = require('../models/Route');
const { etaToStop } = require('../services/eta.service');
const { etaSegmented } = require('../services/etaSegmented.service');

async function listTrips(req, res) {
  try {
    const { start, end, route: routeQ, status } = req.query;
    const filter = {};

    if (start || end) {
      filter.departureTime = {};
      if (start) filter.departureTime.$gte = new Date(start);
      if (end) filter.departureTime.$lte = new Date(end);
    }

    if (status) filter.status = status;

    if (routeQ) {
      const route = await Route.findOne({
        $or: [{ _id: routeQ }, { name: routeQ }]
      });
      if (route) filter.route = route._id;
      else filter.route = null;
    }

    const trips = await TripSchedule.find(filter).populate('route driver').sort({ departureTime: 1 }).limit(500);
    res.json({ trips });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
}

async function getEta(req, res) {
  try {
    const tripId = req.params.id;
    const { stopName, stopIndex, avgSpeedKmH } = req.query;

    const stopIdentifier = (typeof stopIndex !== 'undefined') ? Number(stopIndex) : stopName;
    if (!stopIdentifier) return res.status(400).json({ error: 'Provide stopName or stopIndex' });

    const result = await etaToStop(tripId, stopIdentifier, { avgSpeedKmH: Number(avgSpeedKmH) || undefined });

    res.json({
      eta: result.eta,
      distanceKm: result.distanceKm,
      shuttleLocation: result.shuttleLocation,
      stop: result.stop
    });
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message || 'Failed to compute ETA' });
  }
}

async function getEtaSegmented(req, res) {
  try {
    const tripId = req.params.id;
    const { stopName, stopIndex } = req.query;

    const stopIdentifier = stopIndex ? Number(stopIndex) : stopName;
    if (!stopIdentifier) return res.status(400).json({ error: 'Provide stopName or stopIndex' });

    const result = await etaSegmented(tripId, stopIdentifier);

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message });
  }
}

module.exports = { listTrips, getEta, getEtaSegmented };
