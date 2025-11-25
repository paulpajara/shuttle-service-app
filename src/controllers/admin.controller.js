const DriverApplication = require('../models/DriverApplication');
const User = require('../models/User');
const audit = require('../middleware/auditLogger');

exports.listDriverApplications = async (req, res) => {
  const apps = await DriverApplication.find().populate('user', 'email name').sort({ submittedAt: -1 });
  res.json({ apps });
};

exports.approveApplication = async (req, res) => {
  try {
    const appId = req.params.id;
    const application = await DriverApplication.findById(appId).populate('user');
    if (!application) return res.status(404).json({ error: 'Not found' });

    application.status = 'approved';
    application.reviewedBy = req.user.id;
    application.reviewedAt = new Date();
    await application.save();

    const user = await User.findById(application.user._id);
    user.role = 'driver';
    await user.save();

    await audit(req, 'approve_driver', 'DriverApplication', application._id, `Approved driver ${user.email}`);

    const io = req.app.get('io');
    if (io) io.to(`passenger:${user._id}`).emit('application:approved', { applicationId: application._id });

    res.json({ message: 'Approved' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};
