const prisma = require('../../config/db');

const PRODUCT_SELECT = {
  id: true, sku: true, name: true, description: true, category: true,
  productType: true, listPrice: true, cost: true, tax: true,
  productDiscountPct: true, minMargin: true, weight: true,
  isRecurring: true, isUpsell: true, isActive: true,
  createdAt: true, updatedAt: true
};

// ─── Products Queries ─────────────────────────────────────────────────────────

async function findProducts({ where, skip, take }) {
  return prisma.product.findMany({
    where,
    skip,
    take,
    select: PRODUCT_SELECT,
    orderBy: { createdAt: 'desc' }
  });
}

async function countProducts(where) {
  return prisma.product.count({ where });
}

async function findProductByName(name) {
  return prisma.product.findFirst({ where: { name } });
}

async function findProductById(id) {
  return prisma.product.findUnique({ where: { id }, select: PRODUCT_SELECT });
}

async function createProduct(data) {
  return prisma.product.create({
    data,
    select: PRODUCT_SELECT
  });
}

async function updateProduct(id, data) {
  return prisma.product.update({
    where: { id },
    data,
    select: PRODUCT_SELECT
  });
}

async function findActiveQuotationItemForProduct(productId) {
  return prisma.quotationItem.findFirst({
    where: {
      productId,
      quotation: { status: { notIn: ['CANCELLED', 'REJECTED', 'FULFILLED', 'PAID'] } }
    }
  });
}

// ─── Variants Queries ─────────────────────────────────────────────────────────

async function findVariantsByProductId(productId) {
  return prisma.productVariant.findMany({ where: { productId } });
}

async function createVariant(data) {
  return prisma.productVariant.create({ data });
}

async function updateVariant(id, data) {
  return prisma.productVariant.update({ where: { id }, data });
}

async function deleteVariant(id) {
  return prisma.productVariant.delete({ where: { id } });
}

// ─── Price Lists Queries ──────────────────────────────────────────────────────

async function findPriceLists() {
  return prisma.priceList.findMany({
    include: { rules: { include: { product: { select: { id: true, name: true } } } } }
  });
}

async function findPriceListByTierCurrency(tier, currency) {
  return prisma.priceList.findFirst({ where: { tier, currency } });
}

async function createPriceList(data) {
  return prisma.priceList.create({
    data,
    include: { rules: true }
  });
}

async function findPriceListById(id) {
  return prisma.priceList.findUnique({ where: { id }, include: { rules: true } });
}

async function updatePriceList(id, data) {
  return prisma.priceList.update({ where: { id }, data });
}

async function replacePriceListRules(priceListId, rules) {
  await prisma.priceListRule.deleteMany({ where: { priceListId } });
  if (rules.length > 0) {
    await prisma.priceListRule.createMany({ data: rules });
  }
}

async function deletePriceList(id) {
  return prisma.priceList.delete({ where: { id } });
}

module.exports = {
  PRODUCT_SELECT,
  findProducts,
  countProducts,
  findProductByName,
  findProductById,
  createProduct,
  updateProduct,
  findActiveQuotationItemForProduct,
  findVariantsByProductId,
  createVariant,
  updateVariant,
  deleteVariant,
  findPriceLists,
  findPriceListByTierCurrency,
  createPriceList,
  findPriceListById,
  updatePriceList,
  replacePriceListRules,
  deletePriceList
};
