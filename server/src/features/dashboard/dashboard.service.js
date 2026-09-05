const dashModel = require('./dashboard.model');
const { QuoteStatus } = require('../../constants');

async function getSummary({ periodDays = 30 } = {}) {
  const since = new Date();
  since.setDate(since.getDate() - Number(periodDays));

  const quotes = await dashModel.findQuotesSince(since);

  const totalQuotes = quotes.length;
  const pendingApprovals = quotes.filter(
    q => q.requiresApproval && [QuoteStatus.SALES_REP_REVIEW, QuoteStatus.MANAGER_REVIEW, QuoteStatus.FINANCE_REVIEW].includes(q.status)
  ).length;
  const approvedQuotes = quotes.filter(
    q => [QuoteStatus.APPROVED, QuoteStatus.SENT_TO_CUSTOMER, QuoteStatus.CONFIRMED, QuoteStatus.FULFILLING, 'CLOSED'].includes(q.status)
  ).length;
  const confirmedQuotes = quotes.filter(
    q => [QuoteStatus.CONFIRMED, QuoteStatus.FULFILLING, 'CLOSED'].includes(q.status)
  ).length;

  const confirmedRevenue = quotes
    .filter(q => [QuoteStatus.CONFIRMED, QuoteStatus.FULFILLING, 'CLOSED'].includes(q.status))
    .reduce((sum, q) => sum + Number(q.confirmedNetTotal || q.estimatedNetTotal || 0), 0);

  const totalDiscounts = quotes.reduce((sum, q) => sum + Number(q.discountTotal || 0), 0);
  const totalSubtotal = quotes.reduce((sum, q) => sum + Number(q.subtotal || 0), 0);
  const avgCumulativeDiscountPct = totalSubtotal > 0 ? Number(((totalDiscounts / totalSubtotal) * 100).toFixed(2)) : 0;

  return {
    periodDays: Number(periodDays),
    totalQuotes,
    pendingApprovals,
    approvedQuotes,
    confirmedQuotes,
    confirmedRevenue: Number(confirmedRevenue.toFixed(2)),
    avgCumulativeDiscountPct
  };
}

async function getStalledDeals({ stallDays = 7 } = {}) {
  const stallDate = new Date();
  stallDate.setDate(stallDate.getDate() - Number(stallDays));

  const quotes = await dashModel.findStalledQuotes(stallDate);

  return quotes.map(q => ({
    id: q.id,
    type: 'STALLED_DEAL',
    severity: 'HIGH',
    quoteId: q.id,
    quotationNumber: q.quotationNumber,
    customerName: q.customer?.name,
    repName: q.rep?.name,
    status: q.status,
    daysInStatus: Math.floor((new Date() - new Date(q.updatedAt)) / (1000 * 60 * 60 * 24)),
    amount: Number(q.estimatedNetTotal),
    message: `Quote ${q.quotationNumber} has been in ${q.status} status for over ${stallDays} days`
  }));
}

async function getDiscountAnomalies() {
  const quotes = await dashModel.findRecentQuotesForAnomalies(50);

  const anomalies = [];
  for (const q of quotes) {
    const subtotal = Number(q.subtotal || 0);
    const discount = Number(q.discountTotal || 0);
    const pct = subtotal > 0 ? (discount / subtotal) * 100 : 0;

    if (pct > 25) {
      anomalies.push({
        id: q.id,
        type: 'DISCOUNT_ANOMALY',
        severity: pct > 40 ? 'CRITICAL' : 'HIGH',
        quoteId: q.id,
        quotationNumber: q.quotationNumber,
        customerName: q.customer?.name,
        repName: q.rep?.name,
        discountPct: Number(pct.toFixed(2)),
        discountAmount: discount,
        message: `Quote ${q.quotationNumber} has an unusually high total discount of ${pct.toFixed(1)}%`
      });
    }
  }
  return anomalies;
}

async function getDeliverySlippage() {
  const allocations = await dashModel.findDelayedAllocations();

  return allocations.map(a => ({
    id: a.id,
    type: 'DELIVERY_SLIPPAGE',
    severity: 'MEDIUM',
    quotationId: a.quotationId,
    quotationNumber: a.quotation?.quotationNumber,
    productName: a.product?.name,
    warehouseName: a.warehouse?.name,
    quantity: a.quantity,
    daysInPending: Math.floor((new Date() - new Date(a.createdAt)) / (1000 * 60 * 60 * 24)),
    message: `Allocation for ${a.product?.name} (qty: ${a.quantity}) from ${a.warehouse?.name} has been pending for over 5 days`
  }));
}

async function getDealHealth() {
  const [stalled, anomalies, slippage] = await Promise.all([
    getStalledDeals({ stallDays: 7 }),
    getDiscountAnomalies(),
    getDeliverySlippage()
  ]);
  return [...stalled, ...anomalies, ...slippage];
}

async function getPipeline() {
  const stages = [
    { key: QuoteStatus.DRAFT, label: 'Draft' },
    { key: QuoteStatus.SALES_REP_REVIEW, label: 'Sales Rep Review' },
    { key: QuoteStatus.MANAGER_REVIEW, label: 'Manager Review' },
    { key: QuoteStatus.FINANCE_REVIEW, label: 'Finance Review' },
    { key: QuoteStatus.APPROVED, label: 'Approved' },
    { key: QuoteStatus.SENT_TO_CUSTOMER, label: 'Sent to Customer' },
    { key: QuoteStatus.CONFIRMED, label: 'Confirmed' },
    { key: QuoteStatus.FULFILLING, label: 'Fulfilling' },
    { key: 'CLOSED', label: 'Closed' }
  ];

  const quotes = await dashModel.findAllQuotesForPipeline();

  return stages.map(st => {
    const stageQuotes = quotes.filter(q => q.status === st.key);
    const totalValue = stageQuotes.reduce((sum, q) => sum + Number(q.estimatedNetTotal || 0), 0);
    return {
      stage: st.key,
      label: st.label,
      count: stageQuotes.length,
      totalValue: Number(totalValue.toFixed(2)),
      quotes: stageQuotes
    };
  });
}

async function getRegionDemand({ region, periodDays = 30 } = {}) {
  const since = new Date();
  since.setDate(since.getDate() - Number(periodDays));

  const where = { createdAt: { gte: since } };
  if (region) where.region = region;

  return dashModel.findRegionDemandRecords(where);
}

async function getPoolHealth() {
  const inventories = await dashModel.findAllInventoriesForHealth();

  return inventories.map(inv => ({
    id: inv.id,
    productId: inv.productId,
    productName: inv.product?.name,
    category: inv.product?.category,
    warehouseId: inv.warehouseId,
    warehouseName: inv.warehouse?.name,
    region: inv.warehouse?.region,
    normalPoolQty: inv.normalPoolQty,
    premiumBulkPoolQty: inv.premiumBulkPoolQty,
    reservedNormal: inv.reservedNormal,
    reservedPremium: inv.reservedPremium,
    availableNormal: Math.max(0, inv.normalPoolQty - inv.reservedNormal),
    availablePremium: Math.max(0, inv.premiumBulkPoolQty - inv.reservedPremium)
  }));
}

module.exports = {
  getSummary, getStalledDeals, getDiscountAnomalies, getDeliverySlippage,
  getDealHealth, getPipeline, getRegionDemand, getPoolHealth
};
