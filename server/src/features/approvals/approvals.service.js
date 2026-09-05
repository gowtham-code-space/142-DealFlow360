const approvalModel = require('./approvals.model');
const { Role, ApprovalStatus, QuoteStatus, Defaults } = require('../../constants');

async function listApprovals({ page = Defaults.PAGE, pageSize = Defaults.PAGE_SIZE, status, stage, quotationId }) {
  const skip = (page - 1) * pageSize;
  const where = {};
  if (status) where.status = status.toUpperCase();
  if (stage) where.stage = stage.toUpperCase();
  if (quotationId) where.quotationId = quotationId;

  const [items, total] = await Promise.all([
    approvalModel.findApprovals({ where, skip, take: Number(pageSize) }),
    approvalModel.countApprovals(where)
  ]);
  return { items, total, page: Number(page), pageSize: Number(pageSize), totalPages: Math.ceil(total / pageSize) };
}

async function getApprovalById(id) {
  return approvalModel.findApprovalById(id);
}

async function approve(approvalId, approverId, comments, approverRole) {
  const approval = await approvalModel.findApprovalById(approvalId);
  if (!approval) return { notFound: true };
  if (approval.status !== ApprovalStatus.PENDING) return { alreadyDecided: true };

  // Level 1 (SALES_REP): only the quote's own rep can approve
  if (approval.level === 1 && approverRole === Role.SALES_REP) {
    if (approval.quotation.repId && approval.quotation.repId !== approverId) {
      return { forbidden: true };
    }
  }

  // Level 2/3 must wait for level 1 to be approved
  if (approval.level > 1) {
    const lowerPending = await approvalModel.findLowerPendingApproval(approval.quotationId, approval.level);
    if (lowerPending) return { lowerLevelPending: true };
  }

  await approvalModel.updateApproval(approvalId, {
    status: ApprovalStatus.APPROVED,
    approverId,
    comments,
    decidedAt: new Date()
  });

  // Check if all approvals for this quote/revision are done
  const remaining = await approvalModel.findRemainingPendingApproval(approval.quotationId, approval.quoteRevision);

  if (!remaining) {
    await approvalModel.updateQuotationStatus(approval.quotationId, QuoteStatus.APPROVED);
  }

  return { success: true };
}

async function reject(approvalId, approverId, comments) {
  const approval = await approvalModel.findApprovalById(approvalId);
  if (!approval) return { notFound: true };
  if (approval.status !== ApprovalStatus.PENDING) return { alreadyDecided: true };

  await approvalModel.updateApproval(approvalId, {
    status: ApprovalStatus.REJECTED,
    approverId,
    comments,
    decidedAt: new Date()
  });

  await approvalModel.updateQuotationStatus(approval.quotationId, QuoteStatus.REJECTED);
  return { success: true };
}

async function returnForEdit(approvalId, approverId, comments) {
  const approval = await approvalModel.findApprovalById(approvalId);
  if (!approval) return { notFound: true };
  if (approval.status !== ApprovalStatus.PENDING) return { alreadyDecided: true };

  await approvalModel.updateApproval(approvalId, {
    status: ApprovalStatus.RETURNED,
    approverId,
    comments,
    decidedAt: new Date()
  });

  await approvalModel.updateQuotationStatus(approval.quotationId, QuoteStatus.RETURNED);
  return { success: true };
}

module.exports = { listApprovals, getApprovalById, approve, reject, returnForEdit };
