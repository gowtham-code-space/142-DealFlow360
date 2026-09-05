const { v4: uuidv4 } = require('uuid');
const customerModel = require('./customers.model');
const { CustomerTier, Defaults } = require('../../constants');

async function listCustomers({ page = Defaults.PAGE, pageSize = Defaults.PAGE_SIZE, tier, name, isActive }) {
  const skip = (page - 1) * pageSize;
  const where = {};
  if (tier) where.tier = tier.toUpperCase();
  if (name) where.name = { contains: name };
  if (isActive !== undefined) where.isActive = isActive === 'true' || isActive === true;

  const [items, total] = await Promise.all([
    customerModel.findCustomers({ where, skip, take: Number(pageSize) }),
    customerModel.countCustomers(where)
  ]);
  return { items, total, page: Number(page), pageSize: Number(pageSize), totalPages: Math.ceil(total / pageSize) };
}

async function createCustomer({ name, email, phone, address, tier, creditLimit }) {
  const existing = await customerModel.findCustomerByEmail(email);
  if (existing) return { conflict: true };

  const customer = await customerModel.createCustomer({
    id: uuidv4(),
    name,
    email,
    phone,
    address,
    tier: tier?.toUpperCase() || CustomerTier.STANDARD,
    creditLimit
  });
  return { customer };
}

async function getCustomerById(id) {
  return customerModel.findCustomerById(id);
}

async function updateCustomer(id, fields) {
  const data = {};
  if (fields.name !== undefined) data.name = fields.name;
  if (fields.tier !== undefined) data.tier = fields.tier.toUpperCase();
  if (fields.creditLimit !== undefined) data.creditLimit = fields.creditLimit;
  if (fields.locationLat !== undefined) data.locationLat = fields.locationLat;
  if (fields.locationLng !== undefined) data.locationLng = fields.locationLng;
  if (fields.address !== undefined) data.address = fields.address;

  return customerModel.updateCustomer(id, data);
}

async function softDeleteCustomer(id) {
  const customer = await customerModel.findFullCustomerById(id);
  if (!customer) return { notFound: true };

  const activeQuotes = await customerModel.countCustomerActiveQuotes(id);
  if (activeQuotes > 0) return { hasActiveOrders: true };

  await customerModel.updateCustomer(id, { isActive: false });
  return { success: true };
}

async function reactivateCustomer(id) {
  const customer = await customerModel.findFullCustomerById(id);
  if (!customer) return null;
  return customerModel.updateCustomer(id, { isActive: true });
}

async function getCustomerQuotes(customerId, { page = Defaults.PAGE, pageSize = Defaults.PAGE_SIZE }) {
  const skip = (page - 1) * pageSize;
  const [items, total] = await Promise.all([
    customerModel.findCustomerQuotes(customerId, { skip, take: Number(pageSize) }),
    customerModel.countCustomerQuotes(customerId)
  ]);
  return { items, total, page: Number(page), pageSize: Number(pageSize), totalPages: Math.ceil(total / pageSize) };
}

module.exports = { listCustomers, createCustomer, getCustomerById, updateCustomer, softDeleteCustomer, reactivateCustomer, getCustomerQuotes };
