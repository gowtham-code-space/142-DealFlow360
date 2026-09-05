const express = require('express');
const router = express.Router();
const ctrl = require('./customers.controller');
const authenticate = require('../../middleware/auth.middleware');
const authorize = require('../../middleware/role.middleware');
const { RoleGroups } = require('../../constants');

router.get('/', authenticate, authorize(RoleGroups.SALES), ctrl.listCustomers);
router.post('/', authenticate, authorize(RoleGroups.MANAGERS), ctrl.createCustomer);
router.get('/:customerId', authenticate, authorize(RoleGroups.SALES), ctrl.getCustomerById);
router.patch('/:customerId', authenticate, authorize(RoleGroups.MANAGERS), ctrl.updateCustomer);
router.delete('/:customerId', authenticate, authorize(RoleGroups.ADMIN_ONLY), ctrl.softDeleteCustomer);
router.post('/:customerId/reactivate', authenticate, authorize(RoleGroups.ADMIN_ONLY), ctrl.reactivateCustomer);
router.get('/:customerId/quotes', authenticate, authorize(RoleGroups.SALES), ctrl.getCustomerQuotes);

module.exports = router;
