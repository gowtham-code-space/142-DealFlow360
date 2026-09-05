const recModel = require('./recommendations.model');
const quoteLinesSvc = require('../quotations/quotelines.service');
const { QuoteStatus } = require('../../constants');

async function getRecommendations(quoteId) {
  const quote = await recModel.findQuotationWithItems(quoteId);
  if (!quote) return { notFound: true };

  const currentProductIds = quote.items.map(i => i.productId);

  // Find upsell rules for products currently on the quote
  const upsellRules = await recModel.findUpsellRulesForProducts(currentProductIds);

  // Filter out products already on the quote and filter by margin
  const recommendations = [];
  const seenProductIds = new Set(currentProductIds);

  for (const rule of upsellRules) {
    if (!seenProductIds.has(rule.suggestedProductId) && rule.suggestedProduct.isActive) {
      seenProductIds.add(rule.suggestedProductId);
      recommendations.push({
        productId: rule.suggestedProductId,
        productName: rule.suggestedProduct.name,
        category: rule.suggestedProduct.category,
        productType: rule.suggestedProduct.productType,
        listPrice: rule.suggestedProduct.listPrice,
        reason: rule.reason,
        isPromotion: rule.isPromotion,
        minMarginPct: rule.minMarginPct,
        suggestedMarginPct: rule.suggestedProduct.minMargin
      });
    }
  }

  return recommendations;
}

async function addRecommendedProduct(quoteId, productId) {
  const quote = await recModel.findQuotationById(quoteId);
  if (!quote) return { notFound: true };
  if (quote.status !== QuoteStatus.DRAFT && quote.status !== QuoteStatus.RETURNED) {
    return { notEditable: true };
  }

  const result = await quoteLinesSvc.addLine(quoteId, { productId, quantity: 1 });
  return result;
}

async function dismissRecommendation(quoteId, productId) {
  return { dismissed: true, quoteId, productId };
}

module.exports = {
  getRecommendations, addRecommendedProduct, dismissRecommendation
};
