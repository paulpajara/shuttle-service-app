const router = require('express').Router();
const auth = require('../middleware/auth');
const requireRole = require('../middleware/roles');
const ctrl = require('../controllers/driverAssignments.controller');
const driverCtrl = require('../controllers/driver.controller');

router.get('/assignments', auth, requireRole('driver'), ctrl.getAssignments);
router.patch('/assignments/:tripId/start', auth, requireRole('driver'), ctrl.startTrip);
// driver explicitly ends trip
router.patch('/assignments/:tripId/end', auth, requireRole('driver'), driverCtrl.endTrip);

module.exports = router;
