const express = require('express');
const router = express.Router();
const ctrl = require('./notifications.controller');
const authenticate = require('../../middleware/auth.middleware');

router.get('/notifications', authenticate, ctrl.listNotifications);
router.patch('/notifications/:notificationId/read', authenticate, ctrl.markNotificationRead);
router.post('/notifications/mark-all-read', authenticate, ctrl.markAllNotificationsRead);

module.exports = router;
