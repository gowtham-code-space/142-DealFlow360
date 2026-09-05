const express = require('express');
const router = express.Router();
const ctrl = require('./warehouses.controller');
const authenticate = require('../../middleware/auth.middleware');
const authorize = require('../../middleware/role.middleware');
const { RoleGroups } = require('../../constants');

// Warehouses
router.get('/', authenticate, authorize(RoleGroups.INTERNAL), ctrl.listWarehouses);
router.post('/', authenticate, authorize(RoleGroups.ADMIN_ONLY), ctrl.createWarehouse);
router.get('/:warehouseId', authenticate, authorize(RoleGroups.INTERNAL), ctrl.getWarehouseById);
router.patch('/:warehouseId', authenticate, authorize(RoleGroups.MANAGERS), ctrl.updateWarehouse);
router.delete('/:warehouseId', authenticate, authorize(RoleGroups.ADMIN_ONLY), ctrl.archiveWarehouse);

// Per-warehouse inventory
router.get('/:warehouseId/inventory', authenticate, authorize(RoleGroups.INTERNAL), ctrl.getWarehouseInventory);
router.put('/:warehouseId/inventory/:productId', authenticate, authorize(RoleGroups.MANAGERS), ctrl.setInventory);
router.patch('/:warehouseId/inventory/:productId', authenticate, authorize(RoleGroups.MANAGERS), ctrl.adjustInventory);

module.exports = router;
