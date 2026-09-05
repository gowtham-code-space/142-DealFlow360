const prisma = require('../../config/db');

async function findQuotationWithItems(quoteId) {
  return prisma.quotation.findUnique({
    where: { id: quoteId },
    include: { items: { include: { product: true } } }
  });
}

async function findUpsellRulesForProducts(productIds) {
  return prisma.upsellRule.findMany({
    where: {
      sourceProductId: { in: productIds },
      isActive: true
    },
    include: { suggestedProduct: true }
  });
}

async function findQuotationById(id) {
  return prisma.quotation.findUnique({ where: { id } });
}

module.exports = {
  findQuotationWithItems,
  findUpsellRulesForProducts,
  findQuotationById
};
