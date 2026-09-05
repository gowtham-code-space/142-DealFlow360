const { v4: uuidv4 } = require('uuid');
const prisma = require('../../config/db');

async function findCustomerQuotes({ where, skip, take }) {
  const [items, total] = await Promise.all([
    prisma.quotation.findMany({
      where,
      skip,
      take,
      include: { customer: true },
      orderBy: { createdAt: 'desc' }
    }),
    prisma.quotation.count({ where })
  ]);
  return { items, total };
}

async function findQuoteByIdWithDetails(quoteId) {
  return prisma.quotation.findUnique({
    where: { id: quoteId },
    include: {
      customer: true,
      items: { include: { product: true } }
    }
  });
}

async function findQuoteById(quoteId) {
  return prisma.quotation.findUnique({
    where: { id: quoteId }
  });
}

async function findQuoteLines(quoteId) {
  return prisma.quotationItem.findMany({
    where: { quotationId: quoteId },
    include: { product: true }
  });
}

async function findOpenNegotiationTicket(quoteId) {
  return prisma.negotiationTicket.findFirst({
    where: { quoteId, status: { in: ['OPEN', 'COUNTERED'] } }
  });
}

async function createLineComment({ lineId, authorId, content }) {
  return prisma.lineComment.create({
    data: {
      id: uuidv4(),
      quoteLineId: lineId,
      authorId,
      content
    },
    include: { author: { select: { id: true, name: true } } }
  });
}

async function findQuoteWithAcceptedTickets(quoteId) {
  return prisma.quotation.findUnique({
    where: { id: quoteId },
    include: { negotiationTickets: { where: { status: 'ACCEPTED' } } }
  });
}

async function updateQuoteToConfirmed(quoteId, confirmedNetTotal) {
  return prisma.quotation.update({
    where: { id: quoteId },
    data: {
      status: 'CONFIRMED',
      confirmedNetTotal
    },
    include: { customer: true, items: { include: { product: true } } }
  });
}

async function findQuoteWithDepositsAndItems(quoteId) {
  return prisma.quotation.findUnique({
    where: { id: quoteId },
    include: { depositRecords: true, items: true }
  });
}

async function findPoolConfig() {
  return prisma.poolConfig.findFirst();
}

async function findQuoteWithDeposits(quoteId) {
  return prisma.quotation.findUnique({
    where: { id: quoteId },
    include: { depositRecords: true }
  });
}

async function updateDepositRecord(id, data) {
  return prisma.depositRecord.update({
    where: { id },
    data
  });
}

async function createDepositRecord(data) {
  return prisma.depositRecord.create({
    data: {
      id: uuidv4(),
      ...data
    }
  });
}

async function findCustomerTickets({ where, skip, take }) {
  const [items, total] = await Promise.all([
    prisma.negotiationTicket.findMany({
      where,
      skip,
      take,
      include: { quotation: { select: { id: true, quotationNumber: true, status: true } } },
      orderBy: { createdAt: 'desc' }
    }),
    prisma.negotiationTicket.count({ where })
  ]);
  return { items, total };
}

async function findCustomerTicketById(ticketId) {
  return prisma.negotiationTicket.findUnique({
    where: { id: ticketId },
    include: {
      quotation: { select: { id: true, quotationNumber: true, status: true } },
      productHolds: { include: { product: { select: { id: true, name: true } } } }
    }
  });
}

module.exports = {
  findCustomerQuotes,
  findQuoteByIdWithDetails,
  findQuoteById,
  findQuoteLines,
  findOpenNegotiationTicket,
  createLineComment,
  findQuoteWithAcceptedTickets,
  updateQuoteToConfirmed,
  findQuoteWithDepositsAndItems,
  findPoolConfig,
  findQuoteWithDeposits,
  updateDepositRecord,
  createDepositRecord,
  findCustomerTickets,
  findCustomerTicketById
};
