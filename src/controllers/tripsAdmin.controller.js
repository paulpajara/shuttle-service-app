const TripSchedule = require('../models/TripSchedule');

exports.createTrip = async (req, res) => {
  try {
    const { route, departureTime, arrivalTime, shuttleId, driver, capacity, fare } = req.body;
    const trip = await TripSchedule.create({ route, departureTime, arrivalTime, shuttleId, driver, capacity, fare });
    res.json({ trip });
  } catch (err) {
    console.error('createTrip', err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.listTripsAdmin = async (req, res) => {
  try {
    const trips = await TripSchedule.find().populate('route driver').sort({ departureTime: 1 });
    res.json({ trips });
  } catch (err) {
    console.error('listTripsAdmin', err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.updateTrip = async (req, res) => {
  try {
    const updates = req.body;
    const trip = await TripSchedule.findByIdAndUpdate(req.params.id, updates, { new: true });
    if (!trip) return res.status(404).json({ error: 'Not found' });
    res.json({ trip });
  } catch (err) {
    console.error('updateTrip', err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.deleteTrip = async (req, res) => {
  try {
    await TripSchedule.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (err) {
    console.error('deleteTrip', err);
    res.status(500).json({ error: 'Server error' });
  }
};
