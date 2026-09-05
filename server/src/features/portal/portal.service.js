const portalModel = require('./portal.model');
const negotiationSvc = require('../negotiation/negotiation.service');
const {
  QuoteStatus,
  PoolType,
  DepositStatus,
  NegotiationTicketStatus,
  Defaults
} = require('../../constants');

// ─── Helpers ─────────────────────────────────────────────────────────────────

function sanitizeCustomerQuote(q) {
  if (!q) return null;
  return {
    id: q.id,
    quotationNumber: q.quotationNumber,
    quoteRevision: q.quoteRevision,
    status: q.status,
    currency: q.currency,
    subtotal: q.subtotal,
    discountTotal: q.discountTotal,
    taxTotal: q.taxTotal,
    estimatedNetTotal: q.estimatedNetTotal,
    confirmedNetTotal: q.confirmedNetTotal,
    hasHardwareLines: q.hasHardwareLines,
    hasSoftwareLines: q.hasSoftwareLines,
    notes: q.notes,
    validUntil: q.validUntil,
    createdAt: q.createdAt,
    updatedAt: q.updatedAt,
    items: q.items ? q.items.map(sanitizeCustomerLine) : undefined,
    customer: q.customer ? { id: q.customer.id, name: q.customer.name, companyName: q.customer.companyName } : undefined
  };
}

function sanitizeCustomerLine(item) {
  if (!item) return null;
  return {
    id: item.id,
    productId: item.productId,
    productName: item.product?.name,
    productType: item.product?.productType,
    variantId: item.variantId,
    quantity: item.quantity,
    unitPrice: item.unitPrice,
    unitListPrice: item.unitListPrice,
    discountPct: item.cumulativeDiscountPct,
    lineTotal: item.lineTotal,
    netTotal: item.netTotal,
    isRecurring: item.isRecurring
  };
}

// ─── Quotes ──────────────────────────────────────────────────────────────────

async function listQuotes(customerId, { page = Defaults.PAGE, pageSize = Defaults.PAGE_SIZE } = {}) {
  const skip = (page - 1) * pageSize;
  const where = { customerId };

  const { items, total } = await portalModel.findCustomerQuotes({ where, skip, take: Number(pageSize) });
  return {
    items: items.map(sanitizeCustomerQuote),
    total, page: Number(page), pageSize: Number(pageSize), totalPages: Math.ceil(total / pageSize)
  };
}

async function getQuoteById(quoteId, customerId) {
  const quote = await portalModel.findQuoteByIdWithDetails(quoteId);
  if (!quote) return { notFound: true };
  if (quote.customerId !== customerId) return { forbidden: true };
  return sanitizeCustomerQuote(quote);
}

async function getQuoteLines(quoteId, customerId) {
  const quote = await portalModel.findQuoteById(quoteId);
  if (!quote) return { notFound: true };
  if (quote.customerId !== customerId) return { forbidden: true };

  const items = await portalModel.findQuoteLines(quoteId);
  return items.map(sanitizeCustomerLine);
}

async function getQuoteStatus(quoteId, customerId) {
  const quote = await portalModel.findQuoteById(quoteId);
  if (!quote) return { notFound: true };
  if (quote.customerId !== customerId) return { forbidden: true };

  return {
    id: quote.id,
    quotationNumber: quote.quotationNumber,
    status: quote.status,
    estimatedNetTotal: quote.estimatedNetTotal,
    confirmedNetTotal: quote.confirmedNetTotal
  };
}

async function negotiateQuote(quoteId, customerId, { requestedDiscountPct, comments, lineRequests }) {
  const quote = await portalModel.findQuoteById(quoteId);
  if (!quote) return { notFound: true };
  if (quote.customerId !== customerId) return { forbidden: true };

  if (quote.status !== QuoteStatus.SENT_TO_CUSTOMER && quote.status !== QuoteStatus.APPROVED) {
    return { notNegotiable: true };
  }

  const existingTicket = await portalModel.findOpenNegotiationTicket(quoteId);
  if (existingTicket) {
    return { conflict: true, message: 'An open negotiation ticket already exists for this quotation' };
  }

  const ticket = await negotiationSvc.createNegotiationTicket({
    quoteId,
    customerId,
    requestedDiscountPct,
    comments
  });

  return {
    ticketId: ticket.id,
    holdExpiresAt: ticket.productHolds?.[0]?.expiresAt || null,
    message: 'Your negotiation request has been submitted. Product is held for 48 hours.'
  };
}

async function addLineComment(quoteId, lineId, customerId, userId, content) {
  const quote = await portalModel.findQuoteById(quoteId);
  if (!quote) return { notFound: true };
  if (quote.customerId !== customerId) return { forbidden: true };

  return portalModel.createLineComment({ lineId, authorId: userId, content });
}

async function confirmQuote(quoteId, customerId) {
  const quote = await portalModel.findQuoteWithAcceptedTickets(quoteId);
  if (!quote) return { notFound: true };
  if (quote.customerId !== customerId) return { forbidden: true };

  const acceptedTicket = quote.negotiationTickets[0];
  const isDeadlineValid = acceptedTicket && acceptedTicket.purchaseDeadline && new Date() <= new Date(acceptedTicket.purchaseDeadline);

  if (quote.status !== QuoteStatus.SENT_TO_CUSTOMER && !isDeadlineValid) {
    return { cannotConfirm: true, message: 'Cannot confirm quote — it must first be sent to customer or accepted in negotiation within deadline' };
  }

  const updated = await portalModel.updateQuoteToConfirmed(quoteId, quote.estimatedNetTotal);
  return sanitizeCustomerQuote(updated);
}

async function getDepositInfo(quoteId, customerId) {
  const quote = await portalModel.findQuoteWithDepositsAndItems(quoteId);
  if (!quote) return { notFound: true };
  if (quote.customerId !== customerId) return { forbidden: true };

  const poolConfig = await portalModel.findPoolConfig() || { depositPct: Defaults.DEPOSIT_PCT };
  const depositPct = Number(poolConfig.depositPct || Defaults.DEPOSIT_PCT);
  const depositAmountEstimate = (Number(quote.estimatedNetTotal) * (depositPct / 100)).toFixed(2);
  const paidRecord = quote.depositRecords.find(d => d.status === DepositStatus.PAID);

  return {
    depositRequired: quote.items.some(i => i.poolAssignment === PoolType.PREMIUM_BULK),
    depositAmountEstimate,
    depositPct,
    status: paidRecord ? 'paid' : quote.depositRecords.length > 0 ? 'pending' : 'not_paid',
    refundable: true
  };
}

async function payDeposit(quoteId, customerId, { paymentMethod, paymentReference }) {
  const quote = await portalModel.findQuoteWithDeposits(quoteId);
  if (!quote) return { notFound: true };
  if (quote.customerId !== customerId) return { forbidden: true };

  const poolConfig = await portalModel.findPoolConfig() || { depositPct: Defaults.DEPOSIT_PCT };
  const depositPct = Number(poolConfig.depositPct || Defaults.DEPOSIT_PCT);
  const depositAmount = Number((Number(quote.estimatedNetTotal) * (depositPct / 100)).toFixed(2));

  let deposit = quote.depositRecords[0];
  if (deposit) {
    if (deposit.status === DepositStatus.PAID) return { alreadyPaid: true };
    deposit = await portalModel.updateDepositRecord(deposit.id, {
      status: DepositStatus.PAID,
      method: paymentMethod,
      paidAt: new Date(),
      amount: depositAmount
    });
  } else {
    deposit = await portalModel.createDepositRecord({
      quotationId: quoteId,
      customerId,
      amount: depositAmount,
      depositPct,
      status: DepositStatus.PAID,
      method: paymentMethod,
      paidAt: new Date()
    });
  }

  return {
    depositAmount: deposit.amount,
    status: DepositStatus.PAID,
    message: `Deposit of ₹${deposit.amount} received. Your order has priority processing.`
  };
}

async function listTickets(customerId, { page = Defaults.PAGE, pageSize = Defaults.PAGE_SIZE } = {}) {
  const skip = (page - 1) * pageSize;
  const where = { customerId };

  const { items, total } = await portalModel.findCustomerTickets({ where, skip, take: Number(pageSize) });
  return { items, total, page: Number(page), pageSize: Number(pageSize), totalPages: Math.ceil(total / pageSize) };
}

async function getTicketById(ticketId, customerId) {
  const ticket = await portalModel.findCustomerTicketById(ticketId);
  if (!ticket) return { notFound: true };
  if (ticket.customerId !== customerId) return { forbidden: true };
  return ticket;
}

module.exports = {
  listQuotes, getQuoteById, getQuoteLines, getQuoteStatus,
  negotiateQuote, addLineComment, confirmQuote, getDepositInfo, payDeposit,
  listTickets, getTicketById
};
