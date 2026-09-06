const express = require('express');
const router = express.Router();
const ctrl = require('./portal.controller');
const authenticate = require('../../middleware/auth.middleware');
const authorize = require('../../middleware/role.middleware');

// Customer-only Portal endpoints
router.get('/portal/resources', authenticate, authorize('CUSTOMER'), ctrl.portalListResources);
router.post('/portal/holds', authenticate, authorize('CUSTOMER'), ctrl.portalCreateHolds);
router.post('/portal/resources/:productId/hold', authenticate, authorize('CUSTOMER'), ctrl.portalCreateHold);
router.get('/portal/holds/:holdId', authenticate, authorize('CUSTOMER'), ctrl.portalGetHold);
router.post('/portal/quotes/generate', authenticate, authorize('CUSTOMER'), ctrl.portalGenerateQuote);
router.get('/portal/quotes', authenticate, authorize('CUSTOMER'), ctrl.portalListQuotes);
router.get('/portal/quotes/:quoteId', authenticate, authorize('CUSTOMER'), ctrl.portalGetQuote);
router.get('/portal/quotes/:quoteId/lines', authenticate, authorize('CUSTOMER'), ctrl.portalGetQuoteLines);
router.get('/portal/quotes/:quoteId/status', authenticate, authorize('CUSTOMER'), ctrl.portalGetQuoteStatus);
router.post('/portal/quotes/:quoteId/negotiate', authenticate, authorize('CUSTOMER'), ctrl.portalNegotiate);
router.post('/portal/quotes/:quoteId/lines/:lineId/comment', authenticate, authorize('CUSTOMER'), ctrl.portalAddLineComment);
router.post('/portal/quotes/:quoteId/confirm', authenticate, authorize('CUSTOMER'), ctrl.portalConfirmQuote);
router.get('/portal/quotes/:quoteId/deposit-info', authenticate, authorize('CUSTOMER'), ctrl.portalGetDepositInfo);
router.post('/portal/quotes/:quoteId/deposit/pay', authenticate, authorize('CUSTOMER'), ctrl.portalPayDeposit);
router.get('/portal/negotiation-tickets', authenticate, authorize('CUSTOMER'), ctrl.portalListTickets);
router.get('/portal/negotiation-tickets/:ticketId', authenticate, authorize('CUSTOMER'), ctrl.portalGetTicket);

module.exports = router;
