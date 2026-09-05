const express = require('express');
const router = express.Router();
const ctrl = require('./negotiation.controller');
const authenticate = require('../../middleware/auth.middleware');
const authorize = require('../../middleware/role.middleware');
const { RoleGroups } = require('../../constants');

// Negotiation Tickets endpoints
router.get('/negotiation-tickets', authenticate, authorize(RoleGroups.SALES), ctrl.listNegotiationTickets);
router.post('/negotiation-tickets', authenticate, authorize(RoleGroups.ALL_USERS), ctrl.createNegotiationTicket);
router.get('/quotes/:quoteId/negotiation-tickets', authenticate, authorize(RoleGroups.ALL_USERS), ctrl.listQuoteNegotiationTickets);
router.get('/negotiation-tickets/:ticketId', authenticate, authorize(RoleGroups.ALL_USERS), ctrl.getNegotiationTicketById);
router.post('/negotiation-tickets/:ticketId/accept', authenticate, authorize(RoleGroups.SALES), ctrl.acceptNegotiationTicket);
router.post('/negotiation-tickets/:ticketId/reject', authenticate, authorize(RoleGroups.SALES), ctrl.rejectNegotiationTicket);
router.post('/negotiation-tickets/:ticketId/counter', authenticate, authorize(RoleGroups.SALES), ctrl.counterNegotiationTicket);
router.get('/negotiation-tickets/:ticketId/hold-status', authenticate, authorize(RoleGroups.ALL_USERS), ctrl.getTicketHoldStatus);

// Quote negotiation messages/threads
router.get('/quotes/:id/negotiations', authenticate, authorize(RoleGroups.ALL_USERS), ctrl.listNegotiations);
router.post('/quotes/:id/negotiations', authenticate, authorize(RoleGroups.ALL_USERS), ctrl.createNegotiationMessage);

module.exports = router;
