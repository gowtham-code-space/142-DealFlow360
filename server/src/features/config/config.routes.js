const express = require('express');
const router = express.Router();
const ctrl = require('./config.controller');
const authenticate = require('../../middleware/auth.middleware');
const authorize = require('../../middleware/role.middleware');
const { RoleGroups } = require('../../constants');

// Discount Policies
router.get('/discount-policies', authenticate, authorize(RoleGroups.MANAGERS), ctrl.listDiscountPolicies);
router.post('/discount-policies', authenticate, authorize(RoleGroups.ADMIN_ONLY), ctrl.createDiscountPolicy);
router.get('/discount-policies/:policyId', authenticate, authorize(RoleGroups.MANAGERS), ctrl.getDiscountPolicyById);
router.patch('/discount-policies/:policyId', authenticate, authorize(RoleGroups.ADMIN_ONLY), ctrl.updateDiscountPolicy);
router.delete('/discount-policies/:policyId', authenticate, authorize(RoleGroups.ADMIN_ONLY), ctrl.deleteDiscountPolicy);

// Discount Type Rules
router.get('/discount-types', authenticate, authorize(RoleGroups.MANAGERS), ctrl.listDiscountTypes);
router.post('/discount-types', authenticate, authorize(RoleGroups.ADMIN_ONLY), ctrl.createDiscountTypeRule);
router.patch('/discount-types/:ruleId', authenticate, authorize(RoleGroups.ADMIN_ONLY), ctrl.updateDiscountTypeRule);
router.delete('/discount-types/:ruleId', authenticate, authorize(RoleGroups.ADMIN_ONLY), ctrl.deleteDiscountTypeRule);

// Approval Chains
router.get('/approval-chains', authenticate, authorize(RoleGroups.MANAGERS), ctrl.listApprovalChains);
router.post('/approval-chains', authenticate, authorize(RoleGroups.ADMIN_ONLY), ctrl.createApprovalChain);
router.get('/approval-chains/:chainId', authenticate, authorize(RoleGroups.MANAGERS), ctrl.getApprovalChainById);
router.patch('/approval-chains/:chainId', authenticate, authorize(RoleGroups.ADMIN_ONLY), ctrl.updateApprovalChain);
router.delete('/approval-chains/:chainId', authenticate, authorize(RoleGroups.ADMIN_ONLY), ctrl.deleteApprovalChain);

// Pool Config (singleton)
router.get('/pool-config', authenticate, authorize(RoleGroups.MANAGERS), ctrl.getPoolConfig);
router.put('/pool-config', authenticate, authorize(RoleGroups.ADMIN_ONLY), ctrl.updatePoolConfig);

// Subscription Plans
router.get('/subscription-plans', authenticate, ctrl.listSubscriptionPlans);
router.post('/subscription-plans', authenticate, authorize(RoleGroups.ADMIN_ONLY), ctrl.createSubscriptionPlan);
router.get('/subscription-plans/:planId', authenticate, ctrl.getSubscriptionPlanById);
router.patch('/subscription-plans/:planId', authenticate, authorize(RoleGroups.ADMIN_ONLY), ctrl.updateSubscriptionPlan);
router.delete('/subscription-plans/:planId', authenticate, authorize(RoleGroups.ADMIN_ONLY), ctrl.archiveSubscriptionPlan);

// Upsell Rules
router.get('/upsell-rules', authenticate, authorize(RoleGroups.MANAGERS), ctrl.listUpsellRules);
router.post('/upsell-rules', authenticate, authorize(RoleGroups.ADMIN_ONLY), ctrl.createUpsellRule);
router.patch('/upsell-rules/:ruleId', authenticate, authorize(RoleGroups.ADMIN_ONLY), ctrl.updateUpsellRule);
router.delete('/upsell-rules/:ruleId', authenticate, authorize(RoleGroups.ADMIN_ONLY), ctrl.deleteUpsellRule);

module.exports = router;
