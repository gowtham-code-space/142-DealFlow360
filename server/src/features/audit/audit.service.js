const { v4: uuidv4 } = require('uuid');
const auditModel = require('./audit.model');

async function getQuoteAuditLogs(quotationId, { page = 1, pageSize = 20 } = {}) {
  const skip = (page - 1) * pageSize;
  const where = { quotationId };

  const [items, total] = await Promise.all([
    auditModel.findAuditLogs({ where, skip, take: Number(pageSize) }),
    auditModel.countAuditLogs(where)
  ]);
  return { items, total, page: Number(page), pageSize: Number(pageSize), totalPages: Math.ceil(total / pageSize) };
}

async function getGlobalAuditLogs({ page = 1, pageSize = 20, userId, action, dateFrom, dateTo } = {}) {
  const skip = (page - 1) * pageSize;
  const where = {};
  if (userId) where.performedById = userId;
  if (action) where.action = action;
  if (dateFrom || dateTo) {
    where.createdAt = {};
    if (dateFrom) where.createdAt.gte = new Date(dateFrom);
    if (dateTo) where.createdAt.lte = new Date(dateTo);
  }

  const [items, total] = await Promise.all([
    auditModel.findAuditLogs({ where, skip, take: Number(pageSize) }),
    auditModel.countAuditLogs(where)
  ]);
  return { items, total, page: Number(page), pageSize: Number(pageSize), totalPages: Math.ceil(total / pageSize) };
}

async function logAction({ quotationId, entityType, entityId, action, performedBy, description, oldValues, newValues }) {
  try {
    return await auditModel.createAuditLog({
      id: uuidv4(),
      quotationId,
      entityType,
      entityId: String(entityId),
      action,
      performedById: performedBy?.id,
      performedByName: performedBy?.name,
      performedByRole: performedBy?.role,
      description,
      oldValues: oldValues ? JSON.stringify(oldValues) : undefined,
      newValues: newValues ? JSON.stringify(newValues) : undefined
    });
  } catch (err) {
    console.error('Failed to write audit log:', err.message);
  }
}

module.exports = {
  getQuoteAuditLogs, getGlobalAuditLogs, logAction
};
