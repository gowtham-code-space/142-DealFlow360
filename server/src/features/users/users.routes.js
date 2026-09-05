const express = require('express');
const router = express.Router();
const ctrl = require('./users.controller');
const authenticate = require('../../middleware/auth.middleware');
const authorize = require('../../middleware/role.middleware');
const { RoleGroups } = require('../../constants');

router.get('/', authenticate, authorize(RoleGroups.MANAGERS), ctrl.listUsers);
router.post('/', authenticate, authorize(RoleGroups.ADMIN_ONLY), ctrl.createUser);
router.post('/bulk', authenticate, authorize(RoleGroups.ADMIN_ONLY), ctrl.bulkCreateUsers);
router.get('/:userId', authenticate, authorize(RoleGroups.MANAGERS), ctrl.getUserById);
router.patch('/:userId', authenticate, authorize(RoleGroups.ADMIN_ONLY), ctrl.updateUser);
router.delete('/:userId', authenticate, authorize(RoleGroups.ADMIN_ONLY), ctrl.softDeleteUser);
router.post('/:userId/reactivate', authenticate, authorize(RoleGroups.ADMIN_ONLY), ctrl.reactivateUser);

module.exports = router;
