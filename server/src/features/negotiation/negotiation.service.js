const { v4: uuidv4 } = require('uuid');
const negModel = require('./negotiation.model');
const {
  NegotiationTicketStatus,
  HoldStatus,
  SenderRole,
  ProductType,
  Defaults
} = require('../../constants');

// ─── Negotiation Tickets ─────────────────────────────────────────────────────

async function listNegotiationTickets({ page = Defaults.PAGE, pageSize = Defaults.PAGE_SIZE, status, quoteId }) {
  const skip = (page - 1) * pageSize;
  const where = {};
  if (status) where.status = status.toUpperCase();
  if (quoteId) where.quoteId = quoteId;

  const [items, total] = await Promise.all([
    negModel.findNegotiationTickets({ where, skip, take: Number(pageSize) }),
    negModel.countNegotiationTickets(where)
  ]);
  return { items, total, page: Number(page), pageSize: Number(pageSize), totalPages: Math.ceil(total / pageSize) };
}

async function listQuoteNegotiationTickets(quoteId) {
  return negModel.findTicketsByQuoteId(quoteId);
}

async function getNegotiationTicketById(id) {
  return negModel.findTicketById(id);
}

async function createNegotiationTicket({ quoteId, customerId, requestedDiscountPct, comments }) {
  const quote = await negModel.findQuotationForTicket(quoteId);
  if (!quote) return { notFound: true };

  const poolConfig = await negModel.findPoolConfig() || { holdDurationHours: Defaults.HOLD_DURATION_HOURS };
  const holdExpiresAt = new Date();
  holdExpiresAt.setHours(holdExpiresAt.getHours() + (poolConfig.holdDurationHours || Defaults.HOLD_DURATION_HOURS));

  const ticket = await negModel.createNegotiationTicket({
    id: uuidv4(),
    quoteId,
    customerId: customerId || quote.customerId,
    requestedDiscountPct: Number(requestedDiscountPct),
    comments,
    status: NegotiationTicketStatus.OPEN
  });

  // Create product holds for hardware items
  for (const item of quote.items.filter(i => i.product.productType === ProductType.HARDWARE)) {
    await negModel.createProductHold({
      id: uuidv4(),
      ticketId: ticket.id,
      quotationId: quoteId,
      productId: item.productId,
      poolType: item.poolAssignment,
      quantityHeld: item.quantity,
      status: HoldStatus.ACTIVE,
      expiresAt: holdExpiresAt
    });
  }

  return negModel.findTicketById(ticket.id);
}

async function acceptNegotiationTicket(id, { purchaseDeadlineDays = 7, comments } = {}) {
  const ticket = await negModel.findRawTicketById(id);
  if (!ticket) return { notFound: true };
  if (ticket.status !== NegotiationTicketStatus.OPEN && ticket.status !== NegotiationTicketStatus.COUNTERED) {
    return { invalidStatus: true, currentStatus: ticket.status };
  }

  const purchaseDeadline = new Date();
  purchaseDeadline.setDate(purchaseDeadline.getDate() + Number(purchaseDeadlineDays));

  const updated = await negModel.updateNegotiationTicket(id, {
    status: NegotiationTicketStatus.ACCEPTED,
    purchaseDeadline,
    comments: comments ? `${ticket.comments || ''}\nAcceptance notes: ${comments}`.trim() : ticket.comments
  });

  // Update Quotation status
  await negModel.updateQuotationStatus(ticket.quoteId, 'CUSTOMER_ACCEPTED');

  return updated;
}

async function escalateNegotiationTicket(id, { comments } = {}) {
  const ticket = await negModel.findRawTicketById(id);
  if (!ticket) return { notFound: true };
  if (ticket.status !== NegotiationTicketStatus.OPEN && ticket.status !== NegotiationTicketStatus.COUNTERED) {
    return { invalidStatus: true, currentStatus: ticket.status };
  }

  const updated = await negModel.updateNegotiationTicket(id, {
    status: NegotiationTicketStatus.ESCALATED,
    comments: comments ? `${ticket.comments || ''}\nEscalation notes: ${comments}`.trim() : ticket.comments
  });

  // Create an Approval record for the Manager
  const uuidv4 = require('uuid').v4;
  await negModel.createApproval({
    id: uuidv4(),
    quotationId: ticket.quoteId,
    quoteRevision: 1,
    stage: 'SALES_MANAGER',
    level: 2,
    status: 'PENDING',
    comments: `Escalated from Negotiation Ticket ${ticket.id}. ${comments || ''}`
  });

  // Update Quotation status to MANAGER_REVIEW
  await negModel.updateQuotationStatus(ticket.quoteId, 'MANAGER_REVIEW');

  return updated;
}

async function rejectNegotiationTicket(id, { comments } = {}) {
  const ticket = await negModel.findRawTicketById(id);
  if (!ticket) return { notFound: true };
  if (ticket.status !== NegotiationTicketStatus.OPEN && ticket.status !== NegotiationTicketStatus.COUNTERED) {
    return { invalidStatus: true, currentStatus: ticket.status };
  }

  // Release product holds
  await negModel.releaseProductHolds(id);

  const updated = await negModel.updateNegotiationTicket(id, {
    status: NegotiationTicketStatus.REJECTED,
    comments: comments ? `${ticket.comments || ''}\nRejection notes: ${comments}`.trim() : ticket.comments
  });

  return updated;
}

async function counterNegotiationTicket(id, { counterDiscountPct, comments }) {
  const ticket = await negModel.findRawTicketById(id);
  if (!ticket) return { notFound: true };
  if (ticket.status !== NegotiationTicketStatus.OPEN) {
    return { invalidStatus: true, currentStatus: ticket.status };
  }

  const updated = await negModel.updateNegotiationTicket(id, {
    status: NegotiationTicketStatus.COUNTERED,
    counterDiscountPct: Number(counterDiscountPct),
    comments: comments ? `${ticket.comments || ''}\nCounter notes: ${comments}`.trim() : ticket.comments
  });

  return updated;
}

async function getTicketHoldStatus(ticketId) {
  return negModel.findProductHoldsByTicketId(ticketId);
}

// ─── Negotiation Messages ────────────────────────────────────────────────────

async function listNegotiations(quotationId) {
  console.log(`[Negotiation] quotation id=${quotationId}`);
  return negModel.findNegotiations(quotationId);
}

async function createNegotiationMessage(quotationId, { senderId, senderRole, message, proposedDiscount }) {
  console.log(`[Negotiation] quotation id=${quotationId}`);
  return negModel.createNegotiation({
    id: uuidv4(),
    quotationId,
    senderId,
    senderRole: senderRole || SenderRole.SALES_REP,
    message,
    proposedDiscount: proposedDiscount !== undefined ? Number(proposedDiscount) : null
  });
}

module.exports = {
  listNegotiationTickets, listQuoteNegotiationTickets, getNegotiationTicketById,
  createNegotiationTicket, acceptNegotiationTicket, rejectNegotiationTicket, counterNegotiationTicket,
  escalateNegotiationTicket, getTicketHoldStatus, listNegotiations, createNegotiationMessage
};
