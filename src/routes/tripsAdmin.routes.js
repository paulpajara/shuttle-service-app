const router = require('express').Router();
const auth = require('../middleware/auth');
const requireRole = require('../middleware/roles');
const ctrl = require('../controllers/tripsAdmin.controller');

router.post('/', auth, requireRole('admin'), ctrl.createTrip);
router.get('/admin', auth, requireRole('admin'), ctrl.listTripsAdmin);
router.patch('/:id', auth, requireRole('admin'), ctrl.updateTrip);
router.delete('/:id', auth, requireRole('admin'), ctrl.deleteTrip);

module.exports = router;
