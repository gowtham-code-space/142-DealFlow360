const express = require('express');
const router = express.Router();
const ctrl = require('./audit.controller');
const authenticate = require('../../middleware/auth.middleware');
const authorize = require('../../middleware/role.middleware');
const { RoleGroups } = require('../../constants');

router.get('/quotes/:quoteId/audit-logs', authenticate, authorize(RoleGroups.INTERNAL), ctrl.getQuoteAuditLogs);
router.get('/audit-logs', authenticate, authorize(RoleGroups.ADMIN_ONLY), ctrl.getGlobalAuditLogs);

module.exports = router;
