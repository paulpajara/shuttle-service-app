const router = require('express').Router();
const { listTrips, getEta, getEtaSegmented } = require('../controllers/trip.controller');
const auth = require('../middleware/auth');

router.get('/', listTrips);
router.get('/:id/eta', auth, getEta);
router.get('/:id/eta-segmented', auth, getEtaSegmented);

module.exports = router;
