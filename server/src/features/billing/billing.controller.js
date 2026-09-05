const svc = require('./billing.service');
const {
  successResponse, createdResponse, badRequestResponse,
  notFoundResponse, conflictResponse, forbiddenResponse
} = require('../../utils/response');

// ─── Invoices ────────────────────────────────────────────────────────────────

async function listInvoices(req, res) {
  const { page, pageSize, customerId, status, type, dateFrom, dateTo } = req.query;
  const data = await svc.listInvoices({ page, pageSize, customerId, status, type, dateFrom, dateTo });
  return successResponse(res, 'Invoices retrieved', data);
}

async function getInvoiceById(req, res) {
  const data = await svc.getInvoiceById(req.params.id);
  if (!data) return notFoundResponse(res, 'Invoice not found');
  return successResponse(res, 'Invoice retrieved', data);
}

// ─── Quote Billing ───────────────────────────────────────────────────────────

async function generateBilling(req, res) {
  const result = await svc.generateBilling(req.params.id);
  if (result?.notFound) return notFoundResponse(res, 'Quotation not found');
  if (result?.conflict) return conflictResponse(res, result.message || 'Billing already generated for this quote');
  return createdResponse(res, 'Billing generated for quotation', result);
}

async function getQuoteBilling(req, res) {
  const result = await svc.getQuoteBilling(req.params.id);
  return successResponse(res, 'Quote billing details retrieved', result);
}

// ─── Subscriptions ───────────────────────────────────────────────────────────

async function listSubscriptions(req, res) {
  const { page, pageSize, customerId, status } = req.query;
  const data = await svc.listSubscriptions({ page, pageSize, customerId, status });
  return successResponse(res, 'Subscriptions retrieved', data);
}

async function getSubscriptionById(req, res) {
  const data = await svc.getSubscriptionById(req.params.id);
  if (!data) return notFoundResponse(res, 'Subscription not found');
  return successResponse(res, 'Subscription retrieved', data);
}

async function modifySubscription(req, res) {
  const { quantity, planId } = req.body;
  const result = await svc.modifySubscription(req.params.id, { quantity, planId });
  if (result?.notFound) return notFoundResponse(res, 'Subscription not found');
  if (result?.cancelled) return conflictResponse(res, 'Cannot modify a cancelled subscription');
  if (result?.planNotFound) return badRequestResponse(res, 'Specified plan not found');
  return successResponse(res, 'Subscription modified with proration applied', result);
}

async function cancelSubscription(req, res) {
  const { reason } = req.body;
  const result = await svc.cancelSubscription(req.params.id, { reason });
  if (result?.notFound) return notFoundResponse(res, 'Subscription not found');
  if (result?.alreadyCancelled) return conflictResponse(res, 'Subscription already cancelled');
  return successResponse(res, 'Subscription cancelled', result);
}

async function getProrationPreview(req, res) {
  const { newQuantity, newPlanId } = req.query;
  const result = await svc.getProrationPreview(req.params.id, {
    newQuantity: newQuantity ? parseInt(newQuantity, 10) : undefined,
    newPlanId
  });
  if (result?.notFound) return notFoundResponse(res, 'Subscription not found');
  if (result?.planNotFound) return badRequestResponse(res, 'Specified plan not found');
  return successResponse(res, 'Proration preview calculated', result);
}

// ─── Payments ────────────────────────────────────────────────────────────────

async function listPayments(req, res) {
  const { page, pageSize, invoiceId, customerId } = req.query;
  const data = await svc.listPayments({ page, pageSize, invoiceId, customerId });
  return successResponse(res, 'Payments retrieved', data);
}

async function recordPayment(req, res) {
  const { amount, method, reference } = req.body;
  if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
    return badRequestResponse(res, 'A valid positive amount is required');
  }
  const result = await svc.recordPayment(req.params.id, { amount, method, reference }, req.user?.userId || req.user?.id);
  if (result?.notFound) return notFoundResponse(res, 'Invoice not found');
  if (result?.alreadyPaid) return conflictResponse(res, 'Invoice is already fully paid');
  if (result?.exceedsBalance) {
    return res.status(422).json({
      success: false,
      message: `Payment amount (${result.amount}) exceeds outstanding invoice balance (${result.remainingDue})`,
      data: null
    });
  }
  return createdResponse(res, 'Payment recorded successfully', result);
}

async function getInvoicePayments(req, res) {
  const data = await svc.getInvoicePayments(req.params.id);
  return successResponse(res, 'Invoice payments retrieved', data);
}

module.exports = {
  listInvoices, getInvoiceById, generateBilling, getQuoteBilling,
  listSubscriptions, getSubscriptionById, modifySubscription, cancelSubscription, getProrationPreview,
  listPayments, recordPayment, getInvoicePayments
};
