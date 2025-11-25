const router = require('express').Router();
const auth = require('../middleware/auth');
const requireRole = require('../middleware/roles');
const rides = require('../controllers/ride.controller');

router.post('/', auth, requireRole('passenger'), rides.createRide);
router.get('/', auth, requireRole('passenger'), rides.getRidesForUser);
router.post('/:id/board', auth, requireRole('driver'), rides.markBoarded);
router.post('/:id/complete', auth, requireRole('driver'), rides.markCompleted);

module.exports = router;
