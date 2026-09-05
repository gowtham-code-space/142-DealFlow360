const prisma = require('../../config/db');

// ─── Invoices Queries ─────────────────────────────────────────────────────────

async function findInvoices({ where, skip, take }) {
  return prisma.invoice.findMany({
    where,
    skip,
    take,
    include: {
      customer: { select: { id: true, name: true, email: true, companyName: true } },
      quotation: { select: { id: true, quotationNumber: true } },
      items: true,
      payments: true
    },
    orderBy: { createdAt: 'desc' }
  });
}

async function countInvoices(where) {
  return prisma.invoice.count({ where });
}

async function findInvoiceById(id) {
  return prisma.invoice.findUnique({
    where: { id },
    include: {
      customer: true,
      quotation: true,
      items: { include: { product: true } },
      payments: { include: { recordedByUser: { select: { id: true, name: true } } } }
    }
  });
}

async function findInvoiceForPayment(id) {
  return prisma.invoice.findUnique({
    where: { id },
    include: { payments: true }
  });
}

async function findQuotationForBilling(id) {
  return prisma.quotation.findUnique({
    where: { id },
    include: {
      customer: true,
      items: { include: { product: true, subscriptionPlan: true } },
      depositRecords: { where: { status: 'PAID' } }
    }
  });
}

async function findInvoicesByQuotation(quotationId) {
  return prisma.invoice.findMany({
    where: { quotationId },
    include: { items: true, payments: true }
  });
}

async function createInvoice(data) {
  return prisma.invoice.create({
    data,
    include: { items: true }
  });
}

async function updateInvoice(id, data) {
  return prisma.invoice.update({ where: { id }, data });
}

// ─── Subscriptions Queries ───────────────────────────────────────────────────

async function findSubscriptions({ where, skip, take }) {
  return prisma.subscription.findMany({
    where,
    skip,
    take,
    include: {
      customer: { select: { id: true, name: true, email: true, companyName: true } },
      plan: true
    },
    orderBy: { createdAt: 'desc' }
  });
}

async function countSubscriptions(where) {
  return prisma.subscription.count({ where });
}

async function findSubscriptionById(id) {
  return prisma.subscription.findUnique({
    where: { id },
    include: {
      customer: true,
      plan: true,
      quotation: { select: { id: true, quotationNumber: true } }
    }
  });
}

async function findSubscriptionsByQuotation(quotationId) {
  return prisma.subscription.findMany({
    where: { quotationId },
    include: { plan: true }
  });
}

async function createSubscription(data) {
  return prisma.subscription.create({ data });
}

async function updateSubscription(id, data) {
  return prisma.subscription.update({
    where: { id },
    data,
    include: { plan: true, customer: true }
  });
}

async function findActiveSubscriptionPlan() {
  return prisma.subscriptionPlan.findFirst({ where: { isActive: true } });
}

async function findSubscriptionPlanById(id) {
  return prisma.subscriptionPlan.findUnique({ where: { id } });
}

async function createDefaultSubscriptionPlan(data) {
  return prisma.subscriptionPlan.create({ data });
}

// ─── Payments Queries ─────────────────────────────────────────────────────────

async function findPayments({ where, skip, take }) {
  return prisma.payment.findMany({
    where,
    skip,
    take,
    include: {
      invoice: { select: { id: true, invoiceNumber: true, amountDue: true } },
      customer: { select: { id: true, name: true } },
      recordedByUser: { select: { id: true, name: true } }
    },
    orderBy: { createdAt: 'desc' }
  });
}

async function countPayments(where) {
  return prisma.payment.count({ where });
}

async function createPayment(data) {
  return prisma.payment.create({ data });
}

async function findPaymentsByInvoiceId(invoiceId) {
  return prisma.payment.findMany({
    where: { invoiceId },
    include: { recordedByUser: { select: { id: true, name: true } } },
    orderBy: { createdAt: 'desc' }
  });
}

module.exports = {
  findInvoices,
  countInvoices,
  findInvoiceById,
  findInvoiceForPayment,
  findQuotationForBilling,
  findInvoicesByQuotation,
  createInvoice,
  updateInvoice,
  findSubscriptions,
  countSubscriptions,
  findSubscriptionById,
  findSubscriptionsByQuotation,
  createSubscription,
  updateSubscription,
  findActiveSubscriptionPlan,
  findSubscriptionPlanById,
  createDefaultSubscriptionPlan,
  findPayments,
  countPayments,
  createPayment,
  findPaymentsByInvoiceId
};
