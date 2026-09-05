const svc = require('./warehouses.service');
const {
  successResponse, createdResponse, badRequestResponse,
  notFoundResponse, conflictResponse
} = require('../../utils/response');

async function listWarehouses(req, res) {
  return successResponse(res, 'Warehouses fetched', await svc.listWarehouses(req.query));
}

async function createWarehouse(req, res) {
  const { name, region, locationLat, locationLng } = req.body;
  if (!name || !region || locationLat == null || locationLng == null)
    return badRequestResponse(res, 'name, region, locationLat and locationLng are required');

  const result = await svc.createWarehouse(req.body);
  if (result.conflict) return conflictResponse(res, 'Warehouse code already exists');
  return createdResponse(res, 'Warehouse created', result.warehouse);
}

async function getWarehouseById(req, res) {
  const warehouse = await svc.getWarehouseById(req.params.warehouseId);
  if (!warehouse) return notFoundResponse(res, 'Warehouse not found');
  return successResponse(res, 'Warehouse fetched', warehouse);
}

async function updateWarehouse(req, res) {
  try {
    const warehouse = await svc.updateWarehouse(req.params.warehouseId, req.body);
    return successResponse(res, 'Warehouse updated', warehouse);
  } catch { return notFoundResponse(res, 'Warehouse not found'); }
}

async function archiveWarehouse(req, res) {
  try {
    await svc.archiveWarehouse(req.params.warehouseId);
    return successResponse(res, 'Warehouse archived');
  } catch { return notFoundResponse(res, 'Warehouse not found'); }
}

async function getWarehouseInventory(req, res) {
  const warehouse = await svc.getWarehouseById(req.params.warehouseId);
  if (!warehouse) return notFoundResponse(res, 'Warehouse not found');
  const data = await svc.getWarehouseInventory(req.params.warehouseId);
  return successResponse(res, 'Warehouse inventory fetched', data);
}

async function setInventory(req, res) {
  const { normalPoolQty, premiumBulkPoolQty } = req.body;
  if (normalPoolQty == null || premiumBulkPoolQty == null)
    return badRequestResponse(res, 'normalPoolQty and premiumBulkPoolQty are required');

  const data = await svc.setInventory(req.params.warehouseId, req.params.productId, req.body);
  return successResponse(res, 'Inventory set', data);
}

async function adjustInventory(req, res) {
  const result = await svc.adjustInventory(req.params.warehouseId, req.params.productId, req.body);
  if (result.notFound) return notFoundResponse(res, 'Inventory record not found');
  return successResponse(res, 'Inventory adjusted', result);
}

async function listAllInventory(req, res) {
  return successResponse(res, 'Global inventory fetched', await svc.listAllInventory(req.query));
}

async function listRegionDemand(req, res) {
  return successResponse(res, 'Region demand fetched', await svc.listRegionDemand(req.query));
}

async function getRestockRecommendations(req, res) {
  return successResponse(res, 'Restock recommendations fetched', await svc.getRestockRecommendations());
}

module.exports = {
  listWarehouses, createWarehouse, getWarehouseById, updateWarehouse, archiveWarehouse,
  getWarehouseInventory, setInventory, adjustInventory,
  listAllInventory, listRegionDemand, getRestockRecommendations
};
