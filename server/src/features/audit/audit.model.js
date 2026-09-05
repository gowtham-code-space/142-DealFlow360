const prisma = require('../../config/db');

async function findAuditLogs({ where, skip, take }) {
  return prisma.auditLog.findMany({
    where,
    skip,
    take,
    orderBy: { createdAt: 'desc' }
  });
}

async function countAuditLogs(where) {
  return prisma.auditLog.count({ where });
}

async function createAuditLog(data) {
  return prisma.auditLog.create({ data });
}

module.exports = {
  findAuditLogs,
  countAuditLogs,
  createAuditLog
};
