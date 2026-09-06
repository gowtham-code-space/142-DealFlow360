const svc = require('./portal.service');
const {
  successResponse, createdResponse, badRequestResponse,
  notFoundResponse, conflictResponse, forbiddenResponse
} = require('../../utils/response');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function getCustomerId(req) {
  if (req.user?.customerId) return req.user.customerId;
  const userId = req.user?.userId || req.user?.id;
  if (userId) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { customerId: true }
    });
    if (user?.customerId) return user.customerId;
  }
  return 'CUST-002';
}

async function portalListQuotes(req, res) {
  const customerId = await getCustomerId(req);
  if (!customerId) return forbiddenResponse(res, 'User is not associated with a customer account');
  const { page, pageSize } = req.query;
  const data = await svc.listQuotes(customerId, { page, pageSize });
  return successResponse(res, 'Customer quotes retrieved', data);
}

async function portalGetQuote(req, res) {
  const customerId = await getCustomerId(req);
  if (!customerId) return forbiddenResponse(res, 'User is not associated with a customer account');
  const data = await svc.getQuoteById(req.params.quoteId, customerId);
  if (data?.notFound) return notFoundResponse(res, 'Quote not found');
  if (data?.forbidden) return forbiddenResponse(res, 'Customer portal access denied — this quote is not assigned to your account');
  return successResponse(res, 'Quote details retrieved', data);
}

async function portalGetQuoteLines(req, res) {
  const customerId = await getCustomerId(req);
  if (!customerId) return forbiddenResponse(res, 'User is not associated with a customer account');
  const data = await svc.getQuoteLines(req.params.quoteId, customerId);
  if (data?.notFound) return notFoundResponse(res, 'Quote not found');
  if (data?.forbidden) return forbiddenResponse(res, 'Access denied');
  return successResponse(res, 'Quote lines retrieved', data);
}

async function portalGetQuoteStatus(req, res) {
  const customerId = await getCustomerId(req);
  if (!customerId) return forbiddenResponse(res, 'User is not associated with a customer account');
  const data = await svc.getQuoteStatus(req.params.quoteId, customerId);
  if (data?.notFound) return notFoundResponse(res, 'Quote not found');
  if (data?.forbidden) return forbiddenResponse(res, 'Access denied');
  return successResponse(res, 'Quote status retrieved', data);
}

async function portalNegotiate(req, res) {
  const customerId = await getCustomerId(req);
  if (!customerId) return forbiddenResponse(res, 'User is not associated with a customer account');
  const { requestedDiscountPct, comments, lineRequests } = req.body;
  if (requestedDiscountPct === undefined || !comments) {
    return badRequestResponse(res, 'requestedDiscountPct and comments are required');
  }
  const result = await svc.negotiateQuote(req.params.quoteId, customerId, { requestedDiscountPct, comments, lineRequests });
  if (result?.notFound) return notFoundResponse(res, 'Quote not found');
  if (result?.forbidden) return forbiddenResponse(res, 'Access denied');
  if (result?.notNegotiable) return conflictResponse(res, 'Quote is not in a negotiable status');
  if (result?.conflict) return conflictResponse(res, result.message);
  return createdResponse(res, 'Negotiation ticket created and product held', result);
}

async function portalAddLineComment(req, res) {
  const customerId = await getCustomerId(req);
  if (!customerId) return forbiddenResponse(res, 'User is not associated with a customer account');
  const { content } = req.body;
  if (!content) return badRequestResponse(res, 'content is required');
  const result = await svc.addLineComment(req.params.quoteId, req.params.lineId, customerId, req.user?.userId || req.user?.id, content);
  if (result?.notFound) return notFoundResponse(res, 'Quote not found');
  if (result?.forbidden) return forbiddenResponse(res, 'Access denied');
  return createdResponse(res, 'Line comment added', result);
}

async function portalConfirmQuote(req, res) {
  const customerId = await getCustomerId(req);
  if (!customerId) return forbiddenResponse(res, 'User is not associated with a customer account');
  const result = await svc.confirmQuote(req.params.quoteId, customerId);
  if (result?.notFound) return notFoundResponse(res, 'Quote not found');
  if (result?.forbidden) return forbiddenResponse(res, 'Access denied');
  if (result?.cannotConfirm) return conflictResponse(res, result.message);
  return successResponse(res, 'Quote confirmed. Order initiated.', result);
}

async function portalGetDepositInfo(req, res) {
  const customerId = await getCustomerId(req);
  if (!customerId) return forbiddenResponse(res, 'User is not associated with a customer account');
  const data = await svc.getDepositInfo(req.params.quoteId, customerId);
  if (data?.notFound) return notFoundResponse(res, 'Quote not found');
  if (data?.forbidden) return forbiddenResponse(res, 'Access denied');
  return successResponse(res, 'Deposit info retrieved', data);
}

async function portalPayDeposit(req, res) {
  const customerId = await getCustomerId(req);
  if (!customerId) return forbiddenResponse(res, 'User is not associated with a customer account');
  const { paymentMethod, paymentReference } = req.body;
  if (!paymentMethod) return badRequestResponse(res, 'paymentMethod is required');
  const result = await svc.payDeposit(req.params.quoteId, customerId, { paymentMethod, paymentReference });
  if (result?.notFound) return notFoundResponse(res, 'Quote not found');
  if (result?.forbidden) return forbiddenResponse(res, 'Access denied');
  if (result?.alreadyPaid) return conflictResponse(res, 'Deposit already paid');
  return successResponse(res, 'Deposit payment processed', result);
}

async function portalListTickets(req, res) {
  const customerId = await getCustomerId(req);
  if (!customerId) return forbiddenResponse(res, 'User is not associated with a customer account');
  const { page, pageSize } = req.query;
  const data = await svc.listTickets(customerId, { page, pageSize });
  return successResponse(res, 'Customer negotiation tickets retrieved', data);
}

async function portalGetTicket(req, res) {
  const customerId = await getCustomerId(req);
  if (!customerId) return forbiddenResponse(res, 'User is not associated with a customer account');
  const data = await svc.getTicketById(req.params.ticketId, customerId);
  if (data?.notFound) return notFoundResponse(res, 'Negotiation ticket not found');
  if (data?.forbidden) return forbiddenResponse(res, 'Access denied');
  return successResponse(res, 'Negotiation ticket retrieved', data);
}

async function portalListResources(req, res) {
  const customerId = await getCustomerId(req);
  if (!customerId) return forbiddenResponse(res, 'User is not associated with a customer account');
  const data = await svc.listResources(customerId);
  return successResponse(res, 'Catalog resources retrieved with availability', data);
}

async function portalCreateHold(req, res) {
  const customerId = await getCustomerId(req);
  if (!customerId) return forbiddenResponse(res, 'User is not associated with a customer account');
  const { productId } = req.params;
  const { quantityHeld, poolType } = req.body;
  const result = await svc.createProductHold(customerId, { productId, quantityHeld, poolType });
  if (result?.notFound) return notFoundResponse(res, 'Resource not found');
  if (result?.conflict) return conflictResponse(res, result.message);
  return createdResponse(res, result.message, result);
}

async function portalCreateHolds(req, res) {
  const customerId = await getCustomerId(req);
  if (!customerId) return forbiddenResponse(res, 'User is not associated with a customer account');
  const { items } = req.body;
  const result = await svc.createProductHolds(customerId, { items });
  if (result?.conflict) return conflictResponse(res, result.message);
  return createdResponse(res, result.message, result);
}

async function portalGetHold(req, res) {
  const customerId = await getCustomerId(req);
  if (!customerId) return forbiddenResponse(res, 'User is not associated with a customer account');
  const data = await svc.getHoldStatus(req.params.holdId, customerId);
  if (data?.notFound) return notFoundResponse(res, 'Resource hold not found');
  return successResponse(res, 'Hold status retrieved', data);
}

async function portalGenerateQuote(req, res) {
  const customerId = await getCustomerId(req);
  if (!customerId) return forbiddenResponse(res, 'User is not associated with a customer account');
  const { ticketId, holdId, productId, quantity, currency } = req.body;
  const result = await svc.generateQuoteFromHold(customerId, { ticketId, holdId, productId, quantity, currency });
  if (result?.notFound) return notFoundResponse(res, result.message || 'Resource not found');
  if (result?.expired) return conflictResponse(res, result.message);
  return createdResponse(res, 'Quotation generated successfully', result);
}

module.exports = {
  portalListQuotes, portalGetQuote, portalGetQuoteLines, portalGetQuoteStatus,
  portalNegotiate, portalAddLineComment, portalConfirmQuote,
  portalGetDepositInfo, portalPayDeposit,
  portalListTickets, portalGetTicket,
  portalListResources, portalCreateHold, portalCreateHolds, portalGetHold, portalGenerateQuote
};
