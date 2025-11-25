const TripSchedule = require('../models/TripSchedule');

exports.getAssignments = async (req, res) => {
  try {
    const driverId = req.user.id;
    const assignments = await TripSchedule.find({ driver: driverId, status: { $in: ['scheduled','ongoing'] } }).populate('route');
    res.json({ assignments });
  } catch (err) {
    console.error('getAssignments', err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.startTrip = async (req, res) => {
  try {
    const driverId = req.user.id;
    const tripId = req.params.tripId;
    const trip = await TripSchedule.findById(tripId);
    if (!trip) return res.status(404).json({ error: 'Trip not found' });
    if (String(trip.driver) !== String(driverId)) return res.status(403).json({ error: 'Not your trip' });

    trip.status = 'ongoing';
    await trip.save();

    // notify via socket
    const io = req.app.get('io');
    if (io) io.to(`trip:${trip._id}`).emit('trip:started', { tripId: trip._id });

    res.json({ message: 'Trip started', trip });
  } catch (err) {
    console.error('startTrip', err);
    res.status(500).json({ error: 'Server error' });
  }
});

