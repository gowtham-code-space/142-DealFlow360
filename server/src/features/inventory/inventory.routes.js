const express = require('express');
const router = express.Router();
const ctrl = require('../warehouses/warehouses.controller');
const authenticate = require('../../middleware/auth.middleware');
const authorize = require('../../middleware/role.middleware');
const { RoleGroups } = require('../../constants');

router.get('/', authenticate, authorize(RoleGroups.INTERNAL), ctrl.listAllInventory);
router.get('/region-demand', authenticate, authorize(RoleGroups.INTERNAL), ctrl.listRegionDemand);
router.get('/restock-recommendations', authenticate, authorize(RoleGroups.INTERNAL), ctrl.getRestockRecommendations);

module.exports = router;
