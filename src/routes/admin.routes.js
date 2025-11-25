const router = require('express').Router();
const auth = require('../middleware/auth');
const requireRole = require('../middleware/roles');
const adminController = require('../controllers/admin.controller');

router.get('/driver-applications', auth, requireRole('admin'), adminController.listDriverApplications);
router.post('/driver-applications/:id/approve', auth, requireRole('admin'), adminController.approveApplication);

module.exports = router;
