const { v4: uuidv4 } = require('uuid');
const quoteModel = require('./quotations.model');
const { calculateLineDiscounts } = require('../../utils/discountEngine');
const { CustomerTier, PoolType, QuoteStatus } = require('../../constants');

async function listLines(quotationId) {
  return quoteModel.findQuoteLines(quotationId);
}

async function addLine(quotationId, { productId, variantId, quantity, subscriptionPlanId }) {
  const quote = await quoteModel.findQuotationForSubmit(quotationId);
  if (!quote) return { notFound: true };
  if (![QuoteStatus.DRAFT, QuoteStatus.RETURNED].includes(quote.status)) return { locked: true };

  const [product, variant] = await Promise.all([
    quoteModel.findProductById(productId),
    variantId ? quoteModel.findVariantById(variantId) : Promise.resolve(null)
  ]);
  if (!product) return { productNotFound: true };

  const [discountPolicies, discountRules] = await Promise.all([
    quoteModel.findDiscountPolicies(),
    quoteModel.findDiscountTypeRules()
  ]);

  const policy = discountPolicies.find(
    p => p.customerTier === quote.customer.tier && p.productCategory === product.category
  );

  const result = calculateLineDiscounts({ product, variant, quantity, customer: quote.customer, discountPolicy: policy, discountRules });

  const isPremiumTier = [CustomerTier.PREMIUM, CustomerTier.GOLD, CustomerTier.PLATINUM].includes(quote.customer.tier);
  const poolAssignment = isPremiumTier ? PoolType.PREMIUM_BULK : PoolType.NORMAL;

  const line = await quoteModel.createQuoteLine({
    id: uuidv4(), quotationId, productId, variantId,
    quantity: result.quantity,
    unitPrice: result.unitListPrice,
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
    overLimitPct: result.governance.overLimitPct,
    isRecurring: product.isRecurring,
    subscriptionPlanId: subscriptionPlanId || null,
    poolAssignment
  });

  // Recalculate quote totals
  await recalcQuoteTotals(quotationId);

  return { line };
}

async function updateLine(quotationId, lineId, { quantity, variantId }) {
  const quote = await quoteModel.findQuotationForSubmit(quotationId);
  if (!quote) return { notFound: true };

  // Any change on approved quote invalidates approvals
  if (![QuoteStatus.DRAFT, QuoteStatus.RETURNED].includes(quote.status)) {
    await quoteModel.invalidatePendingApprovals(quotationId);
    await quoteModel.updateQuotation(quotationId, {
      status: QuoteStatus.DRAFT,
      quoteRevision: { increment: 1 }
    });
  }

  const line = await quoteModel.findQuoteLineById(lineId);
  if (!line) return { lineNotFound: true };

  const variant = variantId ? await quoteModel.findVariantById(variantId) : null;
  const [discountPolicies, discountRules] = await Promise.all([
    quoteModel.findDiscountPolicies(),
    quoteModel.findDiscountTypeRules()
  ]);

  const policy = discountPolicies.find(
    p => p.customerTier === quote.customer.tier && p.productCategory === line.product.category
  );

  const result = calculateLineDiscounts({
    product: line.product,
    variant: variant || (line.variantId ? await quoteModel.findVariantById(line.variantId) : null),
    quantity: quantity || line.quantity,
    customer: quote.customer,
    discountPolicy: policy,
    discountRules
  });

  const updated = await quoteModel.updateQuoteLine(lineId, {
    quantity: result.quantity,
    variantId: variantId !== undefined ? variantId : line.variantId,
    lineTotal: result.lineTotal,
    netTotal: result.netTotal,
    marginPct: result.marginPct,
    bulkDiscountPct: result.discounts.bulkDiscountPct,
    cumulativeDiscountPct: result.discounts.cumulativeDiscountPct,
    ceilingPct: result.governance.ceilingPct,
    isOverLimit: result.governance.isOverLimit,
    overLimitPct: result.governance.overLimitPct
  });

  await recalcQuoteTotals(quotationId);
  return { line: updated };
}

async function deleteLine(quotationId, lineId) {
  const quote = await quoteModel.findQuotationById(quotationId);
  if (!quote) return { notFound: true };
  if (![QuoteStatus.DRAFT, QuoteStatus.RETURNED].includes(quote.status)) return { locked: true };

  await quoteModel.deleteQuoteLine(lineId);
  await recalcQuoteTotals(quotationId);
  return { success: true };
}

async function getDiscountBreakdown(lineId) {
  return quoteModel.findLineDiscountBreakdown(lineId);
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
    subtotal, discountTotal, estimatedNetTotal, cogs,
    marginPct: Math.max(-100, Math.min(100, marginPct)),
    hasHardwareLines, hasSoftwareLines
  });
}

async function listLineComments(lineId) {
  return quoteModel.findLineComments(lineId);
}

async function addLineComment(lineId, authorId, content) {
  return quoteModel.createLineComment({
    id: uuidv4(),
    quoteLineId: lineId,
    authorId,
    content
  });
}

module.exports = {
  listLines, addLine, updateLine, deleteLine, getDiscountBreakdown,
  listLineComments, addLineComment
};
