const prisma = require('../../config/db');

// ─── Discount Policies ────────────────────────────────────────────────────────

async function findDiscountPolicies() {
  return prisma.discountPolicy.findMany({ orderBy: { createdAt: 'desc' } });
}

async function findDiscountPolicyByTierAndCategory(customerTier, productCategory) {
  return prisma.discountPolicy.findFirst({ where: { customerTier, productCategory } });
}

async function createDiscountPolicy(data) {
  return prisma.discountPolicy.create({ data });
}

async function findDiscountPolicyById(id) {
  return prisma.discountPolicy.findUnique({ where: { id } });
}

async function updateDiscountPolicy(id, data) {
  return prisma.discountPolicy.update({ where: { id }, data });
}

async function deleteDiscountPolicy(id) {
  return prisma.discountPolicy.delete({ where: { id } });
}

// ─── Discount Type Rules ───────────────────────────────────────────────────────

async function findDiscountTypeRules() {
  return prisma.discountTypeRule.findMany({ orderBy: { createdAt: 'desc' } });
}

async function findDiscountTypeRuleByType(type) {
  return prisma.discountTypeRule.findFirst({ where: { type } });
}

async function createDiscountTypeRule(data) {
  return prisma.discountTypeRule.create({ data });
}

async function updateDiscountTypeRule(id, data) {
  return prisma.discountTypeRule.update({ where: { id }, data });
}

async function deleteDiscountTypeRule(id) {
  return prisma.discountTypeRule.delete({ where: { id } });
}

// ─── Approval Chains ──────────────────────────────────────────────────────────

async function findApprovalChains() {
  return prisma.approvalChainRule.findMany({ orderBy: { createdAt: 'desc' } });
}

async function findFirstActiveApprovalChain() {
  return prisma.approvalChainRule.findFirst({ where: { isActive: true } });
}

async function createApprovalChain(data) {
  return prisma.approvalChainRule.create({ data });
}

async function findApprovalChainById(id) {
  return prisma.approvalChainRule.findUnique({ where: { id } });
}

async function updateApprovalChain(id, data) {
  return prisma.approvalChainRule.update({ where: { id }, data });
}

async function deleteApprovalChain(id) {
  return prisma.approvalChainRule.delete({ where: { id } });
}

// ─── Pool Config ──────────────────────────────────────────────────────────────

async function findPoolConfig() {
  return prisma.poolConfig.findFirst();
}

async function createPoolConfig(data) {
  return prisma.poolConfig.create({ data });
}

async function updatePoolConfig(id, data) {
  return prisma.poolConfig.update({ where: { id }, data });
}

// ─── Subscription Plans ───────────────────────────────────────────────────────

async function findSubscriptionPlans() {
  return prisma.subscriptionPlan.findMany({ where: { isActive: true } });
}

async function findSubscriptionPlanByName(name) {
  return prisma.subscriptionPlan.findFirst({ where: { name } });
}

async function createSubscriptionPlan(data) {
  return prisma.subscriptionPlan.create({ data });
}

async function findSubscriptionPlanById(id) {
  return prisma.subscriptionPlan.findUnique({ where: { id } });
}

async function updateSubscriptionPlan(id, data) {
  return prisma.subscriptionPlan.update({ where: { id }, data });
}

async function findActiveSubscriptionForPlan(planId) {
  return prisma.subscription.findFirst({
    where: { planId, status: 'ACTIVE' }
  });
}

// ─── Upsell Rules ─────────────────────────────────────────────────────────────

async function findUpsellRules() {
  return prisma.upsellRule.findMany({
    where: { isActive: true },
    include: {
      sourceProduct: { select: { id: true, name: true } },
      suggestedProduct: { select: { id: true, name: true } }
    }
  });
}

async function findUpsellRuleByProducts(sourceProductId, suggestedProductId) {
  return prisma.upsellRule.findFirst({ where: { sourceProductId, suggestedProductId } });
}

async function createUpsellRule(data) {
  return prisma.upsellRule.create({ data });
}

async function updateUpsellRule(id, data) {
  return prisma.upsellRule.update({ where: { id }, data });
}

async function deleteUpsellRule(id) {
  return prisma.upsellRule.delete({ where: { id } });
}

module.exports = {
  findDiscountPolicies, findDiscountPolicyByTierAndCategory, createDiscountPolicy, findDiscountPolicyById, updateDiscountPolicy, deleteDiscountPolicy,
  findDiscountTypeRules, findDiscountTypeRuleByType, createDiscountTypeRule, updateDiscountTypeRule, deleteDiscountTypeRule,
  findApprovalChains, findFirstActiveApprovalChain, createApprovalChain, findApprovalChainById, updateApprovalChain, deleteApprovalChain,
  findPoolConfig, createPoolConfig, updatePoolConfig,
  findSubscriptionPlans, findSubscriptionPlanByName, createSubscriptionPlan, findSubscriptionPlanById, updateSubscriptionPlan, findActiveSubscriptionForPlan,
  findUpsellRules, findUpsellRuleByProducts, createUpsellRule, updateUpsellRule, deleteUpsellRule
};
