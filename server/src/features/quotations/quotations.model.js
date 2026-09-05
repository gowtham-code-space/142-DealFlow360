const prisma = require('../../config/db');

// ─── Quotations Queries ───────────────────────────────────────────────────────

async function countQuotations(where = {}) {
  return prisma.quotation.count({ where });
}

async function findQuotations({ where, skip, take }) {
  return prisma.quotation.findMany({
    where,
    skip,
    take,
    include: {
      customer: { select: { id: true, name: true, tier: true } },
      rep: { select: { id: true, name: true } }
    },
    orderBy: { createdAt: 'desc' }
  });
}

async function findCustomerById(id) {
  return prisma.customer.findUnique({ where: { id } });
}

async function createQuotation(data) {
  return prisma.quotation.create({
    data,
    include: {
      customer: { select: { id: true, name: true, tier: true } },
      rep: { select: { id: true, name: true } }
    }
  });
}

async function findQuotationById(id) {
  return prisma.quotation.findUnique({
    where: { id },
    include: {
      customer: { select: { id: true, name: true, tier: true, riskScore: true, orderCount: true, creditLimit: true } },
      rep: { select: { id: true, name: true } },
      items: {
        include: {
          product: { select: { id: true, name: true, category: true, productType: true } },
          variant: true
        }
      },
      approvals: true,
      depositRecords: true
    }
  });
}

async function findQuotationForSubmit(id) {
  return prisma.quotation.findUnique({
    where: { id },
    include: {
      customer: true,
      items: { include: { product: true, variant: true } }
    }
  });
}

async function updateQuotation(id, data) {
  return prisma.quotation.update({ where: { id }, data });
}

async function createApprovals(data) {
  return prisma.approval.createMany({ data });
}

async function findQuotationRisk(id) {
  return prisma.quotation.findUnique({
    where: { id },
    select: {
      blendedRiskScore: true,
      requiresApproval: true,
      approvalLevel: true,
      approvalReason: true,
      marginPct: true,
      status: true
    }
  });
}

// ─── Deposits Queries ─────────────────────────────────────────────────────────

async function findDeposits(quotationId) {
  return prisma.depositRecord.findMany({ where: { quotationId } });
}

async function createDeposit(data) {
  return prisma.depositRecord.create({ data });
}

async function findPaidDeposit(quotationId) {
  return prisma.depositRecord.findFirst({
    where: { quotationId, status: 'PAID' }
  });
}

async function updateDeposit(id, data) {
  return prisma.depositRecord.update({ where: { id }, data });
}

// ─── Quote Lines Queries ──────────────────────────────────────────────────────

async function findQuoteLines(quotationId) {
  return prisma.quotationItem.findMany({
    where: { quotationId },
    include: {
      product: { select: { id: true, name: true, category: true, productType: true } },
      variant: true
    }
  });
}

async function findProductById(id) {
  return prisma.product.findUnique({ where: { id } });
}

async function findVariantById(id) {
  return prisma.productVariant.findUnique({ where: { id } });
}

async function findDiscountPolicies() {
  return prisma.discountPolicy.findMany({ where: { isActive: true } });
}

async function findDiscountTypeRules() {
  return prisma.discountTypeRule.findMany({ where: { isActive: true } });
}

async function findApprovalChainRule() {
  return prisma.approvalChainRule.findFirst({ where: { isActive: true } });
}

async function createQuoteLine(data) {
  return prisma.quotationItem.create({
    data,
    include: { product: { select: { id: true, name: true } } }
  });
}

async function findQuoteLineById(id) {
  return prisma.quotationItem.findUnique({
    where: { id },
    include: { product: true }
  });
}

async function updateQuoteLine(id, data) {
  return prisma.quotationItem.update({ where: { id }, data });
}

async function deleteQuoteLine(id) {
  return prisma.quotationItem.delete({ where: { id } });
}

async function invalidatePendingApprovals(quotationId) {
  return prisma.approval.updateMany({
    where: { quotationId, status: 'PENDING' },
    data: { status: 'INVALIDATED' }
  });
}

async function findLineDiscountBreakdown(lineId) {
  return prisma.quotationItem.findUnique({
    where: { id: lineId },
    select: {
      id: true, quantity: true, unitListPrice: true, unitCostPrice: true,
      lineTotal: true, netTotal: true, marginPct: true,
      productDiscountPct: true, bulkDiscountPct: true,
      consistencyDiscountPct: true, premiumDiscountPct: true,
      variantDiscountPct: true, cumulativeDiscountPct: true,
      ceilingPct: true, isOverLimit: true, overLimitPct: true
    }
  });
}

async function findLineComments(quoteLineId) {
  return prisma.lineComment.findMany({
    where: { quoteLineId },
    include: { author: { select: { id: true, name: true, roleId: true } } },
    orderBy: { createdAt: 'asc' }
  });
}

async function createLineComment(data) {
  return prisma.lineComment.create({ data });
}

module.exports = {
  countQuotations,
  findQuotations,
  findCustomerById,
  createQuotation,
  findQuotationById,
  findQuotationForSubmit,
  updateQuotation,
  createApprovals,
  findQuotationRisk,
  findDeposits,
  createDeposit,
  findPaidDeposit,
  updateDeposit,
  findQuoteLines,
  findProductById,
  findVariantById,
  findDiscountPolicies,
  findDiscountTypeRules,
  findApprovalChainRule,
  createQuoteLine,
  findQuoteLineById,
  updateQuoteLine,
  deleteQuoteLine,
  invalidatePendingApprovals,
  findLineDiscountBreakdown,
  findLineComments,
  createLineComment
};
