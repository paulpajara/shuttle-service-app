const User = require('../models/User');
const bcrypt = require('bcryptjs');
const audit = require('../middleware/auditLogger');

exports.listUsers = async (req, res) => {
  try {
    const users = await User.find().select('-passwordHash').sort({ createdAt: -1 });
    res.json({ users });
  } catch (err) {
    console.error('listUsers', err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.createUser = async (req, res) => {
  try {
    const { email, password, name, role } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'email/password required' });
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ error: 'email exists' });
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ email, passwordHash, name, role: role || 'passenger' });
    await audit(req, 'create_user', 'User', user._id, `Created user ${user.email}`);
    res.json({ user: { id: user._id, email: user.email, role: user.role, name: user.name } });
  } catch (err) {
    console.error('createUser', err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const updates = req.body;
    if (updates.password) updates.passwordHash = await bcrypt.hash(updates.password, 10);
    delete updates.password;
    const user = await User.findByIdAndUpdate(req.params.id, updates, { new: true }).select('-passwordHash');
    if (!user) return res.status(404).json({ error: 'Not found' });
    await audit(req, 'update_user', 'User', user._id, `Updated user ${user.email}`);
    res.json({ user });
  } catch (err) {
    console.error('updateUser', err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    await audit(req, 'delete_user', 'User', req.params.id, `Deleted user ${req.params.id}`);
    res.json({ message: 'Deleted' });
  } catch (err) {
    console.error('deleteUser', err);
    res.status(500).json({ error: 'Server error' });
  }
};
