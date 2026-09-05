const { v4: uuidv4 } = require('uuid');
const whModel = require('./warehouses.model');
const { Defaults } = require('../../constants');

// ─── Warehouses ───────────────────────────────────────────────────────────────

async function listWarehouses({ page = Defaults.PAGE, pageSize = Defaults.PAGE_SIZE, region, isActive }) {
  const skip = (page - 1) * pageSize;
  const where = {};
  if (region) where.region = { contains: region };
  if (isActive !== undefined) where.isActive = isActive === 'true' || isActive === true;

  const [items, total] = await Promise.all([
    whModel.findWarehouses({ where, skip, take: Number(pageSize) }),
    whModel.countWarehouses(where)
  ]);
  return { items, total, page: Number(page), pageSize: Number(pageSize), totalPages: Math.ceil(total / pageSize) };
}

async function createWarehouse({ code, name, region, location, locationLat, locationLng, shippingCostFactor }) {
  if (code) {
    const existing = await whModel.findWarehouseByCode(code);
    if (existing) return { conflict: true };
  }

  const warehouse = await whModel.createWarehouse({
    id: uuidv4(),
    code,
    name,
    region,
    location,
    locationLat: Number(locationLat),
    locationLng: Number(locationLng),
    shippingCostFactor: shippingCostFactor || 1.0
  });
  return { warehouse };
}

async function getWarehouseById(id) {
  return whModel.findWarehouseById(id);
}

async function updateWarehouse(id, fields) {
  const data = {};
  const allowed = ['code', 'name', 'region', 'location', 'locationLat', 'locationLng', 'shippingCostFactor'];
  for (const key of allowed) {
    if (fields[key] !== undefined) data[key] = fields[key];
  }
  return whModel.updateWarehouse(id, data);
}

async function archiveWarehouse(id) {
  await whModel.updateWarehouse(id, { isActive: false });
}

// ─── Inventory ────────────────────────────────────────────────────────────────

async function getWarehouseInventory(warehouseId) {
  return whModel.findWarehouseInventory(warehouseId);
}

async function setInventory(warehouseId, productId, { normalPoolQty, premiumBulkPoolQty }) {
  const existing = await whModel.findInventory(warehouseId, productId);

  if (existing) {
    return whModel.updateInventory(existing.id, {
      normalPoolQty: Number(normalPoolQty),
      premiumBulkPoolQty: Number(premiumBulkPoolQty)
    });
  }

  return whModel.createInventory({
    id: uuidv4(),
    warehouseId,
    productId,
    normalPoolQty: Number(normalPoolQty || 0),
    premiumBulkPoolQty: Number(premiumBulkPoolQty || 0)
  });
}

async function adjustInventory(warehouseId, productId, { normalDelta, premiumDelta }) {
  const existing = await whModel.findInventory(warehouseId, productId);
  if (!existing) return { notFound: true };

  return whModel.updateInventory(existing.id, {
    normalPoolQty: { increment: Number(normalDelta || 0) },
    premiumBulkPoolQty: { increment: Number(premiumDelta || 0) }
  });
}

async function listAllInventory({ page = Defaults.PAGE, pageSize = 50, warehouseId, productId, region }) {
  const skip = (page - 1) * pageSize;
  const where = {};
  if (warehouseId) where.warehouseId = warehouseId;
  if (productId) where.productId = productId;
  if (region) where.warehouse = { region: { contains: region } };

  const [items, total] = await Promise.all([
    whModel.findAllInventory({ where, skip, take: Number(pageSize) }),
    whModel.countAllInventory(where)
  ]);
  return { items, total, page: Number(page), pageSize: Number(pageSize), totalPages: Math.ceil(total / pageSize) };
}

async function listRegionDemand({ region, productId }) {
  const where = {};
  if (region) where.region = region;
  if (productId) where.productId = productId;
  return whModel.findRegionDemand(where);
}

async function getRestockRecommendations() {
  const inventories = await whModel.findAllInventoryWithProducts();

  return inventories
    .filter(inv => {
      const availNormal = Math.max(0, inv.normalPoolQty - inv.reservedNormal);
      const availPremium = Math.max(0, inv.premiumBulkPoolQty - inv.reservedPremium);
      return availNormal < 10 || availPremium < 5;
    })
    .map(inv => ({
      warehouseId: inv.warehouseId,
      warehouseName: inv.warehouse.name,
      region: inv.warehouse.region,
      productId: inv.productId,
      productName: inv.product.name,
      availableNormal: Math.max(0, inv.normalPoolQty - inv.reservedNormal),
      availablePremiumBulk: Math.max(0, inv.premiumBulkPoolQty - inv.reservedPremium),
      recommendation: 'Restock recommended'
    }));
}

module.exports = {
  listWarehouses, createWarehouse, getWarehouseById, updateWarehouse, archiveWarehouse,
  getWarehouseInventory, setInventory, adjustInventory,
  listAllInventory, listRegionDemand, getRestockRecommendations
};
