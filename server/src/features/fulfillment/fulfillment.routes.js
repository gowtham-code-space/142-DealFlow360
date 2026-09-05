const express = require('express');
const router = express.Router();
const ctrl = require('./fulfillment.controller');
const authenticate = require('../../middleware/auth.middleware');
const authorize = require('../../middleware/role.middleware');
const { RoleGroups } = require('../../constants');

// Quote allocation endpoints
router.get('/quotes/:id/allocation', authenticate, authorize(RoleGroups.INTERNAL), ctrl.getAllocation);
router.post('/quotes/:id/allocation/accept', authenticate, authorize(RoleGroups.MANAGERS), ctrl.acceptAllocation);
router.post('/quotes/:id/allocation/override', authenticate, authorize(RoleGroups.MANAGERS), ctrl.overrideAllocation);
router.get('/quotes/:id/allocations', authenticate, authorize(RoleGroups.INTERNAL), ctrl.listAllocations);

// Backorders endpoints
router.get('/backorders', authenticate, authorize(RoleGroups.MANAGERS), ctrl.listBackorders);
router.post('/backorders', authenticate, authorize(RoleGroups.MANAGERS), ctrl.createBackorder);
router.get('/backorders/:id', authenticate, authorize(RoleGroups.MANAGERS), ctrl.getBackorderById);
router.post('/backorders/:id/fulfill', authenticate, authorize(RoleGroups.MANAGERS), ctrl.fulfillBackorder);
router.post('/backorders/:id/cancel', authenticate, authorize(RoleGroups.MANAGERS), ctrl.cancelBackorder);

module.exports = router;
