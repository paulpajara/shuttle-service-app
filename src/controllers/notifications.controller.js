/**
 * stores push tokens in MongoDB in User.pushTokens array.
 * allows registering multiple devices per user.
 */

const User = require('../models/User');
const { sendExpoPush } = require('../services/notifications.service');

exports.registerToken = async (req, res) => {
  try {
    const userId = req.user.id;
    const { token } = req.body;

    if (!token) return res.status(400).json({ error: 'Token required' });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    //avoid duplicate tokens
    if (!user.pushTokens.includes(token)) {
      user.pushTokens.push(token);
      await user.save();
    }

    return res.json({ message: 'Token registered successfully' });
  } catch (err) {
    console.error('registerToken', err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.sendTest = async (req, res) => {
  try {
    const { token, title, body } = req.body;
    const result = await sendExpoPush(token, { title, body });
    res.json({ result });
  } catch (err) {
    console.error('sendTest', err);
    res.status(500).json({ error: 'Server error' });
  }
};

/**
 * helper used by other modules (e.g., telemetry, ride completion)
 */
exports.getTokensForUser = async (userId) => {
  const user = await User.findById(userId).select('pushTokens');
  return user?.pushTokens || [];
};
