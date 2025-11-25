const router = require('express').Router();
const auth = require('../middleware/auth');
const ctrl = require('../controllers/notifications.controller');

// register current user's push token
router.post('/register', auth, ctrl.registerToken);

// send a test push (optional)
router.post('/test', auth, ctrl.sendTest);

module.exports = router;
