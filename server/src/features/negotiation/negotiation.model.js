const prisma = require('../../config/db');

// ─── Tickets Queries ─────────────────────────────────────────────────────────

async function findNegotiationTickets({ where, skip, take }) {
  return prisma.negotiationTicket.findMany({
    where,
    skip,
    take,
    include: {
      customer: { select: { id: true, name: true, email: true, companyName: true } },
      quotation: { select: { id: true, quotationNumber: true, status: true } },
      productHolds: true
    },
    orderBy: { createdAt: 'desc' }
  });
}

async function countNegotiationTickets(where) {
  return prisma.negotiationTicket.count({ where });
}

async function findTicketsByQuoteId(quoteId) {
  return prisma.negotiationTicket.findMany({
    where: { quoteId },
    include: {
      customer: { select: { id: true, name: true, email: true } },
      productHolds: true,
      lineComments: true
    },
    orderBy: { createdAt: 'desc' }
  });
}

async function findTicketById(id) {
  return prisma.negotiationTicket.findUnique({
    where: { id },
    include: {
      customer: true,
      quotation: { select: { id: true, quotationNumber: true, status: true, estimatedNetTotal: true } },
      productHolds: { include: { product: true, warehouse: true } },
      lineComments: { include: { author: { select: { id: true, name: true, roleId: true } } } }
    }
  });
}

async function findRawTicketById(id) {
  return prisma.negotiationTicket.findUnique({
    where: { id },
    include: { productHolds: true }
  });
}

async function findQuotationForTicket(quoteId) {
  return prisma.quotation.findUnique({
    where: { id: quoteId },
    include: { items: { include: { product: true } } }
  });
}

async function findPoolConfig() {
  return prisma.poolConfig.findFirst();
}

async function createNegotiationTicket(data) {
  return prisma.negotiationTicket.create({ data });
}

async function createProductHold(data) {
  return prisma.productHold.create({ data });
}

async function updateNegotiationTicket(id, data) {
  return prisma.negotiationTicket.update({
    where: { id },
    data,
    include: { productHolds: true, quotation: true }
  });
}

async function releaseProductHolds(ticketId) {
  return prisma.productHold.updateMany({
    where: { ticketId, status: 'ACTIVE' },
    data: { status: 'RELEASED' }
  });
}

async function findProductHoldsByTicketId(ticketId) {
  return prisma.productHold.findMany({
    where: { ticketId },
    include: {
      product: { select: { id: true, name: true } },
      warehouse: { select: { id: true, name: true } }
    }
  });
}

// ─── Negotiation Messages Queries ────────────────────────────────────────────

async function findNegotiations(quotationId) {
  return prisma.negotiation.findMany({
    where: { quotationId },
    include: { sender: { select: { id: true, name: true, roleId: true } } },
    orderBy: { createdAt: 'asc' }
  });
}

async function createNegotiation(data) {
  return prisma.negotiation.create({
    data,
    include: { sender: { select: { id: true, name: true, roleId: true } } }
  });
}

// ─── Approval & Quotation Helpers ───────────────────────────────────────────

async function createApproval(data) {
  return prisma.approval.create({ data });
}

async function updateQuotationStatus(id, status) {
  return prisma.quotation.update({
    where: { id },
    data: { status }
  });
}

async function findQuotationContextForExport(quoteId) {
  return prisma.quotation.findUnique({
    where: { id: quoteId },
    include: {
      customer: true,
      rep: { select: { id: true, name: true, email: true } },
      items: { include: { product: true } },
      negotiationTickets: { orderBy: { createdAt: 'desc' } },
      negotiations: { orderBy: { createdAt: 'asc' }, include: { sender: { select: { name: true, roleId: true } } } },
      approvals: { orderBy: { createdAt: 'desc' }, include: { approver: { select: { name: true, roleId: true } } } }
    }
  });
}

module.exports = {
  findNegotiationTickets,
  countNegotiationTickets,
  findTicketsByQuoteId,
  findTicketById,
  findRawTicketById,
  findQuotationForTicket,
  findPoolConfig,
  createNegotiationTicket,
  createProductHold,
  updateNegotiationTicket,
  releaseProductHolds,
  findProductHoldsByTicketId,
  findNegotiations,
  createNegotiation,
  createApproval,
  updateQuotationStatus,
  findQuotationContextForExport
};
