const svc = require('./quotations.service');
const lineSvc = require('./quotelines.service');
const {
  successResponse, createdResponse, badRequestResponse,
  notFoundResponse, conflictResponse, forbiddenResponse
} = require('../../utils/response');

// ─── Quotes ───────────────────────────────────────────────────────────────────

async function listQuotes(req, res) {
  return successResponse(res, 'Quotes fetched', await svc.listQuotes(req.query));
}

async function createQuote(req, res) {
  const { customerId } = req.body;
  if (!customerId) return badRequestResponse(res, 'customerId is required');

  const repId = req.user.userId;
  const result = await svc.createQuote({ ...req.body, repId });
  if (result.customerNotFound) return notFoundResponse(res, 'Customer not found');
  return createdResponse(res, 'Quote created', result.quote);
}

async function getQuoteById(req, res) {
  const quote = await svc.getQuoteById(req.params.quoteId);
  if (!quote) return notFoundResponse(res, 'Quote not found');
  return successResponse(res, 'Quote fetched', quote);
}

async function updateQuote(req, res) {
  const result = await svc.updateQuoteDraft(req.params.quoteId, req.body);
  if (result.notFound) return notFoundResponse(res, 'Quote not found');
  if (result.notDraft) return conflictResponse(res, 'Only DRAFT or RETURNED quotes can be edited');
  return successResponse(res, 'Quote updated', result.quote);
}

async function submitQuote(req, res) {
  const result = await svc.submitQuote(req.params.quoteId);
  if (result.notFound) return notFoundResponse(res, 'Quote not found');
  if (result.invalidStatus) return conflictResponse(res, 'Quote cannot be submitted in its current state');
  if (result.noItems) return badRequestResponse(res, 'Quote has no line items');
  return successResponse(res, 'Quote submitted and evaluated', result.quote);
}

async function sendToCustomer(req, res) {
  const result = await svc.sendToCustomer(req.params.quoteId);
  if (result.notFound) return notFoundResponse(res, 'Quote not found');
  if (result.notApproved) return conflictResponse(res, 'Only APPROVED quotes can be sent to customer');
  return successResponse(res, 'Quote sent to customer', result.quote);
}

async function recalculate(req, res) {
  const result = await svc.recalculate(req.params.quoteId);
  if (result.notFound) return notFoundResponse(res, 'Quote not found');
  if (result.invalidStatus) return conflictResponse(res, 'Only DRAFT or RETURNED quotes can be recalculated');
  return successResponse(res, 'Quote recalculated', result.quote);
}

async function getQuoteRisk(req, res) {
  const risk = await svc.getQuoteRisk(req.params.quoteId);
  if (!risk) return notFoundResponse(res, 'Quote not found');
  return successResponse(res, 'Risk evaluation fetched', risk);
}

async function getDeposit(req, res) {
  const deposits = await svc.getDeposit(req.params.quoteId);
  return successResponse(res, 'Deposits fetched', deposits);
}

async function createDeposit(req, res) {
  const { amount } = req.body;
  if (!amount) return badRequestResponse(res, 'amount is required');
  const result = await svc.createDeposit(req.params.quoteId, req.body);
  if (result.notFound) return notFoundResponse(res, 'Quote not found');
  return createdResponse(res, 'Deposit record created', result.deposit);
}

async function refundDeposit(req, res) {
  const result = await svc.refundDeposit(req.params.quoteId);
  if (result.notFound) return notFoundResponse(res, 'No paid deposit found for this quote');
  return successResponse(res, 'Deposit refunded', result.deposit);
}

// ─── Lines ────────────────────────────────────────────────────────────────────

async function listLines(req, res) {
  const data = await lineSvc.listLines(req.params.quoteId);
  return successResponse(res, 'Lines fetched', data);
}

async function addLine(req, res) {
  const { productId } = req.body;
  if (!productId) return badRequestResponse(res, 'productId is required');

  const result = await lineSvc.addLine(req.params.quoteId, req.body);
  if (result.notFound) return notFoundResponse(res, 'Quote not found');
  if (result.locked) return conflictResponse(res, 'Quote is not in a state that allows line edits');
  if (result.productNotFound) return notFoundResponse(res, 'Product not found');
  return createdResponse(res, 'Line added', result.line);
}

async function updateLine(req, res) {
  const result = await lineSvc.updateLine(req.params.quoteId, req.params.lineId, req.body);
  if (result.notFound) return notFoundResponse(res, 'Quote not found');
  if (result.lineNotFound) return notFoundResponse(res, 'Line not found');
  return successResponse(res, 'Line updated', result.line);
}

async function deleteLine(req, res) {
  const result = await lineSvc.deleteLine(req.params.quoteId, req.params.lineId);
  if (result.notFound) return notFoundResponse(res, 'Quote not found');
  if (result.locked) return conflictResponse(res, 'Cannot delete lines from a non-draft quote');
  return successResponse(res, 'Line deleted');
}

async function getDiscountBreakdown(req, res) {
  const breakdown = await lineSvc.getDiscountBreakdown(req.params.lineId);
  if (!breakdown) return notFoundResponse(res, 'Line not found');
  return successResponse(res, 'Discount breakdown fetched', breakdown);
}

async function listLineComments(req, res) {
  const data = await lineSvc.listLineComments(req.params.lineId);
  return successResponse(res, 'Comments fetched', data);
}

async function addLineComment(req, res) {
  const { content } = req.body;
  if (!content) return badRequestResponse(res, 'content is required');
  const comment = await lineSvc.addLineComment(req.params.lineId, req.user.userId, content);
  return createdResponse(res, 'Comment added', comment);
}

module.exports = {
  listQuotes, createQuote, getQuoteById, updateQuote,
  submitQuote, sendToCustomer, recalculate, getQuoteRisk,
  getDeposit, createDeposit, refundDeposit,
  listLines, addLine, updateLine, deleteLine, getDiscountBreakdown,
  listLineComments, addLineComment
};
