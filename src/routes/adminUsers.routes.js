const router = require('express').Router();
const auth = require('../middleware/auth');
const requireRole = require('../middleware/roles');
const ctrl = require('../controllers/adminUsers.controller');

router.get('/users', auth, requireRole('admin'), ctrl.listUsers);
router.post('/users', auth, requireRole('admin'), ctrl.createUser);
router.patch('/users/:id', auth, requireRole('admin'), ctrl.updateUser);
router.delete('/users/:id', auth, requireRole('admin'), ctrl.deleteUser);

module.exports = router;
