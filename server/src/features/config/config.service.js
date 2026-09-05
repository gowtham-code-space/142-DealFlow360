const { v4: uuidv4 } = require('uuid');
const configModel = require('./config.model');

// ─── Discount Policies ────────────────────────────────────────────────────────

async function listDiscountPolicies() {
  return configModel.findDiscountPolicies();
}

async function createDiscountPolicy({ customerTier, productCategory, maxDiscountPct }) {
  const existing = await configModel.findDiscountPolicyByTierAndCategory(customerTier, productCategory);
  if (existing) return { conflict: true };

  const policy = await configModel.createDiscountPolicy({
    id: uuidv4(),
    customerTier: customerTier.toUpperCase(),
    productCategory,
    maxDiscountPct
  });
  return { policy };
}

async function getDiscountPolicyById(id) {
  return configModel.findDiscountPolicyById(id);
}

async function updateDiscountPolicy(id, { maxDiscountPct }) {
  return configModel.updateDiscountPolicy(id, { maxDiscountPct });
}

async function deleteDiscountPolicy(id) {
  await configModel.deleteDiscountPolicy(id);
}

// ─── Discount Type Rules ───────────────────────────────────────────────────────

async function listDiscountTypeRules() {
  return configModel.findDiscountTypeRules();
}

async function createDiscountTypeRule(data) {
  const existing = await configModel.findDiscountTypeRuleByType(data.type);
  if (existing) return { conflict: true };

  const rule = await configModel.createDiscountTypeRule({
    id: uuidv4(),
    ...data,
    type: data.type.toUpperCase()
  });
  return { rule };
}

async function updateDiscountTypeRule(ruleId, data) {
  return configModel.updateDiscountTypeRule(ruleId, data);
}

async function deleteDiscountTypeRule(ruleId) {
  await configModel.deleteDiscountTypeRule(ruleId);
}

// ─── Approval Chains ──────────────────────────────────────────────────────────

async function listApprovalChains() {
  return configModel.findApprovalChains();
}

async function createApprovalChain({ description, salesRepOnlyMaxOverCeilingPct, financeThresholdOverCeilingPct }) {
  const existing = await configModel.findFirstActiveApprovalChain();
  if (existing) return { conflict: true };

  const chain = await configModel.createApprovalChain({
    id: uuidv4(),
    description,
    salesRepOnlyMaxOverCeilingPct,
    financeThresholdOverCeilingPct
  });
  return { chain };
}

async function getApprovalChainById(chainId) {
  return configModel.findApprovalChainById(chainId);
}

async function updateApprovalChain(chainId, data) {
  return configModel.updateApprovalChain(chainId, data);
}

async function deleteApprovalChain(chainId) {
  await configModel.deleteApprovalChain(chainId);
}

// ─── Pool Config ──────────────────────────────────────────────────────────────

async function getPoolConfig() {
  return configModel.findPoolConfig();
}

async function updatePoolConfig({ normalPoolPct, premiumBulkPoolPct, depositPct, holdDurationHours }) {
  const existing = await configModel.findPoolConfig();
  if (!existing) {
    return configModel.createPoolConfig({
      id: uuidv4(),
      normalPoolPct,
      premiumBulkPoolPct,
      depositPct,
      holdDurationHours
    });
  }
  return configModel.updatePoolConfig(existing.id, {
    normalPoolPct,
    premiumBulkPoolPct,
    depositPct,
    holdDurationHours
  });
}

// ─── Subscription Plans ───────────────────────────────────────────────────────

async function listSubscriptionPlans() {
  return configModel.findSubscriptionPlans();
}

async function createSubscriptionPlan({ name, billingPeriod, prorationType, price }) {
  const existing = await configModel.findSubscriptionPlanByName(name);
  if (existing) return { conflict: true };

  const plan = await configModel.createSubscriptionPlan({
    id: uuidv4(),
    name,
    billingPeriod: billingPeriod.toUpperCase(),
    prorationType: prorationType.toUpperCase(),
    price
  });
  return { plan };
}

async function getSubscriptionPlanById(planId) {
  return configModel.findSubscriptionPlanById(planId);
}

async function updateSubscriptionPlan(planId, data) {
  const update = {};
  if (data.name !== undefined) update.name = data.name;
  if (data.billingPeriod !== undefined) update.billingPeriod = data.billingPeriod.toUpperCase();
  if (data.prorationType !== undefined) update.prorationType = data.prorationType.toUpperCase();
  if (data.price !== undefined) update.price = data.price;
  return configModel.updateSubscriptionPlan(planId, update);
}

async function archiveSubscriptionPlan(planId) {
  const active = await configModel.findActiveSubscriptionForPlan(planId);
  if (active) return { inUse: true };

  await configModel.updateSubscriptionPlan(planId, { isActive: false });
  return { success: true };
}

// ─── Upsell Rules ─────────────────────────────────────────────────────────────

async function listUpsellRules() {
  return configModel.findUpsellRules();
}

async function createUpsellRule({ sourceProductId, suggestedProductId, reason, minMarginPct, isPromotion }) {
  const existing = await configModel.findUpsellRuleByProducts(sourceProductId, suggestedProductId);
  if (existing) return { conflict: true };

  const rule = await configModel.createUpsellRule({
    id: uuidv4(),
    sourceProductId,
    suggestedProductId,
    reason,
    minMarginPct: minMarginPct || 20,
    isPromotion: !!isPromotion
  });
  return { rule };
}

async function updateUpsellRule(ruleId, data) {
  return configModel.updateUpsellRule(ruleId, data);
}

async function deleteUpsellRule(ruleId) {
  await configModel.deleteUpsellRule(ruleId);
}

module.exports = {
  listDiscountPolicies, createDiscountPolicy, getDiscountPolicyById, updateDiscountPolicy, deleteDiscountPolicy,
  listDiscountTypeRules, createDiscountTypeRule, updateDiscountTypeRule, deleteDiscountTypeRule,
  listApprovalChains, createApprovalChain, getApprovalChainById, updateApprovalChain, deleteApprovalChain,
  getPoolConfig, updatePoolConfig,
  listSubscriptionPlans, createSubscriptionPlan, getSubscriptionPlanById, updateSubscriptionPlan, archiveSubscriptionPlan,
  listUpsellRules, createUpsellRule, updateUpsellRule, deleteUpsellRule
};
