const { v4: uuidv4 } = require('uuid');
const fulfillmentModel = require('./fulfillment.model');
const { allocateHardwareInventory } = require('../../utils/allocationEngine');
const { AllocationStatus, BackorderStatus, PoolType, ProductType, QuoteStatus, Defaults } = require('../../constants');

// ─── Allocation ───────────────────────────────────────────────────────────────

async function getAllocation(quotationId) {
  const quote = await fulfillmentModel.findQuotationForAllocation(quotationId);
  if (!quote) return { notFound: true };

  const hardwareItems = quote.items.filter(i => i.product.productType === ProductType.HARDWARE);
  const results = [];

  for (const item of hardwareItems) {
    const poolType = item.poolAssignment;
    const warehouses = await fulfillmentModel.findActiveWarehousesWithStock(item.productId);

    const warehousesWithStock = warehouses
      .map(wh => ({
        ...wh,
        availableNormal: Math.max(0, (wh.inventories[0]?.normalPoolQty || 0) - (wh.inventories[0]?.reservedNormal || 0)),
        availablePremiumBulk: Math.max(0, (wh.inventories[0]?.premiumBulkPoolQty || 0) - (wh.inventories[0]?.reservedPremium || 0))
      }))
      .filter(wh => poolType === PoolType.PREMIUM_BULK ? wh.availablePremiumBulk > 0 : wh.availableNormal > 0);

    const result = allocateHardwareInventory({
      requestedQuantity: item.quantity,
      poolType,
      customerLocation: { lat: Number(quote.customer.locationLat || 0), lng: Number(quote.customer.locationLng || 0) },
      warehousesWithStock
    });

    results.push({ lineId: item.id, productId: item.productId, productName: item.product.name, ...result });
  }

  return results;
}

async function acceptAllocation(quotationId, allocations) {
  for (const alloc of allocations) {
    const inventory = await fulfillmentModel.findInventory(alloc.warehouseId, alloc.productId);
    if (!inventory) continue;

    await fulfillmentModel.createAllocation({
      id: uuidv4(),
      quotationId,
      warehouseId: alloc.warehouseId,
      productId: alloc.productId,
      quantity: alloc.quantity,
      poolType: alloc.poolType || PoolType.NORMAL,
      distanceKm: alloc.distanceKm || 0,
      shippingCost: alloc.shippingCost || 0,
      status: AllocationStatus.ACCEPTED
    });

    // Reserve inventory
    await fulfillmentModel.reserveInventory(inventory.id, alloc.poolType, alloc.quantity);
  }

  await fulfillmentModel.updateQuotationStatus(quotationId, QuoteStatus.FULFILLING);
  return { success: true };
}

async function overrideAllocation(quotationId, overrides) {
  const quote = await fulfillmentModel.findQuotationForAllocation(quotationId);
  if (!quote) return { notFound: true };

  const productQtyMap = {};
  for (const item of quote.items.filter(i => i.product.productType === ProductType.HARDWARE)) {
    productQtyMap[item.productId] = (productQtyMap[item.productId] || 0) + item.quantity;
  }

  const overrideQtyMap = {};
  for (const o of overrides) {
    overrideQtyMap[o.productId] = (overrideQtyMap[o.productId] || 0) + Number(o.quantity);
  }

  for (const [productId, reqQty] of Object.entries(productQtyMap)) {
    const sumOverride = overrideQtyMap[productId] || 0;
    if (sumOverride !== reqQty) {
      return {
        qtyMismatch: true,
        productId,
        requestedQty: reqQty,
        overriddenQty: sumOverride,
        message: `Sum of override quantities (${sumOverride}) does not match requested quantity (${reqQty}) for product ${productId}`
      };
    }
  }

  // Clear existing allocations
  await fulfillmentModel.deleteAllocationsByQuoteId(quotationId);

  for (const override of overrides) {
    await fulfillmentModel.createAllocation({
      id: uuidv4(),
      quotationId,
      warehouseId: override.warehouseId,
      productId: override.productId,
      quantity: override.quantity,
      poolType: override.poolType || PoolType.NORMAL,
      distanceKm: override.distanceKm || 0,
      shippingCost: override.shippingCost || 0,
      status: AllocationStatus.OVERRIDDEN
    });
  }

  return { success: true };
}

async function listAllocations(quotationId) {
  return fulfillmentModel.findAllocationsByQuoteId(quotationId);
}

// ─── Backorders ───────────────────────────────────────────────────────────────

async function listBackorders({ page = Defaults.PAGE, pageSize = Defaults.PAGE_SIZE, status, productId, warehouseId }) {
  const skip = (page - 1) * pageSize;
  const where = {};
  if (status) where.status = status.toUpperCase();
  if (productId) where.productId = productId;
  if (warehouseId) where.warehouseId = warehouseId;

  const [items, total] = await Promise.all([
    fulfillmentModel.findBackorders({ where, skip, take: Number(pageSize) }),
    fulfillmentModel.countBackorders(where)
  ]);
  return { items, total, page: Number(page), pageSize: Number(pageSize), totalPages: Math.ceil(total / pageSize) };
}

async function createBackorder({ quotationId, productId, warehouseId, quantityUnfulfilled, expectedDate, notes }) {
  const backorder = await fulfillmentModel.createBackorder({
    id: uuidv4(),
    quotationId,
    productId,
    warehouseId: warehouseId || null,
    quantityUnfulfilled,
    expectedDate: expectedDate ? new Date(expectedDate) : null,
    notes,
    status: BackorderStatus.CREATED
  });
  return backorder;
}

async function getBackorderById(id) {
  return fulfillmentModel.findBackorderById(id);
}

async function fulfillBackorder(id, { quantityFulfilled }) {
  const backorder = await fulfillmentModel.findBackorderById(id);
  if (!backorder) return { notFound: true };
  if (backorder.status === BackorderStatus.FULFILLED) return { alreadyFulfilled: true };

  const unfulfilled = backorder.quantityUnfulfilled - Number(quantityFulfilled);
  const newStatus = unfulfilled <= 0 ? BackorderStatus.FULFILLED : BackorderStatus.CREATED;

  const updated = await fulfillmentModel.updateBackorder(id, {
    quantityUnfulfilled: Math.max(0, unfulfilled),
    status: newStatus
  });
  return updated;
}

async function cancelBackorder(id, { reason }) {
  const backorder = await fulfillmentModel.findBackorderById(id);
  if (!backorder) return { notFound: true };
  if (backorder.status === BackorderStatus.FULFILLED) return { alreadyFulfilled: true };

  const updated = await fulfillmentModel.updateBackorder(id, {
    status: BackorderStatus.CANCELLED,
    notes: reason ? `${backorder.notes || ''} [Cancelled: ${reason}]` : backorder.notes
  });
  return updated;
}

module.exports = {
  getAllocation, acceptAllocation, overrideAllocation, listAllocations,
  listBackorders, createBackorder, getBackorderById, fulfillBackorder, cancelBackorder
};
