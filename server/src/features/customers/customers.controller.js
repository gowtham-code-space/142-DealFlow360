const svc = require('./customers.service');
const {
  successResponse, createdResponse, badRequestResponse,
  notFoundResponse, conflictResponse
} = require('../../utils/response');

async function listCustomers(req, res) {
  const { page, pageSize, tier, name, isActive } = req.query;
  const data = await svc.listCustomers({ page, pageSize, tier, name, isActive });
  return successResponse(res, 'Customers fetched', data);
}

async function createCustomer(req, res) {
  const { name, email, phone, address, tier, creditLimit } = req.body;
  if (!name || !email) return badRequestResponse(res, 'name and email are required');

  const result = await svc.createCustomer({ name, email, phone, address, tier, creditLimit });
  if (result.conflict) return conflictResponse(res, 'Email already registered');
  return createdResponse(res, 'Customer created', result.customer);
}

async function getCustomerById(req, res) {
  const customer = await svc.getCustomerById(req.params.customerId);
  if (!customer) return notFoundResponse(res, 'Customer not found');
  return successResponse(res, 'Customer fetched', customer);
}

async function updateCustomer(req, res) {
  try {
    const customer = await svc.updateCustomer(req.params.customerId, req.body);
    return successResponse(res, 'Customer updated', customer);
  } catch {
    return notFoundResponse(res, 'Customer not found');
  }
}

async function softDeleteCustomer(req, res) {
  const result = await svc.softDeleteCustomer(req.params.customerId);
  if (result.notFound) return notFoundResponse(res, 'Customer not found');
  if (result.hasActiveOrders) return conflictResponse(res, 'Cannot deactivate customer with active orders');
  return successResponse(res, 'Customer deactivated');
}

async function reactivateCustomer(req, res) {
  const customer = await svc.reactivateCustomer(req.params.customerId);
  if (!customer) return notFoundResponse(res, 'Customer not found');
  return successResponse(res, 'Customer reactivated', customer);
}

async function getCustomerQuotes(req, res) {
  const { page, pageSize } = req.query;
  const customer = await svc.getCustomerById(req.params.customerId);
  if (!customer) return notFoundResponse(res, 'Customer not found');

  const data = await svc.getCustomerQuotes(req.params.customerId, { page, pageSize });
  return successResponse(res, 'Customer quotes fetched', data);
}

module.exports = { listCustomers, createCustomer, getCustomerById, updateCustomer, softDeleteCustomer, reactivateCustomer, getCustomerQuotes };
