const router = require('express').Router();
const auth = require('../middleware/auth');
const driverController = require('../controllers/driver.controller');

router.post('/apply', auth, driverController.apply);

module.exports = router;
