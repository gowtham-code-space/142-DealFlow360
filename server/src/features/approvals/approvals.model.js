const prisma = require('../../config/db');

async function findApprovals({ where, skip, take }) {
  return prisma.approval.findMany({
    where,
    skip,
    take,
    include: {
      quotation: { select: { id: true, quotationNumber: true, status: true } },
      approver: { select: { id: true, name: true, role: true } }
    },
    orderBy: { createdAt: 'desc' }
  });
}

async function countApprovals(where) {
  return prisma.approval.count({ where });
}

async function findApprovalById(id) {
  return prisma.approval.findUnique({
    where: { id },
    include: {
      quotation: { select: { id: true, quotationNumber: true, status: true, approvalLevel: true, repId: true } },
      approver: { select: { id: true, name: true, role: true } }
    }
  });
}

async function findLowerPendingApproval(quotationId, level) {
  return prisma.approval.findFirst({
    where: { quotationId, level: { lt: level }, status: 'PENDING' }
  });
}

async function updateApproval(id, data) {
  return prisma.approval.update({ where: { id }, data });
}

async function findRemainingPendingApproval(quotationId, quoteRevision) {
  return prisma.approval.findFirst({
    where: { quotationId, quoteRevision, status: 'PENDING' }
  });
}

async function updateQuotationStatus(id, status) {
  return prisma.quotation.update({ where: { id }, data: { status } });
}

module.exports = {
  findApprovals,
  countApprovals,
  findApprovalById,
  findLowerPendingApproval,
  updateApproval,
  findRemainingPendingApproval,
  updateQuotationStatus
};
