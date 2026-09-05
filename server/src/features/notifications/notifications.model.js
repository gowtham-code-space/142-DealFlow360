const prisma = require('../../config/db');

async function findNotifications({ where, skip, take }) {
  return prisma.notification.findMany({
    where,
    skip,
    take,
    orderBy: { createdAt: 'desc' }
  });
}

async function countNotifications(where) {
  return prisma.notification.count({ where });
}

async function findNotificationByIdAndUser(id, userId) {
  return prisma.notification.findFirst({ where: { id, userId } });
}

async function updateNotification(id, data) {
  return prisma.notification.update({ where: { id }, data });
}

async function updateManyNotifications(where, data) {
  return prisma.notification.updateMany({ where, data });
}

async function createNotification(data) {
  return prisma.notification.create({ data });
}

module.exports = {
  findNotifications,
  countNotifications,
  findNotificationByIdAndUser,
  updateNotification,
  updateManyNotifications,
  createNotification
};
