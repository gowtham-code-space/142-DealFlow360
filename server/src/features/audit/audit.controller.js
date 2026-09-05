const svc = require('./audit.service');
const { successResponse } = require('../../utils/response');

async function getQuoteAuditLogs(req, res) {
  const { page, pageSize } = req.query;
  const data = await svc.getQuoteAuditLogs(req.params.quoteId, { page, pageSize });
  return successResponse(res, 'Quote audit logs retrieved', data);
}

async function getGlobalAuditLogs(req, res) {
  const { page, pageSize, userId, action, dateFrom, dateTo } = req.query;
  const data = await svc.getGlobalAuditLogs({ page, pageSize, userId, action, dateFrom, dateTo });
  return successResponse(res, 'Global audit logs retrieved', data);
}

module.exports = {
  getQuoteAuditLogs, getGlobalAuditLogs
};
