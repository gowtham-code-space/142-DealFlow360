const svc = require('./fulfillment.service');
const { successResponse, createdResponse, badRequestResponse, notFoundResponse, conflictResponse } = require('../../utils/response');

async function getAllocation(req, res) {
  const result = await svc.getAllocation(req.params.id);
  if (result?.notFound) return notFoundResponse(res, 'Quotation not found');
  return successResponse(res, 'Hardware allocation calculated', result);
}

async function acceptAllocation(req, res) {
  const { allocations } = req.body;
  if (!allocations || !Array.isArray(allocations)) return badRequestResponse(res, 'allocations array is required');
  const result = await svc.acceptAllocation(req.params.id, allocations);
  return successResponse(res, 'Allocations accepted and inventory reserved', result);
}

async function overrideAllocation(req, res) {
  const { overrides } = req.body;
  if (!overrides || !Array.isArray(overrides)) return badRequestResponse(res, 'overrides array is required');
  const result = await svc.overrideAllocation(req.params.id, overrides);
  if (result?.notFound) return notFoundResponse(res, 'Quotation not found');
  if (result?.quantityMismatch) return badRequestResponse(res, `Override quantity mismatch for product ${result.productId}`);
  return successResponse(res, 'Allocations overridden and inventory reserved', result);
}

async function listAllocations(req, res) {
  const data = await svc.listAllocations(req.params.id);
  return successResponse(res, 'Allocations retrieved', data);
}

async function listBackorders(req, res) {
  const { page, pageSize, status, quotationId } = req.query;
  const data = await svc.listBackorders({ page, pageSize, status, quotationId });
  return successResponse(res, 'Backorders retrieved', data);
}

async function createBackorder(req, res) {
  const { quotationId, productId, warehouseId, quantityUnfulfilled, expectedDate, notes } = req.body;
  if (!quotationId || !productId || !warehouseId || !quantityUnfulfilled) {
    return badRequestResponse(res, 'quotationId, productId, warehouseId, and quantityUnfulfilled are required');
  }
  const data = await svc.createBackorder(quotationId, { productId, warehouseId, quantityUnfulfilled, expectedDate, notes });
  return createdResponse(res, 'Backorder created', data);
}

async function getBackorderById(req, res) {
  const data = await svc.getBackorderById(req.params.id);
  if (!data) return notFoundResponse(res, 'Backorder not found');
  return successResponse(res, 'Backorder retrieved', data);
}

async function fulfillBackorder(req, res) {
  const result = await svc.fulfillBackorder(req.params.id);
  if (result?.invalid) return conflictResponse(res, 'Backorder cannot be fulfilled unless status is STOCK_ARRIVED');
  return successResponse(res, 'Backorder fulfilled', result);
}

async function cancelBackorder(req, res) {
  const result = await svc.cancelBackorder(req.params.id);
  if (result?.invalid) return conflictResponse(res, 'Fulfilled backorders cannot be cancelled');
  return successResponse(res, 'Backorder cancelled', result);
}

module.exports = {
  getAllocation, acceptAllocation, overrideAllocation, listAllocations,
  listBackorders, createBackorder, getBackorderById, fulfillBackorder, cancelBackorder
};
