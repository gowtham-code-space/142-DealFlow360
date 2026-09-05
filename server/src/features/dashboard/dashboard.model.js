const prisma = require('../../config/db');

async function findQuotesSince(sinceDate) {
  return prisma.quotation.findMany({
    where: { createdAt: { gte: sinceDate } },
    include: { items: true }
  });
}

async function findStalledQuotes(stallDate) {
  return prisma.quotation.findMany({
    where: {
      status: { notIn: ['CONFIRMED', 'CLOSED', 'REJECTED'] },
      updatedAt: { lte: stallDate }
    },
    include: { customer: true, rep: true },
    orderBy: { updatedAt: 'asc' }
  });
}

async function findRecentQuotesForAnomalies(take = 50) {
  return prisma.quotation.findMany({
    where: { status: { notIn: ['CLOSED', 'REJECTED'] } },
    include: { customer: true, rep: true, items: true },
    orderBy: { createdAt: 'desc' },
    take
  });
}

async function findPendingBackorders() {
  return prisma.backorder.findMany({
    where: { status: { in: ['CREATED', 'PENDING_STOCK'] } },
    include: {
      quotation: { include: { customer: true } },
      product: true,
      warehouse: true
    }
  });
}

async function findAllQuotesForPipeline() {
  return prisma.quotation.findMany({
    include: {
      customer: { select: { id: true, name: true, companyName: true } },
      rep: { select: { id: true, name: true } }
    },
    orderBy: { updatedAt: 'desc' }
  });
}

async function findRegionDemandRecords(where) {
  return prisma.regionDemandRecord.findMany({
    where,
    include: { product: { select: { id: true, name: true, category: true } } },
    orderBy: { demandCount: 'desc' }
  });
}

async function findAllInventoriesForHealth() {
  return prisma.inventory.findMany({
    include: {
      product: { select: { id: true, name: true, category: true } },
      warehouse: { select: { id: true, name: true, region: true } }
    }
  });
}

module.exports = {
  findQuotesSince,
  findStalledQuotes,
  findRecentQuotesForAnomalies,
  findPendingBackorders,
  findAllQuotesForPipeline,
  findRegionDemandRecords,
  findAllInventoriesForHealth
};
