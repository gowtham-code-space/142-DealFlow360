const express = require('express');
const router = express.Router();
const ctrl = require('./approvals.controller');
const authenticate = require('../../middleware/auth.middleware');
const authorize = require('../../middleware/role.middleware');
const { RoleGroups } = require('../../constants');

router.get('/', authenticate, authorize(RoleGroups.APPROVERS), ctrl.listApprovals);
router.get('/:approvalId', authenticate, authorize(RoleGroups.APPROVERS), ctrl.getApprovalById);
router.post('/:approvalId/approve', authenticate, authorize(RoleGroups.APPROVERS), ctrl.approve);
router.post('/:approvalId/reject', authenticate, authorize([RoleGroups.MANAGERS, RoleGroups.FINANCE]), ctrl.reject);
router.post('/:approvalId/return', authenticate, authorize([RoleGroups.MANAGERS, RoleGroups.FINANCE]), ctrl.returnForEdit);

module.exports = router;
