const svc = require('./config.service');
const {
  successResponse, createdResponse, badRequestResponse,
  notFoundResponse, conflictResponse
} = require('../../utils/response');

// ─── Discount Policies ────────────────────────────────────────────────────────

async function listDiscountPolicies(req, res) {
  return successResponse(res, 'Discount policies fetched', await svc.listDiscountPolicies());
}

async function createDiscountPolicy(req, res) {
  const { customerTier, productCategory, maxDiscountPct, isActive } = req.body;
  if (!customerTier && maxDiscountPct == null) {
    return badRequestResponse(res, 'customerTier and maxDiscountPct are required');
  }
  const result = await svc.createDiscountPolicy({ customerTier, productCategory, maxDiscountPct, isActive });
  return createdResponse(res, 'Discount policy created', result.policy);
}

async function getDiscountPolicyById(req, res) {
  const policy = await svc.getDiscountPolicyById(req.params.policyId);
  if (!policy) return notFoundResponse(res, 'Discount policy not found');
  return successResponse(res, 'Discount policy fetched', policy);
}

async function updateDiscountPolicy(req, res) {
  try {
    const policy = await svc.updateDiscountPolicy(req.params.policyId, req.body);
    return successResponse(res, 'Discount policy updated', policy);
  } catch (err) {
    return notFoundResponse(res, 'Discount policy not found');
  }
}

async function deleteDiscountPolicy(req, res) {
  try {
    await svc.deleteDiscountPolicy(req.params.policyId);
    return successResponse(res, 'Discount policy deleted');
  } catch (err) {
    return notFoundResponse(res, 'Discount policy not found');
  }
}

// ─── Discount Type Rules ───────────────────────────────────────────────────────

async function listDiscountTypes(req, res) {
  return successResponse(res, 'Discount type rules fetched', await svc.listDiscountTypeRules());
}

async function createDiscountTypeRule(req, res) {
  const result = await svc.createDiscountTypeRule(req.body);
  return createdResponse(res, 'Discount type rule created', result.rule);
}

async function updateDiscountTypeRule(req, res) {
  try {
    const rule = await svc.updateDiscountTypeRule(req.params.ruleId, req.body);
    return successResponse(res, 'Discount type rule updated', rule);
  } catch (err) {
    return notFoundResponse(res, 'Rule not found');
  }
}

async function deleteDiscountTypeRule(req, res) {
  try {
    await svc.deleteDiscountTypeRule(req.params.ruleId);
    return successResponse(res, 'Discount type rule deleted');
  } catch (err) {
    return notFoundResponse(res, 'Rule not found');
  }
}

// ─── Approval Chains ──────────────────────────────────────────────────────────

async function listApprovalChains(req, res) {
  return successResponse(res, 'Approval chains fetched', await svc.listApprovalChains());
}

async function createApprovalChain(req, res) {
  const { description, salesRepOnlyMaxOverCeilingPct, financeThresholdOverCeilingPct, isActive } = req.body;
  const result = await svc.createApprovalChain({ description, salesRepOnlyMaxOverCeilingPct, financeThresholdOverCeilingPct, isActive });
  return createdResponse(res, 'Approval chain created', result.chain);
}

async function getApprovalChainById(req, res) {
  const chain = await svc.getApprovalChainById(req.params.chainId);
  if (!chain) return notFoundResponse(res, 'Approval chain not found');
  return successResponse(res, 'Approval chain fetched', chain);
}

async function updateApprovalChain(req, res) {
  try {
    const chain = await svc.updateApprovalChain(req.params.chainId, req.body);
    return successResponse(res, 'Approval chain updated', chain);
  } catch (err) {
    return notFoundResponse(res, 'Approval chain not found');
  }
}

async function deleteApprovalChain(req, res) {
  try {
    await svc.deleteApprovalChain(req.params.chainId);
    return successResponse(res, 'Approval chain deleted');
  } catch (err) {
    return notFoundResponse(res, 'Approval chain not found');
  }
}

// ─── Pool Config ──────────────────────────────────────────────────────────────

async function getPoolConfig(req, res) {
  const config = await svc.getPoolConfig();
  return successResponse(res, 'Pool config fetched', config);
}

async function updatePoolConfig(req, res) {
  const config = await svc.updatePoolConfig(req.body);
  return successResponse(res, 'Pool config updated', config);
}

// ─── Subscription Plans ───────────────────────────────────────────────────────

async function listSubscriptionPlans(req, res) {
  return successResponse(res, 'Subscription plans fetched', await svc.listSubscriptionPlans());
}

async function createSubscriptionPlan(req, res) {
  const { name, billingPeriod, prorationType, price } = req.body;
  if (!name || !billingPeriod || !price) return badRequestResponse(res, 'name, billingPeriod and price are required');
  const result = await svc.createSubscriptionPlan({ name, billingPeriod, prorationType: prorationType || 'DAILY', price });
  if (result.conflict) return conflictResponse(res, 'Plan with this name already exists');
  return createdResponse(res, 'Subscription plan created', result.plan);
}

async function getSubscriptionPlanById(req, res) {
  const plan = await svc.getSubscriptionPlanById(req.params.planId);
  if (!plan) return notFoundResponse(res, 'Subscription plan not found');
  return successResponse(res, 'Subscription plan fetched', plan);
}

async function updateSubscriptionPlan(req, res) {
  try {
    const plan = await svc.updateSubscriptionPlan(req.params.planId, req.body);
    return successResponse(res, 'Subscription plan updated', plan);
  } catch { return notFoundResponse(res, 'Subscription plan not found'); }
}

async function archiveSubscriptionPlan(req, res) {
  const plan = await svc.getSubscriptionPlanById(req.params.planId);
  if (!plan) return notFoundResponse(res, 'Subscription plan not found');
  const result = await svc.archiveSubscriptionPlan(req.params.planId);
  if (result.inUse) return conflictResponse(res, 'Plan is in use by active subscriptions');
  return successResponse(res, 'Subscription plan archived');
}

// ─── Upsell Rules ─────────────────────────────────────────────────────────────

async function listUpsellRules(req, res) {
  return successResponse(res, 'Upsell rules fetched', await svc.listUpsellRules());
}

async function createUpsellRule(req, res) {
  const { sourceProductId, suggestedProductId, reason } = req.body;
  if (!sourceProductId || !suggestedProductId || !reason) return badRequestResponse(res, 'sourceProductId, suggestedProductId and reason are required');
  const result = await svc.createUpsellRule(req.body);
  if (result.conflict) return conflictResponse(res, 'Rule for this product pair already exists');
  return createdResponse(res, 'Upsell rule created', result.rule);
}

async function updateUpsellRule(req, res) {
  try {
    const rule = await svc.updateUpsellRule(req.params.ruleId, req.body);
    return successResponse(res, 'Upsell rule updated', rule);
  } catch { return notFoundResponse(res, 'Upsell rule not found'); }
}

async function deleteUpsellRule(req, res) {
  try {
    await svc.deleteUpsellRule(req.params.ruleId);
    return successResponse(res, 'Upsell rule deleted');
  } catch { return notFoundResponse(res, 'Upsell rule not found'); }
}

module.exports = {
  listDiscountPolicies, createDiscountPolicy, getDiscountPolicyById, updateDiscountPolicy, deleteDiscountPolicy,
  listDiscountTypes, createDiscountTypeRule, updateDiscountTypeRule, deleteDiscountTypeRule,
  listApprovalChains, createApprovalChain, getApprovalChainById, updateApprovalChain, deleteApprovalChain,
  getPoolConfig, updatePoolConfig,
  listSubscriptionPlans, createSubscriptionPlan, getSubscriptionPlanById, updateSubscriptionPlan, archiveSubscriptionPlan,
  listUpsellRules, createUpsellRule, updateUpsellRule, deleteUpsellRule
};
