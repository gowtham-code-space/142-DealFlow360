const { v4: uuidv4 } = require('uuid');
const notifModel = require('./notifications.model');
const { NotificationType, Defaults } = require('../../constants');

async function listNotifications(userId, { page = Defaults.PAGE, pageSize = Defaults.PAGE_SIZE, isRead } = {}) {
  const skip = (page - 1) * pageSize;
  const where = { userId };
  if (isRead !== undefined) where.isRead = isRead === 'true' || isRead === true;

  const [items, total] = await Promise.all([
    notifModel.findNotifications({ where, skip, take: Number(pageSize) }),
    notifModel.countNotifications(where)
  ]);
  return { items, total, page: Number(page), pageSize: Number(pageSize), totalPages: Math.ceil(total / pageSize) };
}

async function markAsRead(id, userId) {
  const notif = await notifModel.findNotificationByIdAndUser(id, userId);
  if (!notif) return { notFound: true };

  return notifModel.updateNotification(id, { isRead: true });
}

async function markAllAsRead(userId) {
  return notifModel.updateManyNotifications({ userId, isRead: false }, { isRead: true });
}

async function createNotification({ userId, title, message, type = NotificationType.SYSTEM_ALERT, link }) {
  return notifModel.createNotification({
    id: uuidv4(),
    userId,
    title,
    message,
    type,
    link,
    isRead: false
  });
}

module.exports = {
  listNotifications, markAsRead, markAllAsRead, createNotification
};
