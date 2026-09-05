const prisma = require('../../config/db');

const WH_SELECT = {
  id: true, code: true, name: true, region: true, location: true,
  locationLat: true, locationLng: true, shippingCostFactor: true,
  isActive: true, createdAt: true, updatedAt: true
};

// ─── Warehouses ───────────────────────────────────────────────────────────────

async function findWarehouses({ where, skip, take }) {
  return prisma.warehouse.findMany({
    where,
    skip,
    take,
    select: WH_SELECT
  });
}

async function countWarehouses(where) {
  return prisma.warehouse.count({ where });
}

async function findWarehouseByCode(code) {
  return prisma.warehouse.findFirst({ where: { code } });
}

async function createWarehouse(data) {
  return prisma.warehouse.create({
    data,
    select: WH_SELECT
  });
}

async function findWarehouseById(id) {
  return prisma.warehouse.findUnique({ where: { id }, select: WH_SELECT });
}

async function updateWarehouse(id, data) {
  return prisma.warehouse.update({ where: { id }, data, select: WH_SELECT });
}

// ─── Inventory ────────────────────────────────────────────────────────────────

async function findWarehouseInventory(warehouseId) {
  return prisma.inventory.findMany({
    where: { warehouseId },
    include: { product: { select: { id: true, name: true, category: true, productType: true } } }
  });
}

async function findInventory(warehouseId, productId) {
  return prisma.inventory.findFirst({ where: { warehouseId, productId } });
}

async function updateInventory(id, data) {
  return prisma.inventory.update({ where: { id }, data });
}

async function createInventory(data) {
  return prisma.inventory.create({ data });
}

async function findAllInventory({ where, skip, take }) {
  return prisma.inventory.findMany({
    where,
    skip,
    take,
    include: {
      warehouse: { select: { id: true, name: true, region: true } },
      product: { select: { id: true, name: true, category: true, productType: true } }
    }
  });
}

async function countAllInventory(where) {
  return prisma.inventory.count({ where });
}

async function findRegionDemand(where) {
  return prisma.regionDemandRecord.findMany({
    where,
    include: { product: { select: { id: true, name: true } } },
    orderBy: { periodStart: 'desc' },
    take: 100
  });
}

async function findAllInventoryWithProducts() {
  return prisma.inventory.findMany({
    include: {
      warehouse: { select: { id: true, name: true, region: true } },
      product: { select: { id: true, name: true, category: true } }
    }
  });
}

module.exports = {
  WH_SELECT,
  findWarehouses,
  countWarehouses,
  findWarehouseByCode,
  createWarehouse,
  findWarehouseById,
  updateWarehouse,
  findWarehouseInventory,
  findInventory,
  updateInventory,
  createInventory,
  findAllInventory,
  countAllInventory,
  findRegionDemand,
  findAllInventoryWithProducts
};
