const svc = require('./products.service');
const {
  successResponse, createdResponse, badRequestResponse,
  notFoundResponse, conflictResponse
} = require('../../utils/response');

// ─── Products ─────────────────────────────────────────────────────────────────

async function listProducts(req, res) {
  const data = await svc.listProducts(req.query);
  return successResponse(res, 'Products fetched', data);
}

async function createProduct(req, res) {
  if (!req.body.name || !req.body.category) return badRequestResponse(res, 'name and category are required');
  const result = await svc.createProduct(req.body);
  if (result.conflict) return conflictResponse(res, 'A product with this name already exists');
  return createdResponse(res, 'Product created', result.product);
}

async function getProductById(req, res) {
  const product = await svc.getProductById(req.params.productId);
  if (!product) return notFoundResponse(res, 'Product not found');
  return successResponse(res, 'Product fetched', product);
}

async function updateProduct(req, res) {
  try {
    const product = await svc.updateProduct(req.params.productId, req.body);
    return successResponse(res, 'Product updated', product);
  } catch {
    return notFoundResponse(res, 'Product not found');
  }
}

async function archiveProduct(req, res) {
  const product = await svc.getProductById(req.params.productId);
  if (!product) return notFoundResponse(res, 'Product not found');
  const result = await svc.archiveProduct(req.params.productId);
  if (result.inUse) return conflictResponse(res, 'Product is used in active quotes and cannot be archived');
  return successResponse(res, 'Product archived');
}

// ─── Variants ─────────────────────────────────────────────────────────────────

async function listVariants(req, res) {
  const product = await svc.getProductById(req.params.productId);
  if (!product) return notFoundResponse(res, 'Product not found');
  const data = await svc.listVariants(req.params.productId);
  return successResponse(res, 'Variants fetched', data);
}

async function createVariant(req, res) {
  const { attribute, value } = req.body;
  if (!attribute || !value) return badRequestResponse(res, 'attribute and value are required');
  const product = await svc.getProductById(req.params.productId);
  if (!product) return notFoundResponse(res, 'Product not found');
  const variant = await svc.createVariant(req.params.productId, req.body);
  return createdResponse(res, 'Variant created', variant);
}

async function updateVariant(req, res) {
  try {
    const variant = await svc.updateVariant(req.params.variantId, req.body);
    return successResponse(res, 'Variant updated', variant);
  } catch {
    return notFoundResponse(res, 'Variant not found');
  }
}

async function deleteVariant(req, res) {
  try {
    await svc.deleteVariant(req.params.variantId);
    return successResponse(res, 'Variant deleted');
  } catch {
    return notFoundResponse(res, 'Variant not found');
  }
}

// ─── Price Lists ───────────────────────────────────────────────────────────────

async function listPriceLists(req, res) {
  const data = await svc.listPriceLists();
  return successResponse(res, 'Price lists fetched', data);
}

async function createPriceList(req, res) {
  if (!req.body.name) return badRequestResponse(res, 'name is required');
  const result = await svc.createPriceList(req.body);
  if (result.conflict) return conflictResponse(res, 'Price list for this tier+currency already exists');
  return createdResponse(res, 'Price list created', result.priceList);
}

async function getPriceListById(req, res) {
  const pl = await svc.getPriceListById(req.params.priceListId);
  if (!pl) return notFoundResponse(res, 'Price list not found');
  return successResponse(res, 'Price list fetched', pl);
}

async function updatePriceList(req, res) {
  try {
    const pl = await svc.updatePriceList(req.params.priceListId, req.body);
    return successResponse(res, 'Price list updated', pl);
  } catch {
    return notFoundResponse(res, 'Price list not found');
  }
}

async function deletePriceList(req, res) {
  try {
    await svc.deletePriceList(req.params.priceListId);
    return successResponse(res, 'Price list deleted');
  } catch {
    return notFoundResponse(res, 'Price list not found');
  }
}

module.exports = {
  listProducts, createProduct, getProductById, updateProduct, archiveProduct,
  listVariants, createVariant, updateVariant, deleteVariant,
  listPriceLists, createPriceList, getPriceListById, updatePriceList, deletePriceList
};
