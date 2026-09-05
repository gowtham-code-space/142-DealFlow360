const svc = require('./approvals.service');
const { successResponse, badRequestResponse, notFoundResponse, conflictResponse, forbiddenResponse } = require('../../utils/response');

async function listApprovals(req, res) {
  return successResponse(res, 'Approvals fetched', await svc.listApprovals(req.query));
}

async function getApprovalById(req, res) {
  const approval = await svc.getApprovalById(req.params.approvalId);
  if (!approval) return notFoundResponse(res, 'Approval not found');
  return successResponse(res, 'Approval fetched', approval);
}

async function approve(req, res) {
  const { comments } = req.body;
  const result = await svc.approve(req.params.approvalId, req.user.userId, comments, req.user.roleId);
  if (result.notFound) return notFoundResponse(res, 'Approval not found');
  if (result.alreadyDecided) return conflictResponse(res, 'Approval has already been decided');
  if (result.forbidden) return forbiddenResponse(res, 'Only the quote rep can approve Level 1');
  if (result.lowerLevelPending) return conflictResponse(res, 'A lower-level approval is still pending');
  return successResponse(res, 'Approved successfully');
}

async function reject(req, res) {
  const { comments } = req.body;
  if (!comments) return badRequestResponse(res, 'comments are required when rejecting');
  const result = await svc.reject(req.params.approvalId, req.user.userId, comments);
  if (result.notFound) return notFoundResponse(res, 'Approval not found');
  if (result.alreadyDecided) return conflictResponse(res, 'Approval has already been decided');
  return successResponse(res, 'Rejected — quote status updated');
}

async function returnForEdit(req, res) {
  const { comments } = req.body;
  const result = await svc.returnForEdit(req.params.approvalId, req.user.userId, comments);
  if (result.notFound) return notFoundResponse(res, 'Approval not found');
  if (result.alreadyDecided) return conflictResponse(res, 'Approval has already been decided');
  return successResponse(res, 'Quote returned for edit');
}

module.exports = { listApprovals, getApprovalById, approve, reject, returnForEdit };
