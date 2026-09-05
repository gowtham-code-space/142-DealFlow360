const express = require('express');
const router = express.Router();
const ctrl = require('./quotations.controller');
const authenticate = require('../../middleware/auth.middleware');
const authorize = require('../../middleware/role.middleware');
const { RoleGroups } = require('../../constants');

// Quotes
router.get('/', authenticate, authorize(RoleGroups.INTERNAL), ctrl.listQuotes);
router.post('/', authenticate, authorize(RoleGroups.SALES), ctrl.createQuote);
router.get('/:quoteId', authenticate, authorize(RoleGroups.INTERNAL), ctrl.getQuoteById);
router.patch('/:quoteId', authenticate, authorize(RoleGroups.SALES), ctrl.updateQuote);
router.post('/:quoteId/submit', authenticate, authorize(RoleGroups.SALES), ctrl.submitQuote);
router.post('/:quoteId/send-to-customer', authenticate, authorize(RoleGroups.MANAGERS), ctrl.sendToCustomer);
router.post('/:quoteId/recalculate', authenticate, authorize(RoleGroups.SALES), ctrl.recalculate);
router.get('/:quoteId/risk', authenticate, authorize(RoleGroups.INTERNAL), ctrl.getQuoteRisk);

// Deposits
router.get('/:quoteId/deposit', authenticate, authorize(RoleGroups.INTERNAL), ctrl.getDeposit);
router.post('/:quoteId/deposit', authenticate, authorize(RoleGroups.INTERNAL), ctrl.createDeposit);
router.post('/:quoteId/deposit/refund', authenticate, authorize(RoleGroups.MANAGERS), ctrl.refundDeposit);

// Lines
router.get('/:quoteId/lines', authenticate, authorize(RoleGroups.INTERNAL), ctrl.listLines);
router.post('/:quoteId/lines', authenticate, authorize(RoleGroups.SALES), ctrl.addLine);
router.patch('/:quoteId/lines/:lineId', authenticate, authorize(RoleGroups.SALES), ctrl.updateLine);
router.delete('/:quoteId/lines/:lineId', authenticate, authorize(RoleGroups.SALES), ctrl.deleteLine);
router.get('/:quoteId/lines/:lineId/discount-breakdown', authenticate, authorize(RoleGroups.INTERNAL), ctrl.getDiscountBreakdown);

// Line Comments
router.get('/:quoteId/lines/:lineId/comments', authenticate, authorize(RoleGroups.INTERNAL), ctrl.listLineComments);
router.post('/:quoteId/lines/:lineId/comments', authenticate, ctrl.addLineComment);

module.exports = router;
