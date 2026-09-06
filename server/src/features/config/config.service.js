const { v4: uuidv4 } = require('uuid');
const configModel = require('./config.model');

// ─── Discount Policies ────────────────────────────────────────────────────────

async function listDiscountPolicies() {
  return configModel.findDiscountPolicies();
}

async function createDiscountPolicy({ customerTier, productCategory, maxDiscountPct, isActive }) {
  const tier = (customerTier || 'STANDARD').toUpperCase();
  const cat = productCategory || 'All';
  const pct = Number(maxDiscountPct) || 0;

  const existing = await configModel.findDiscountPolicyByTierAndCategory(tier, cat);
  if (existing) {
    const updated = await configModel.updateDiscountPolicy(existing.id, {
      maxDiscountPct: pct,
      isActive: isActive !== undefined ? isActive : true
    });
    return { policy: updated };
  }

  const policy = await configModel.createDiscountPolicy({
    id: uuidv4(),
    customerTier: tier,
    productCategory: cat,
    maxDiscountPct: pct,
    isActive: isActive !== undefined ? isActive : true
  });
  return { policy };
}

async function getDiscountPolicyById(id) {
  return configModel.findDiscountPolicyById(id);
}

async function updateDiscountPolicy(id, data) {
  const updateData = {};
  if (data.maxDiscountPct !== undefined) updateData.maxDiscountPct = Number(data.maxDiscountPct);
  if (data.customerTier !== undefined) updateData.customerTier = data.customerTier.toUpperCase();
  if (data.productCategory !== undefined) updateData.productCategory = data.productCategory;
  if (data.isActive !== undefined) updateData.isActive = data.isActive;
  return configModel.updateDiscountPolicy(id, updateData);
}

async function deleteDiscountPolicy(id) {
  await configModel.deleteDiscountPolicy(id);
}

// ─── Discount Type Rules ───────────────────────────────────────────────────────

async function listDiscountTypeRules() {
  return configModel.findDiscountTypeRules();
}

async function createDiscountTypeRule(data) {
  const type = (data.type || data.code || 'BULK').toUpperCase();
  const existing = await configModel.findDiscountTypeRuleByType(type);
  if (existing) {
    const updated = await configModel.updateDiscountTypeRule(existing.id, {
      ...data,
      type
    });
    return { rule: updated };
  }

  const rule = await configModel.createDiscountTypeRule({
    id: uuidv4(),
    type,
    bulkThresholdQty: data.bulkThresholdQty != null ? Number(data.bulkThresholdQty) : null,
    bulkDiscountPct: data.bulkDiscountPct != null ? Number(data.bulkDiscountPct) : null,
    consistencyOrderCount: data.consistencyOrderCount != null ? Number(data.consistencyOrderCount) : null,
    consistencyDiscountPct: data.consistencyDiscountPct != null ? Number(data.consistencyDiscountPct) : null,
    premiumDiscountPct: data.premiumDiscountPct != null ? Number(data.premiumDiscountPct) : null,
    isActive: data.isActive !== undefined ? data.isActive : true
  });
  return { rule };
}

async function updateDiscountTypeRule(ruleId, data) {
  const updateData = {};
  if (data.type !== undefined) updateData.type = data.type.toUpperCase();
  if (data.bulkThresholdQty !== undefined) updateData.bulkThresholdQty = Number(data.bulkThresholdQty);
  if (data.bulkDiscountPct !== undefined) updateData.bulkDiscountPct = Number(data.bulkDiscountPct);
  if (data.consistencyOrderCount !== undefined) updateData.consistencyOrderCount = Number(data.consistencyOrderCount);
  if (data.consistencyDiscountPct !== undefined) updateData.consistencyDiscountPct = Number(data.consistencyDiscountPct);
  if (data.premiumDiscountPct !== undefined) updateData.premiumDiscountPct = Number(data.premiumDiscountPct);
  if (data.isActive !== undefined) updateData.isActive = data.isActive;
  return configModel.updateDiscountTypeRule(ruleId, updateData);
}

async function deleteDiscountTypeRule(ruleId) {
  await configModel.deleteDiscountTypeRule(ruleId);
}

// ─── Approval Chains ──────────────────────────────────────────────────────────

async function listApprovalChains() {
  return configModel.findApprovalChains();
}

async function createApprovalChain({ description, salesRepOnlyMaxOverCeilingPct, financeThresholdOverCeilingPct, isActive }) {
  const chain = await configModel.createApprovalChain({
    id: uuidv4(),
    description: description || 'Standard Approval Chain Rule',
    salesRepOnlyMaxOverCeilingPct: Number(salesRepOnlyMaxOverCeilingPct !== undefined ? salesRepOnlyMaxOverCeilingPct : 5),
    financeThresholdOverCeilingPct: Number(financeThresholdOverCeilingPct !== undefined ? financeThresholdOverCeilingPct : 15),
    isActive: isActive !== undefined ? isActive : true
  });
  return { chain };
}

async function getApprovalChainById(chainId) {
  return configModel.findApprovalChainById(chainId);
}

async function updateApprovalChain(chainId, data) {
  const updateData = {};
  if (data.description !== undefined) updateData.description = data.description;
  if (data.salesRepOnlyMaxOverCeilingPct !== undefined) updateData.salesRepOnlyMaxOverCeilingPct = Number(data.salesRepOnlyMaxOverCeilingPct);
  if (data.financeThresholdOverCeilingPct !== undefined) updateData.financeThresholdOverCeilingPct = Number(data.financeThresholdOverCeilingPct);
  if (data.isActive !== undefined) updateData.isActive = data.isActive;
  return configModel.updateApprovalChain(chainId, updateData);
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
