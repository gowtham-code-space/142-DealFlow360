const svc = require('./notifications.service');
const { successResponse, notFoundResponse } = require('../../utils/response');

async function listNotifications(req, res) {
  const { page, pageSize, isRead } = req.query;
  const data = await svc.listNotifications(req.user?.id, { page, pageSize, isRead });
  return successResponse(res, 'Notifications retrieved', data);
}

async function markNotificationRead(req, res) {
  const result = await svc.markAsRead(req.params.notificationId, req.user?.id);
  if (result?.notFound) return notFoundResponse(res, 'Notification not found');
  return successResponse(res, 'Notification marked as read', result);
}

async function markAllNotificationsRead(req, res) {
  const result = await svc.markAllAsRead(req.user?.id);
  return successResponse(res, 'All notifications marked as read', result);
}

module.exports = {
  listNotifications, markNotificationRead, markAllNotificationsRead
};
