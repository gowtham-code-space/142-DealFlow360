const { v4: uuidv4 } = require('uuid');
const productModel = require('./products.model');
const { ProductType, CustomerTier, Defaults } = require('../../constants');

// ─── Products ─────────────────────────────────────────────────────────────────

async function listProducts({ page = Defaults.PAGE, pageSize = Defaults.PAGE_SIZE, productType, category, isActive, search }) {
  const skip = (page - 1) * pageSize;
  const where = {};
  if (productType) where.productType = productType.toUpperCase();
  if (category) where.category = { contains: category };
  if (isActive !== undefined) where.isActive = isActive === 'true' || isActive === true;
  if (search) where.name = { contains: search };

  const [items, total] = await Promise.all([
    productModel.findProducts({ where, skip, take: Number(pageSize) }),
    productModel.countProducts(where)
  ]);
  return { items, total, page: Number(page), pageSize: Number(pageSize), totalPages: Math.ceil(total / pageSize) };
}

async function createProduct(body) {
  const { name, category, productType, listPrice, cost, tax, productDiscountPct, minMargin, weight, isRecurring, isUpsell, sku, description } = body;

  const existing = await productModel.findProductByName(name);
  if (existing) return { conflict: true };

  const product = await productModel.createProduct({
    id: uuidv4(),
    sku,
    name,
    description,
    category,
    productType: productType?.toUpperCase() || ProductType.HARDWARE,
    listPrice: listPrice || 0,
    cost: cost || 0,
    tax: tax ?? Defaults.TAX_PCT,
    productDiscountPct: productDiscountPct || 0,
    minMargin: minMargin ?? Defaults.MIN_MARGIN_PCT,
    weight,
    isRecurring: !!isRecurring,
    isUpsell: !!isUpsell
  });
  return { product };
}

async function getProductById(id) {
  return productModel.findProductById(id);
}

async function updateProduct(id, fields) {
  const data = {};
  const allowed = ['name', 'category', 'listPrice', 'cost', 'tax', 'weight', 'productDiscountPct', 'isActive'];
  for (const key of allowed) {
    if (fields[key] !== undefined) data[key] = fields[key];
  }
  return productModel.updateProduct(id, data);
}

async function archiveProduct(id) {
  const active = await productModel.findActiveQuotationItemForProduct(id);
  if (active) return { inUse: true };

  await productModel.updateProduct(id, { isActive: false });
  return { success: true };
}

// ─── Variants ─────────────────────────────────────────────────────────────────

async function listVariants(productId) {
  return productModel.findVariantsByProductId(productId);
}

async function createVariant(productId, body) {
  const { attribute, value, extraPrice, variantDiscountPct } = body;
  return productModel.createVariant({
    id: uuidv4(),
    productId,
    attribute,
    value,
    extraPrice: extraPrice || 0,
    variantDiscountPct: variantDiscountPct || 0
  });
}

async function updateVariant(variantId, body) {
  const data = {};
  if (body.attribute !== undefined) data.attribute = body.attribute;
  if (body.value !== undefined) data.value = body.value;
  if (body.extraPrice !== undefined) data.extraPrice = body.extraPrice;
  if (body.variantDiscountPct !== undefined) data.variantDiscountPct = body.variantDiscountPct;
  return productModel.updateVariant(variantId, data);
}

async function deleteVariant(variantId) {
  await productModel.deleteVariant(variantId);
}

// ─── Price Lists ───────────────────────────────────────────────────────────────

async function listPriceLists() {
  return productModel.findPriceLists();
}

async function createPriceList(body) {
  const { name, tier, currency, rules = [] } = body;
  const existing = await productModel.findPriceListByTierCurrency(tier?.toUpperCase() || CustomerTier.STANDARD, currency || Defaults.CURRENCY);
  if (existing) return { conflict: true };

  const pl = await productModel.createPriceList({
    id: uuidv4(),
    name,
    tier: tier?.toUpperCase() || CustomerTier.STANDARD,
    currency: currency || Defaults.CURRENCY,
    rules: { create: rules.map(r => ({ id: uuidv4(), productId: r.productId, price: r.price })) }
  });
  return { priceList: pl };
}

async function getPriceListById(id) {
  return productModel.findPriceListById(id);
}

async function updatePriceList(id, body) {
  const data = {};
  if (body.name !== undefined) data.name = body.name;
  if (body.currency !== undefined) data.currency = body.currency;

  const pl = await productModel.updatePriceList(id, data);

  if (Array.isArray(body.rules)) {
    await productModel.replacePriceListRules(
      id,
      body.rules.map(r => ({ id: uuidv4(), priceListId: id, productId: r.productId, price: r.price }))
    );
  }
  return productModel.findPriceListById(id);
}

async function deletePriceList(id) {
  await productModel.deletePriceList(id);
}

module.exports = {
  listProducts, createProduct, getProductById, updateProduct, archiveProduct,
  listVariants, createVariant, updateVariant, deleteVariant,
  listPriceLists, createPriceList, getPriceListById, updatePriceList, deletePriceList
};
