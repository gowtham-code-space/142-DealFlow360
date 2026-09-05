const express = require('express');
const router = express.Router();
const ctrl = require('./recommendations.controller');
const authenticate = require('../../middleware/auth.middleware');
const authorize = require('../../middleware/role.middleware');
const { RoleGroups } = require('../../constants');

router.get('/quotes/:quoteId/recommendations', authenticate, authorize(RoleGroups.SALES), ctrl.getRecommendations);
router.post('/quotes/:quoteId/recommendations/:productId/add', authenticate, authorize(RoleGroups.SALES), ctrl.addRecommendedProduct);
router.post('/quotes/:quoteId/recommendations/:productId/dismiss', authenticate, authorize(RoleGroups.SALES), ctrl.dismissRecommendation);

module.exports = router;
