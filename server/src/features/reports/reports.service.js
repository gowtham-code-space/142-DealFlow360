const reportsModel = require('./reports.model');
const {
  Role,
  QuoteStatus,
  PoolType,
  DepositStatus,
  NegotiationTicketStatus,
  Defaults
} = require('../../constants');

async function getQuotationReport({ dateFrom, dateTo, salesRepId, status, productId, customerTier, productType, page = Defaults.PAGE, pageSize = Defaults.PAGE_SIZE } = {}) {
  const skip = (page - 1) * pageSize;
  const where = {};
  if (salesRepId) where.repId = salesRepId;
  if (status) where.status = status.toUpperCase();
  if (dateFrom || dateTo) {
    where.createdAt = {};
    if (dateFrom) where.createdAt.gte = new Date(dateFrom);
    if (dateTo) where.createdAt.lte = new Date(dateTo);
  }
  if (customerTier) {
    where.customer = { tier: customerTier.toUpperCase() };
  }
  if (productId || productType) {
    where.items = {
      some: {
        ...(productId ? { productId } : {}),
        ...(productType ? { product: { productType: productType.toUpperCase() } } : {})
      }
    };
  }

  const { items, total } = await reportsModel.findQuotationReportData({ where, skip, take: Number(pageSize) });
  return { items, total, page: Number(page), pageSize: Number(pageSize), totalPages: Math.ceil(total / pageSize) };
}

async function getSalesPerformanceReport({ dateFrom, dateTo, salesRepId } = {}) {
  const where = { role: Role.SALES_REP, isActive: true };
  if (salesRepId) where.id = salesRepId;

  const reps = await reportsModel.findSalesPerformanceData({ where, dateFrom, dateTo });

  return reps.map(rep => {
    const totalQuotes = rep.quotations.length;
    const approvedQuotes = rep.quotations.filter(q =>
      [QuoteStatus.APPROVED, QuoteStatus.SENT_TO_CUSTOMER, QuoteStatus.CONFIRMED, QuoteStatus.FULFILLING, 'CLOSED'].includes(q.status)
    );
    const totalApproved = approvedQuotes.length;
    const totalRevenue = approvedQuotes.reduce((sum, q) => sum + Number(q.confirmedNetTotal || q.estimatedNetTotal || 0), 0);
    const totalDiscount = rep.quotations.reduce((sum, q) => sum + Number(q.discountTotal || 0), 0);
    const totalSubtotal = rep.quotations.reduce((sum, q) => sum + Number(q.subtotal || 0), 0);
    const avgDiscountPct = totalSubtotal > 0 ? Number(((totalDiscount / totalSubtotal) * 100).toFixed(2)) : 0;

    return {
      salesRepId: rep.id,
      salesRepName: rep.name,
      totalQuotes,
      totalApproved,
      totalRevenue: Number(totalRevenue.toFixed(2)),
      avgDiscountPct
    };
  });
}

async function getProductAnalysisReport({ productType, dateFrom, dateTo } = {}) {
  const where = {};
  if (productType) where.productType = productType.toUpperCase();

  const products = await reportsModel.findProductAnalysisData({ where, dateFrom, dateTo });

  const bestSelling = products
    .map(p => {
      const totalQty = p.quotationItems.reduce((sum, i) => sum + i.quantity, 0);
      const totalRevenue = p.quotationItems.reduce((sum, i) => sum + Number(i.netTotal), 0);
      return {
        productId: p.id,
        productName: p.name,
        category: p.category,
        totalQty,
        totalRevenue: Number(totalRevenue.toFixed(2))
      };
    })
    .sort((a, b) => b.totalRevenue - a.totalRevenue)
    .slice(0, 10);

  const mostDiscounted = products
    .map(p => {
      const totalLines = p.quotationItems.length;
      const avgDiscount = totalLines > 0
        ? p.quotationItems.reduce((sum, i) => sum + Number(i.cumulativeDiscountPct), 0) / totalLines
        : 0;
      return {
        productId: p.id,
        productName: p.name,
        category: p.category,
        avgCumulativeDiscountPct: Number(avgDiscount.toFixed(2))
      };
    })
    .sort((a, b) => b.avgCumulativeDiscountPct - a.avgCumulativeDiscountPct)
    .slice(0, 10);

  return { bestSelling, mostDiscounted };
}

async function getDiscountSummaryReport({ groupBy = 'tier', dateFrom, dateTo } = {}) {
  const items = await reportsModel.findDiscountSummaryData({ dateFrom, dateTo });

  const groups = {};
  for (const item of items) {
    let key = 'Default';
    if (groupBy === 'tier') key = item.quotation?.customer?.tier || 'UNKNOWN';
    else if (groupBy === 'category') key = item.product?.category || 'UNKNOWN';
    else if (groupBy === 'rep') key = item.quotation?.rep?.name || 'UNKNOWN';
    else if (groupBy === 'discountType') key = item.poolAssignment;

    if (!groups[key]) {
      groups[key] = { groupKey: key, totalDiscountSum: 0, maxDiscountPct: 0, totalLines: 0, overLimitLines: 0 };
    }
    const disc = Number(item.cumulativeDiscountPct);
    groups[key].totalDiscountSum += disc;
    groups[key].maxDiscountPct = Math.max(groups[key].maxDiscountPct, disc);
    groups[key].totalLines += 1;
    if (item.isOverLimit) groups[key].overLimitLines += 1;
  }

  return Object.values(groups).map(g => ({
    groupKey: g.groupKey,
    avgDiscountPct: g.totalLines > 0 ? Number((g.totalDiscountSum / g.totalLines).toFixed(2)) : 0,
    maxDiscountPct: Number(g.maxDiscountPct.toFixed(2)),
    totalLines: g.totalLines,
    overLimitLines: g.overLimitLines
  }));
}

async function getPoolUtilizationReport({ dateFrom, dateTo } = {}) {
  const quotes = await reportsModel.findPoolUtilizationData({ dateFrom, dateTo });

  let normalPoolOrders = 0;
  let premiumBulkPoolOrders = 0;
  let depositsPaid = 0;
  let depositAmount = 0;

  for (const q of quotes) {
    if (q.items.some(i => i.poolAssignment === PoolType.PREMIUM_BULK)) {
      premiumBulkPoolOrders += 1;
    } else {
      normalPoolOrders += 1;
    }
    for (const d of q.depositRecords) {
      if (d.status === DepositStatus.PAID) {
        depositsPaid += 1;
        depositAmount += Number(d.amount);
      }
    }
  }

  return [{
    period: 'All-Time / Filtered Range',
    normalPoolOrders,
    premiumBulkPoolOrders,
    depositsPaid,
    depositAmount: Number(depositAmount.toFixed(2))
  }];
}

async function getNegotiationOutcomesReport({ dateFrom, dateTo } = {}) {
  const tickets = await reportsModel.findNegotiationOutcomesData({ dateFrom, dateTo });

  const total = tickets.length;
  const accepted = tickets.filter(t => t.status === NegotiationTicketStatus.ACCEPTED).length;
  const rejected = tickets.filter(t => t.status === NegotiationTicketStatus.REJECTED).length;
  const countered = tickets.filter(t => t.status === NegotiationTicketStatus.COUNTERED).length;
  const expired = tickets.filter(t => t.status === NegotiationTicketStatus.EXPIRED).length;

  const totalRequested = tickets.reduce((sum, t) => sum + Number(t.requestedDiscountPct), 0);
  const acceptedTickets = tickets.filter(t => t.status === NegotiationTicketStatus.ACCEPTED);
  const totalAccepted = acceptedTickets.reduce((sum, t) => sum + Number(t.counterDiscountPct || t.requestedDiscountPct), 0);

  return {
    total,
    accepted,
    rejected,
    countered,
    expired,
    avgRequestedDiscountPct: total > 0 ? Number((totalRequested / total).toFixed(2)) : 0,
    avgAcceptedDiscountPct: acceptedTickets.length > 0 ? Number((totalAccepted / acceptedTickets.length).toFixed(2)) : 0
  };
}

module.exports = {
  getQuotationReport, getSalesPerformanceReport, getProductAnalysisReport,
  getDiscountSummaryReport, getPoolUtilizationReport, getNegotiationOutcomesReport
};
