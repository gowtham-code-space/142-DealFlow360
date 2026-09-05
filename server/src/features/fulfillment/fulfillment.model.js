const prisma = require('../../config/db');

// ─── Quotation & Inventory Queries ───────────────────────────────────────────

async function findQuotationForAllocation(id) {
  return prisma.quotation.findUnique({
    where: { id },
    include: {
      customer: true,
      items: { include: { product: true } }
    }
  });
}

async function findActiveWarehousesWithStock(productId) {
  return prisma.warehouse.findMany({
    where: { isActive: true },
    include: {
      inventories: {
        where: { productId },
        take: 1
      }
    }
  });
}

async function findInventory(warehouseId, productId) {
  return prisma.inventory.findFirst({
    where: { warehouseId, productId }
  });
}

async function createAllocation(data) {
  return prisma.allocation.create({ data });
}

async function reserveInventory(inventoryId, poolType, quantity) {
  if (poolType === 'PREMIUM_BULK') {
    return prisma.inventory.update({
      where: { id: inventoryId },
      data: { reservedPremium: { increment: quantity } }
    });
  }
  return prisma.inventory.update({
    where: { id: inventoryId },
    data: { reservedNormal: { increment: quantity } }
  });
}

async function updateQuotationStatus(id, status) {
  return prisma.quotation.update({
    where: { id },
    data: { status }
  });
}

async function deleteProposedAllocations(quotationId) {
  return prisma.allocation.deleteMany({
    where: { quotationId, status: { in: ['PROPOSED', 'ACCEPTED'] } }
  });
}

async function findAllocationsByQuotation(quotationId) {
  return prisma.allocation.findMany({
    where: { quotationId },
    include: {
      warehouse: { select: { id: true, name: true, region: true } },
      product: { select: { id: true, name: true } }
    }
  });
}

// ─── Backorders Queries ───────────────────────────────────────────────────────

async function findBackorders({ where, skip, take }) {
  return prisma.backorder.findMany({
    where,
    skip,
    take,
    include: {
      quotation: { select: { id: true, quotationNumber: true } },
      product: { select: { id: true, name: true } },
      warehouse: { select: { id: true, name: true } }
    },
    orderBy: { createdAt: 'desc' }
  });
}

async function countBackorders(where) {
  return prisma.backorder.count({ where });
}

async function createBackorder(data) {
  return prisma.backorder.create({ data });
}

async function findBackorderById(id) {
  return prisma.backorder.findUnique({
    where: { id },
    include: {
      product: { select: { id: true, name: true } },
      warehouse: { select: { id: true, name: true } }
    }
  });
}

async function updateBackorder(id, data) {
  return prisma.backorder.update({ where: { id }, data });
}

module.exports = {
  findQuotationForAllocation,
  findActiveWarehousesWithStock,
  findInventory,
  createAllocation,
  reserveInventory,
  updateQuotationStatus,
  deleteProposedAllocations,
  findAllocationsByQuotation,
  findBackorders,
  countBackorders,
  createBackorder,
  findBackorderById,
  updateBackorder
};
