const express = require('express');
const router = express.Router();
const ctrl = require('./products.controller');
const authenticate = require('../../middleware/auth.middleware');
const authorize = require('../../middleware/role.middleware');
const { RoleGroups } = require('../../constants');

router.get('/', authenticate, authorize(RoleGroups.MANAGERS), ctrl.listPriceLists);
router.post('/', authenticate, authorize(RoleGroups.ADMIN_ONLY), ctrl.createPriceList);
router.get('/:priceListId', authenticate, authorize(RoleGroups.MANAGERS), ctrl.getPriceListById);
router.patch('/:priceListId', authenticate, authorize(RoleGroups.ADMIN_ONLY), ctrl.updatePriceList);
router.delete('/:priceListId', authenticate, authorize(RoleGroups.ADMIN_ONLY), ctrl.deletePriceList);

module.exports = router;
