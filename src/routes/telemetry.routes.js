const router = require('express').Router();
const auth = require('../middleware/auth');
const ctrl = require('../controllers/telemetry.controller');

router.post('/', auth, ctrl.postTelemetry);

module.exports = router;
