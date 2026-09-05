const express = require('express');
const router = express.Router();
const ctrl = require('./billing.controller');
const authenticate = require('../../middleware/auth.middleware');
const authorize = require('../../middleware/role.middleware');
const { RoleGroups } = require('../../constants');

// Invoices
router.get('/invoices', authenticate, authorize(RoleGroups.ALL_USERS), ctrl.listInvoices);
router.get('/invoices/:id', authenticate, authorize(RoleGroups.ALL_USERS), ctrl.getInvoiceById);

// Quote Billing
router.post('/quotes/:id/billing/generate', authenticate, authorize(RoleGroups.INTERNAL), ctrl.generateBilling);
router.get('/quotes/:id/billing', authenticate, authorize(RoleGroups.ALL_USERS), ctrl.getQuoteBilling);

// Subscriptions
router.get('/subscriptions', authenticate, authorize(RoleGroups.ALL_USERS), ctrl.listSubscriptions);
router.get('/subscriptions/:id', authenticate, authorize(RoleGroups.ALL_USERS), ctrl.getSubscriptionById);
router.patch('/subscriptions/:id', authenticate, authorize(RoleGroups.MANAGERS, RoleGroups.FINANCE), ctrl.modifySubscription);
router.post('/subscriptions/:id/cancel', authenticate, authorize(RoleGroups.MANAGERS, RoleGroups.FINANCE), ctrl.cancelSubscription);
router.get('/subscriptions/:id/proration-preview', authenticate, authorize(RoleGroups.MANAGERS, RoleGroups.FINANCE), ctrl.getProrationPreview);

// Payments
router.get('/payments', authenticate, authorize(RoleGroups.ALL_USERS), ctrl.listPayments);
router.post('/invoices/:id/payments', authenticate, authorize(RoleGroups.ALL_USERS), ctrl.recordPayment);
router.get('/invoices/:id/payments', authenticate, authorize(RoleGroups.ALL_USERS), ctrl.getInvoicePayments);

module.exports = router;
