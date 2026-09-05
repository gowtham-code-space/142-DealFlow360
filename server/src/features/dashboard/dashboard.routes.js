const express = require('express');
const router = express.Router();
const ctrl = require('./dashboard.controller');
const authenticate = require('../../middleware/auth.middleware');
const authorize = require('../../middleware/role.middleware');
const { RoleGroups } = require('../../constants');

router.get('/dashboard/summary', authenticate, authorize(RoleGroups.INTERNAL), ctrl.getSummary);
router.get('/dashboard/stalled-deals', authenticate, authorize(RoleGroups.SALES), ctrl.getStalledDeals);
router.get('/dashboard/discount-anomalies', authenticate, authorize([RoleGroups.MANAGERS, RoleGroups.FINANCE]), ctrl.getDiscountAnomalies);
router.get('/dashboard/delivery-slippage', authenticate, authorize(RoleGroups.INTERNAL), ctrl.getDeliverySlippage);
router.get('/dashboard/deal-health', authenticate, authorize(RoleGroups.INTERNAL), ctrl.getDealHealth);
router.get('/dashboard/pipeline', authenticate, authorize(RoleGroups.SALES), ctrl.getPipeline);
router.get('/dashboard/region-demand', authenticate, authorize(RoleGroups.INTERNAL), ctrl.getRegionDemand);
router.get('/dashboard/pool-health', authenticate, authorize(RoleGroups.INTERNAL), ctrl.getPoolHealth);

module.exports = router;
