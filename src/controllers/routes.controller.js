const Route = require('../models/Route');

exports.createRoute = async (req, res) => {
  try {
    const { name, stops, segmentTimes } = req.body;
    const route = await Route.create({ name, stops, segmentTimes });
    res.json({ route });
  } catch (err) {
    console.error('createRoute', err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.listRoutes = async (req, res) => {
  try {
    const routes = await Route.find().sort({ name: 1 });
    res.json({ routes });
  } catch (err) {
    console.error('listRoutes', err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.getRoute = async (req, res) => {
  try {
    const r = await Route.findById(req.params.id);
    if (!r) return res.status(404).json({ error: 'Not found' });
    res.json({ route: r });
  } catch (err) {
    console.error('getRoute', err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.updateRoute = async (req, res) => {
  try {
    const updates = req.body;
    const r = await Route.findByIdAndUpdate(req.params.id, updates, { new: true });
    if (!r) return res.status(404).json({ error: 'Not found' });
    res.json({ route: r });
  } catch (err) {
    console.error('updateRoute', err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.deleteRoute = async (req, res) => {
  try {
    await Route.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (err) {
    console.error('deleteRoute', err);
    res.status(500).json({ error: 'Server error' });
  }
};
