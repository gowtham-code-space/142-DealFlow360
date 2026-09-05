const prisma = require('../../config/db');

async function findQuotationReportData({ where, skip, take }) {
  const [items, total] = await Promise.all([
    prisma.quotation.findMany({
      where,
      skip,
      take,
      include: {
        customer: { select: { id: true, name: true, tier: true, companyName: true } },
        rep: { select: { id: true, name: true } },
        items: { include: { product: true } }
      },
      orderBy: { createdAt: 'desc' }
    }),
    prisma.quotation.count({ where })
  ]);
  return { items, total };
}

async function findSalesPerformanceData({ where, dateFrom, dateTo }) {
  return prisma.user.findMany({
    where,
    include: {
      quotations: {
        where: {
          ...(dateFrom || dateTo ? {
            createdAt: {
              ...(dateFrom ? { gte: new Date(dateFrom) } : {}),
              ...(dateTo ? { lte: new Date(dateTo) } : {})
            }
          } : {})
        }
      }
    }
  });
}

async function findProductAnalysisData({ where, dateFrom, dateTo }) {
  return prisma.product.findMany({
    where,
    include: {
      quotationItems: {
        where: {
          ...(dateFrom || dateTo ? {
            createdAt: {
              ...(dateFrom ? { gte: new Date(dateFrom) } : {}),
              ...(dateTo ? { lte: new Date(dateTo) } : {})
            }
          } : {})
        }
      }
    }
  });
}

async function findDiscountSummaryData({ dateFrom, dateTo }) {
  return prisma.quotationItem.findMany({
    where: {
      ...(dateFrom || dateTo ? {
        createdAt: {
          ...(dateFrom ? { gte: new Date(dateFrom) } : {}),
          ...(dateTo ? { lte: new Date(dateTo) } : {})
        }
      } : {})
    },
    include: {
      quotation: { include: { customer: true, rep: true } },
      product: true
    }
  });
}

async function findPoolUtilizationData({ dateFrom, dateTo }) {
  return prisma.quotation.findMany({
    where: {
      ...(dateFrom || dateTo ? {
        createdAt: {
          ...(dateFrom ? { gte: new Date(dateFrom) } : {}),
          ...(dateTo ? { lte: new Date(dateTo) } : {})
        }
      } : {})
    },
    include: { items: true, depositRecords: true }
  });
}

async function findNegotiationOutcomesData({ dateFrom, dateTo }) {
  return prisma.negotiationTicket.findMany({
    where: {
      ...(dateFrom || dateTo ? {
        createdAt: {
          ...(dateFrom ? { gte: new Date(dateFrom) } : {}),
          ...(dateTo ? { lte: new Date(dateTo) } : {})
        }
      } : {})
    }
  });
}

module.exports = {
  findQuotationReportData,
  findSalesPerformanceData,
  findProductAnalysisData,
  findDiscountSummaryData,
  findPoolUtilizationData,
  findNegotiationOutcomesData
};
