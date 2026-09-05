const svc = require('./negotiation.service');
const {
  successResponse, createdResponse, badRequestResponse,
  notFoundResponse, conflictResponse, forbiddenResponse
} = require('../../utils/response');

async function listNegotiationTickets(req, res) {
  const { page, pageSize, status, quoteId } = req.query;
  const data = await svc.listNegotiationTickets({ page, pageSize, status, quoteId });
  return successResponse(res, 'Negotiation tickets retrieved', data);
}

async function listQuoteNegotiationTickets(req, res) {
  const data = await svc.listQuoteNegotiationTickets(req.params.quoteId);
  return successResponse(res, 'Quote negotiation tickets retrieved', data);
}

async function getNegotiationTicketById(req, res) {
  const data = await svc.getNegotiationTicketById(req.params.ticketId);
  if (!data) return notFoundResponse(res, 'Negotiation ticket not found');
  return successResponse(res, 'Negotiation ticket retrieved', data);
}

async function createNegotiationTicket(req, res) {
  const { quoteId, requestedDiscountPct, comments } = req.body;
  if (!quoteId || requestedDiscountPct === undefined) {
    return badRequestResponse(res, 'quoteId and requestedDiscountPct are required');
  }
  const data = await svc.createNegotiationTicket({
    quoteId,
    customerId: req.user?.customerId,
    requestedDiscountPct,
    comments
  });
  if (data?.notFound) return notFoundResponse(res, 'Quotation not found');
  return createdResponse(res, 'Negotiation ticket submitted and inventory held', data);
}

async function acceptNegotiationTicket(req, res) {
  const { purchaseDeadlineDays, comments } = req.body;
  const result = await svc.acceptNegotiationTicket(req.params.ticketId, { purchaseDeadlineDays, comments });
  if (result?.notFound) return notFoundResponse(res, 'Negotiation ticket not found');
  if (result?.invalidStatus) return conflictResponse(res, `Ticket cannot be accepted from current status ${result.currentStatus}`);
  return successResponse(res, 'Negotiation ticket accepted. Deadline set.', result);
}

async function rejectNegotiationTicket(req, res) {
  const { comments } = req.body;
  if (!comments) return badRequestResponse(res, 'Rejection comments are required');
  const result = await svc.rejectNegotiationTicket(req.params.ticketId, { comments });
  if (result?.notFound) return notFoundResponse(res, 'Negotiation ticket not found');
  if (result?.invalidStatus) return conflictResponse(res, `Ticket cannot be rejected from current status ${result.currentStatus}`);
  return successResponse(res, 'Negotiation ticket rejected and product holds released', result);
}

async function counterNegotiationTicket(req, res) {
  const { counterDiscountPct, comments } = req.body;
  if (counterDiscountPct === undefined || isNaN(Number(counterDiscountPct))) {
    return badRequestResponse(res, 'counterDiscountPct is required');
  }
  const result = await svc.counterNegotiationTicket(req.params.ticketId, { counterDiscountPct, comments });
  if (result?.notFound) return notFoundResponse(res, 'Negotiation ticket not found');
  if (result?.invalidStatus) return conflictResponse(res, `Ticket cannot be countered from status ${result.currentStatus}`);
  return successResponse(res, 'Counter-offer discount sent to customer', result);
}

async function getTicketHoldStatus(req, res) {
  const data = await svc.getTicketHoldStatus(req.params.ticketId);
  return successResponse(res, 'Product hold status retrieved', data);
}

async function listNegotiations(req, res) {
  const data = await svc.listNegotiations(req.params.id);
  return successResponse(res, 'Negotiation messages retrieved', data);
}

async function createNegotiationMessage(req, res) {
  const { message, proposedDiscount, senderRole } = req.body;
  if (!message) return badRequestResponse(res, 'Message text is required');
  const data = await svc.createNegotiationMessage(req.params.id, {
    senderId: req.user?.id,
    senderRole: senderRole || (req.user?.role === 'CUSTOMER' ? 'CUSTOMER' : 'REP'),
    message,
    proposedDiscount
  });
  return createdResponse(res, 'Negotiation message sent', data);
}

module.exports = {
  listNegotiationTickets, listQuoteNegotiationTickets, getNegotiationTicketById,
  createNegotiationTicket, acceptNegotiationTicket, rejectNegotiationTicket, counterNegotiationTicket,
  getTicketHoldStatus, listNegotiations, createNegotiationMessage
};
