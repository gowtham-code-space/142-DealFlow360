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

const BOOKING_HOLD_MINUTES = 15;

async function listResources(customerId) {
  const products = await portalModel.findActiveProducts();
  const result = [];

  for (const product of products) {
    const avail = await portalModel.findProductWithAvailability(product.id);
    const availStock = product.productType === 'HARDWARE' ? avail.availableStock : 999;
    const availStatus = availStock === 0 ? 'UNAVAILABLE' : availStock <= 5 ? 'LOW_AVAILABILITY' : 'AVAILABLE';

    result.push({
      id: product.id,
      sku: product.sku,
      name: product.name,
      description: product.description,
      category: product.category,
      productType: product.productType,
      listPrice: Number(product.listPrice),
      taxPct: Number(product.tax),
      productDiscountPct: Number(product.productDiscountPct),
      minMargin: Number(product.minMargin),
      isRecurring: product.isRecurring,
      availableStock: availStock,
      availabilityStatus: availStatus,
      variants: product.variants.map(v => ({ id: v.id, attribute: v.attribute, value: v.value, extraPrice: Number(v.extraPrice) }))
    });
  }

  return result;
}

async function createProductHolds(customerId, { items }) {
  if (!items || !items.length) return { conflict: true, message: 'No items provided' };

  const expiresAt = new Date();
  expiresAt.setMinutes(expiresAt.getMinutes() + BOOKING_HOLD_MINUTES);
  
  const { v4: uuidv4 } = require('uuid');
  const ticketId = uuidv4();

  try {
    const holds = await portalModel.createMultiProductHoldTransaction({
      ticketId,
      items: items.map(i => ({ 
        ...i, 
        quantityHeld: Number(i.quantityHeld !== undefined ? i.quantityHeld : (i.quantity !== undefined ? i.quantity : 1)) 
      })),
      expiresAt
    });

    return {
      ticketId,
      items: holds.map(h => ({
        holdId: h.id,
        productId: h.productId,
        productName: h.product?.name,
        quantityHeld: h.quantityHeld,
        status: h.status
      })),
      status: 'ACTIVE',
      expiresAt,
      holdDurationMinutes: BOOKING_HOLD_MINUTES,
      message: `Successfully reserved ${holds.length} resources for ${BOOKING_HOLD_MINUTES} minutes.`
    };
  } catch (err) {
    return { conflict: true, message: err.message };
  }
}

async function createProductHold(customerId, { productId, quantityHeld = 1, poolType = 'NORMAL' }) {
  const avail = await portalModel.findProductWithAvailability(productId);
  if (!avail.product) return { notFound: true };

  const expiresAt = new Date();
  expiresAt.setMinutes(expiresAt.getMinutes() + BOOKING_HOLD_MINUTES);

  try {
    const hold = await portalModel.createProductHoldTransaction({
      productId,
      poolType,
      quantityHeld: Number(quantityHeld),
      expiresAt
    });

    return {
      holdId: hold.id,
      productId: hold.productId,
      productName: hold.product?.name,
      quantityHeld: hold.quantityHeld,
      status: hold.status,
      expiresAt: hold.expiresAt,
      holdDurationMinutes: BOOKING_HOLD_MINUTES,
      message: `Resource locked successfully for ${BOOKING_HOLD_MINUTES} minutes.`
    };
  } catch (err) {
    return { conflict: true, message: err.message };
  }
}

async function getHoldStatus(ticketId, customerId) {
  // Can be called with a holdId OR ticketId in the new flow
  let holds = await portalModel.findHoldsByTicketId(ticketId);
  if (!holds || holds.length === 0) {
    const singleHold = await portalModel.findHoldById(ticketId);
    if (!singleHold) return { notFound: true, message: 'Resource hold not found' };
    holds = [singleHold];
  }

  const hold = holds[0];
  const now = new Date();
  const isExpired = now >= new Date(hold.expiresAt);
  const remainingSeconds = isExpired ? 0 : Math.max(0, Math.floor((new Date(hold.expiresAt) - now) / 1000));

  if (isExpired && hold.status === 'ACTIVE') {
    if (holds.length > 1 || holds[0].ticketId) {
       await portalModel.updateHoldsStatusByTicketId(hold.ticketId, 'EXPIRED');
    } else {
       await portalModel.updateHoldStatus(hold.id, 'EXPIRED');
    }
    holds.forEach(h => h.status = 'EXPIRED');
  }

  return {
    ticketId: hold.ticketId || ticketId,
    status: hold.status,
    expiresAt: hold.expiresAt,
    remainingSeconds,
    isExpired,
    items: holds.map(h => ({
      productId: h.productId,
      productName: h.product?.name,
      quantityHeld: h.quantityHeld,
      status: h.status
    }))
  };
}

async function generateQuoteFromHold(customerId, { ticketId, holdId, productId, quantity = 1, currency = 'INR' }) {
  let targetItems = [];

  if (ticketId) {
    const holds = await portalModel.findHoldsByTicketId(ticketId);
    if (!holds || holds.length === 0) return { notFound: true, message: 'Resource hold not found' };
    
    const activeHold = holds[0];
    if (new Date() >= new Date(activeHold.expiresAt) || activeHold.status !== 'ACTIVE') {
      return { expired: true, message: 'Resource hold has expired or is no longer active' };
    }
    
    targetItems = holds.map(h => ({ productId: h.productId, quantity: h.quantityHeld }));
  } else if (holdId) {
    const hold = await portalModel.findHoldById(holdId);
    if (!hold) return { notFound: true, message: 'Resource hold not found' };
    if (new Date() >= new Date(hold.expiresAt) || hold.status !== 'ACTIVE') {
      return { expired: true, message: 'Resource hold has expired or is no longer active' };
    }
    targetItems = [{ productId: hold.productId, quantity: hold.quantityHeld }];
  } else {
    targetItems = [{ productId, quantity: Number(quantity) }];
  }

  let totalLine = 0;
  let totalNet = 0;
  let hasHardware = false;
  let hasSoftware = false;
  const quoteItemsData = [];

  for (const item of targetItems) {
    const avail = await portalModel.findProductWithAvailability(item.productId);
    if (!avail.product) return { notFound: true, message: `Product ${item.productId} not found` };
  
    const product = avail.product;
    const listPrice = Number(product.listPrice);
    const productDiscountPct = Number(product.productDiscountPct || 0);
    const unitPrice = listPrice * (1 - productDiscountPct / 100);
    const lineTotal = listPrice * item.quantity;
    const netTotal = unitPrice * item.quantity;
  
    totalLine += lineTotal;
    totalNet += netTotal;
    
    if (product.productType === 'HARDWARE') hasHardware = true;
    if (product.productType === 'SOFTWARE' || product.productType === 'SERVICE') hasSoftware = true;

    quoteItemsData.push({
      productId: item.productId,
      quantity: item.quantity,
      unitPrice,
      unitListPrice: listPrice,
      unitCostPrice: Number(product.cost || 0),
      productDiscountPct,
      lineTotal,
      netTotal,
      marginPct: 40.0,
      isRecurring: product.isRecurring
    });
  }
  
  const discountTotal = totalLine - totalNet;

  const year = new Date().getFullYear();
  const { v4: uuidv4 } = require('uuid');
  const quotationNumber = `QT-${year}-${Math.floor(10000 + Math.random() * 90000)}`;
  const repId = 'bf8feed3-e2e0-4403-a199-323236699a1a';

  const quoteData = {
    quotationNumber,
    customerId,
    repId,
    status: QuoteStatus.APPROVED,
    currency,
    subtotal: totalLine,
    discountTotal,
    estimatedNetTotal: totalNet,
    marginPct: 40.0,
    blendedRiskScore: 15.0,
    hasHardwareLines: hasHardware,
    hasSoftwareLines: hasSoftware
  };

  const quote = await portalModel.createQuotationWithItems(quoteData, quoteItemsData);

  if (ticketId) {
    await portalModel.updateHoldsStatusByTicketId(ticketId, 'CONSUMED');
  } else if (holdId) {
    await portalModel.updateHoldStatus(holdId, 'CONSUMED');
  }

  return sanitizeCustomerQuote(quote);
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
  listTickets, getTicketById,
  listResources, createProductHold, createProductHolds, getHoldStatus, generateQuoteFromHold
};
