const prisma = require('../../config/db');
const { QuoteStatus } = require('../../constants');

const CUSTOMER_SELECT = {
  id: true, name: true, email: true, phone: true, address: true,
  locationLat: true, locationLng: true, tier: true, creditLimit: true,
  riskScore: true, paymentTerms: true, orderCount: true,
  isActive: true, createdAt: true, updatedAt: true
};

async function findCustomers({ where, skip, take }) {
  return prisma.customer.findMany({
    where,
    skip,
    take,
    select: CUSTOMER_SELECT,
    orderBy: { createdAt: 'desc' }
  });
}

async function countCustomers(where) {
  return prisma.customer.count({ where });
}

async function findCustomerByEmail(email) {
  return prisma.customer.findUnique({ where: { email } });
}

async function findCustomerById(id) {
  return prisma.customer.findUnique({ where: { id }, select: CUSTOMER_SELECT });
}

async function findFullCustomerById(id) {
  return prisma.customer.findUnique({ where: { id } });
}

async function createCustomer(data) {
  return prisma.customer.create({
    data,
    select: CUSTOMER_SELECT
  });
}

async function updateCustomer(id, data) {
  return prisma.customer.update({
    where: { id },
    data,
    select: CUSTOMER_SELECT
  });
}

async function countCustomerActiveQuotes(customerId) {
  return prisma.quotation.count({
    where: {
      customerId,
      status: {
        in: [
          QuoteStatus.DRAFT,
          QuoteStatus.SALES_REP_REVIEW,
          QuoteStatus.MANAGER_REVIEW,
          QuoteStatus.FINANCE_REVIEW,
          QuoteStatus.SENT_TO_CUSTOMER,
          QuoteStatus.CONFIRMED,
          QuoteStatus.FULFILLING
        ]
      }
    }
  });
}

async function findCustomerQuotes(customerId, { skip, take }) {
  const where = { customerId };
  return prisma.quotation.findMany({
    where,
    skip,
    take,
    select: {
      id: true, quotationNumber: true, status: true, currency: true,
      estimatedNetTotal: true, createdAt: true, updatedAt: true,
      rep: { select: { id: true, name: true, email: true } }
    },
    orderBy: { createdAt: 'desc' }
  });
}

async function countCustomerQuotes(customerId) {
  return prisma.quotation.count({ where: { customerId } });
}

module.exports = {
  CUSTOMER_SELECT,
  findCustomers,
  countCustomers,
  findCustomerByEmail,
  findCustomerById,
  findFullCustomerById,
  createCustomer,
  updateCustomer,
  countCustomerActiveQuotes,
  findCustomerQuotes,
  countCustomerQuotes
};
