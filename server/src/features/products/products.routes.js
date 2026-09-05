const express = require('express');
const router = express.Router();
const ctrl = require('./products.controller');
const authenticate = require('../../middleware/auth.middleware');
const authorize = require('../../middleware/role.middleware');
const { RoleGroups } = require('../../constants');

// Products
router.get('/', authenticate, authorize(RoleGroups.SALES), ctrl.listProducts);
router.post('/', authenticate, authorize(RoleGroups.MANAGERS), ctrl.createProduct);
router.get('/:productId', authenticate, authorize(RoleGroups.SALES), ctrl.getProductById);
router.patch('/:productId', authenticate, authorize(RoleGroups.MANAGERS), ctrl.updateProduct);
router.delete('/:productId', authenticate, authorize(RoleGroups.ADMIN_ONLY), ctrl.archiveProduct);

// Variants
router.get('/:productId/variants', authenticate, authorize(RoleGroups.SALES), ctrl.listVariants);
router.post('/:productId/variants', authenticate, authorize(RoleGroups.MANAGERS), ctrl.createVariant);
router.patch('/:productId/variants/:variantId', authenticate, authorize(RoleGroups.MANAGERS), ctrl.updateVariant);
router.delete('/:productId/variants/:variantId', authenticate, authorize(RoleGroups.ADMIN_ONLY), ctrl.deleteVariant);

module.exports = router;
