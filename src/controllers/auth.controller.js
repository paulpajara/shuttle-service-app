const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { isUniversityEmail } = require('../utils/emailCheck');

exports.register = async (req, res) => {
  try {
    const { email, password, name, role } = req.body;
    const requestedRole = role || 'passenger';
    if (requestedRole === 'passenger' && !isUniversityEmail(email)) {
      return res.status(400).json({ error: 'Use your university email' });
    }

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ error: 'Email exists' });

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ email, passwordHash, role: requestedRole, name });

    return res.json({ message: 'Registered', user: { id: user._id, email: user.email, role: user.role } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: 'Invalid credentials' });
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(400).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });

    return res.json({ token, user: { id: user._id, email: user.email, role: user.role } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.me = async (req, res) => {
  const UserModel = require('../models/User');
  const user = await UserModel.findById(req.user.id).select('-passwordHash');
  res.json({ user });
};
