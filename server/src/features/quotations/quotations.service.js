const { v4: uuidv4 } = require('uuid');
const quoteModel = require('./quotations.model');
const { calculateLineDiscounts } = require('../../utils/discountEngine');
const { calculateQuoteRisk } = require('../../utils/riskEngine');
const { QuoteStatus, ApprovalStage, DepositStatus, ProductType, PoolType, Defaults } = require('../../constants');

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function generateQuoteNumber() {
  const year = new Date().getFullYear();
  const count = await quoteModel.countQuotations();
  return `QT-${year}-${String(count + 1).padStart(5, '0')}`;
}

async function recalcQuoteTotals(quotationId) {
  const items = await quoteModel.findQuoteLines(quotationId);
  const subtotal = items.reduce((s, i) => s + Number(i.lineTotal), 0);
  const discountTotal = items.reduce((s, i) => s + (Number(i.lineTotal) - Number(i.netTotal)), 0);
  const estimatedNetTotal = subtotal - discountTotal;
  const cogs = items.reduce((s, i) => s + Number(i.unitCostPrice) * i.quantity, 0);
  const marginPct = estimatedNetTotal > 0 ? ((estimatedNetTotal - cogs) / estimatedNetTotal) * 100 : 0;
  const hasHardwareLines = items.some(i => i.poolAssignment === PoolType.NORMAL || i.poolAssignment === PoolType.PREMIUM_BULK);
  const hasSoftwareLines = items.some(i => i.isRecurring);

  await quoteModel.updateQuotation(quotationId, {
    subtotal,
    discountTotal,
    estimatedNetTotal,
    cogs,
    marginPct: Math.max(-100, Math.min(100, marginPct)),
    hasHardwareLines,
    hasSoftwareLines
  });
}

// ─── Quotations ───────────────────────────────────────────────────────────────

async function listQuotes({ page = Defaults.PAGE, pageSize = Defaults.PAGE_SIZE, status, customerId, repId }) {
  const skip = (page - 1) * pageSize;
  const where = {};
  if (status) where.status = status.toUpperCase();
  if (customerId) where.customerId = customerId;
  if (repId) where.repId = repId;

  const [items, total] = await Promise.all([
    quoteModel.findQuotations({ where, skip, take: Number(pageSize) }),
    quoteModel.countQuotations(where)
  ]);
  return { items, total, page: Number(page), pageSize: Number(pageSize), totalPages: Math.ceil(total / pageSize) };
}

async function createQuote({ customerId, repId, currency, validUntil, notes }) {
  const customer = await quoteModel.findCustomerById(customerId);
  if (!customer) return { customerNotFound: true };

  const quotationNumber = await generateQuoteNumber();

  const quote = await quoteModel.createQuotation({
    id: uuidv4(),
    quotationNumber,
    customerId,
    repId,
    currency: currency || Defaults.CURRENCY,
    validUntil: validUntil ? new Date(validUntil) : null,
    notes,
    status: QuoteStatus.DRAFT
  });
  return { quote };
}

async function getQuoteById(id) {
  return quoteModel.findQuotationById(id);
}

async function updateQuoteDraft(id, { currency, validUntil, notes }) {
  const quote = await quoteModel.findQuotationById(id);
  if (!quote) return { notFound: true };
  if (![QuoteStatus.DRAFT, QuoteStatus.RETURNED].includes(quote.status)) return { notDraft: true };

  const data = {};
  if (currency !== undefined) data.currency = currency;
  if (validUntil !== undefined) data.validUntil = validUntil ? new Date(validUntil) : null;
  if (notes !== undefined) data.notes = notes;

  const updated = await quoteModel.updateQuotation(id, data);
  return { quote: updated };
}

async function submitQuote(id) {
  const quote = await quoteModel.findQuotationForSubmit(id);
  if (!quote) return { notFound: true };
  if (![QuoteStatus.DRAFT, QuoteStatus.RETURNED].includes(quote.status)) return { invalidStatus: true };
  if (quote.items.length === 0) return { noItems: true };

  const [discountPolicies, discountRules, approvalRules] = await Promise.all([
    quoteModel.findDiscountPolicies(),
    quoteModel.findDiscountTypeRules(),
    quoteModel.findApprovalChainRule()
  ]);

  const lineResults = [];

  for (const item of quote.items) {
    const policy = discountPolicies.find(
      p => p.customerTier === quote.customer.tier && p.productCategory === item.product.category
    );

    const result = calculateLineDiscounts({
      product: item.product,
      variant: item.variant,
      quantity: item.quantity,
      customer: quote.customer,
      discountPolicy: policy,
      discountRules
    });

    await quoteModel.updateQuoteLine(item.id, {
      unitListPrice: result.unitListPrice,
      unitCostPrice: result.costPrice,
      lineTotal: result.lineTotal,
      netTotal: result.netTotal,
      marginPct: result.marginPct,
      productDiscountPct: result.discounts.productDiscountPct,
      bulkDiscountPct: result.discounts.bulkDiscountPct,
      consistencyDiscountPct: result.discounts.consistencyDiscountPct,
      premiumDiscountPct: result.discounts.premiumDiscountPct,
      variantDiscountPct: result.discounts.variantDiscountPct,
      cumulativeDiscountPct: result.discounts.cumulativeDiscountPct,
      ceilingPct: result.governance.ceilingPct,
      isOverLimit: result.governance.isOverLimit,
      overLimitPct: result.governance.overLimitPct
    });

    lineResults.push({ ...result, itemId: item.id, netTotal: result.netTotal, lineCogs: result.lineCogs });
  }

  const risk = calculateQuoteRisk({
    customer: quote.customer,
    lineItems: lineResults,
    approvalRules
  });

  const subtotal = lineResults.reduce((s, r) => s + r.lineTotal, 0);
  const discountTotal = lineResults.reduce((s, r) => s + r.discountAmount, 0);
  const estimatedNetTotal = subtotal - discountTotal;
  const cogs = lineResults.reduce((s, r) => s + r.lineCogs, 0);
  const hasHardwareLines = quote.items.some(i => i.product.productType === ProductType.HARDWARE);
  const hasSoftwareLines = quote.items.some(i => i.product.productType !== ProductType.HARDWARE);

  let newStatus = QuoteStatus.APPROVED;
  const approvalRows = [];

  if (risk.requiresApproval) {
    if (risk.approvalLevel >= 3) {
      newStatus = QuoteStatus.FINANCE_REVIEW;
      approvalRows.push({ id: uuidv4(), quotationId: id, quoteRevision: quote.quoteRevision, stage: ApprovalStage.SALES_MANAGER, level: 2 });
      approvalRows.push({ id: uuidv4(), quotationId: id, quoteRevision: quote.quoteRevision, stage: ApprovalStage.FINANCE_OPS, level: 3 });
    } else if (risk.approvalLevel === 2) {
      newStatus = QuoteStatus.MANAGER_REVIEW;
      approvalRows.push({ id: uuidv4(), quotationId: id, quoteRevision: quote.quoteRevision, stage: ApprovalStage.SALES_MANAGER, level: 2 });
    } else {
      newStatus = QuoteStatus.SALES_REP_REVIEW;
      approvalRows.push({ id: uuidv4(), quotationId: id, quoteRevision: quote.quoteRevision, stage: ApprovalStage.SALES_REP, level: 1 });
    }
  }

  if (approvalRows.length > 0) {
    await quoteModel.createApprovals(approvalRows);
  }

  const updated = await quoteModel.updateQuotation(id, {
    status: newStatus,
    subtotal,
    discountTotal,
    estimatedNetTotal,
    cogs,
    marginPct: Math.max(-100, Math.min(100, risk.overallMarginPct)),
    blendedRiskScore: risk.blendedRiskScore,
    requiresApproval: risk.requiresApproval,
    approvalLevel: risk.approvalLevel,
    approvalReason: risk.approvalReason,
    hasHardwareLines,
    hasSoftwareLines
  });
  return { quote: updated, risk };
}

async function sendToCustomer(id) {
  const quote = await quoteModel.findQuotationById(id);
  if (!quote) return { notFound: true };
  if (quote.status !== QuoteStatus.APPROVED) return { notApproved: true };

  const updated = await quoteModel.updateQuotation(id, { status: QuoteStatus.SENT_TO_CUSTOMER });
  return { quote: updated };
}

async function recalculate(id) {
  const quote = await quoteModel.findQuotationById(id);
  if (!quote) return { notFound: true };
  if (![QuoteStatus.DRAFT, QuoteStatus.RETURNED].includes(quote.status)) return { invalidStatus: true };

  return submitQuote(id);
}

async function getQuoteRisk(id) {
  return quoteModel.findQuotationRisk(id);
}

// ─── Deposits ─────────────────────────────────────────────────────────────────

async function getDeposit(quotationId) {
  return quoteModel.findDeposits(quotationId);
}

async function createDeposit(quotationId, { amount, method }) {
  const quote = await quoteModel.findQuotationById(quotationId);
  if (!quote) return { notFound: true };

  const deposit = await quoteModel.createDeposit({
    id: uuidv4(),
    quotationId,
    customerId: quote.customerId,
    amount,
    method: method || null,
    status: DepositStatus.PENDING
  });
  return { deposit };
}

async function refundDeposit(quotationId) {
  const deposit = await quoteModel.findPaidDeposit(quotationId);
  if (!deposit) return { notFound: true };

  const updated = await quoteModel.updateDeposit(deposit.id, {
    status: DepositStatus.REFUNDED,
    refundedAt: new Date()
  });
  return { deposit: updated };
}

module.exports = {
  listQuotes, createQuote, getQuoteById, updateQuoteDraft,
  submitQuote, sendToCustomer, recalculate, getQuoteRisk,
  getDeposit, createDeposit, refundDeposit, recalcQuoteTotals
};
