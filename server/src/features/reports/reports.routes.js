const express = require('express');
const router = express.Router();
const ctrl = require('./reports.controller');
const authenticate = require('../../middleware/auth.middleware');
const authorize = require('../../middleware/role.middleware');
const { RoleGroups } = require('../../constants');

router.get('/reports/quotations', authenticate, authorize(RoleGroups.INTERNAL), ctrl.getQuotationReport);
router.get('/reports/quotations/export', authenticate, authorize([RoleGroups.MANAGERS, RoleGroups.FINANCE]), ctrl.exportQuotationReport);
router.get('/reports/sales-performance', authenticate, authorize([RoleGroups.MANAGERS, RoleGroups.FINANCE]), ctrl.getSalesPerformanceReport);
router.get('/reports/product-analysis', authenticate, authorize([RoleGroups.MANAGERS, RoleGroups.FINANCE]), ctrl.getProductAnalysisReport);
router.get('/reports/discount-summary', authenticate, authorize([RoleGroups.MANAGERS, RoleGroups.FINANCE]), ctrl.getDiscountSummaryReport);
router.get('/reports/pool-utilization', authenticate, authorize([RoleGroups.MANAGERS, RoleGroups.FINANCE]), ctrl.getPoolUtilizationReport);
router.get('/reports/negotiation-outcomes', authenticate, authorize([RoleGroups.MANAGERS, RoleGroups.FINANCE]), ctrl.getNegotiationOutcomesReport);

module.exports = router;
