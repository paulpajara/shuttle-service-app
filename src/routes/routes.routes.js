const router = require('express').Router();
const auth = require('../middleware/auth');
const requireRole = require('../middleware/roles');
const ctrl = require('../controllers/routes.controller');

router.post('/', auth, requireRole('admin'), ctrl.createRoute);
router.get('/', auth, ctrl.listRoutes); // allow authenticated users to view
router.get('/:id', auth, ctrl.getRoute);
router.patch('/:id', auth, requireRole('admin'), ctrl.updateRoute);
router.delete('/:id', auth, requireRole('admin'), ctrl.deleteRoute);

module.exports = router;
