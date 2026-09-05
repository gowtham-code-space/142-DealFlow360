const express = require('express');
const router = express.Router();
const ctrl = require('./auth.controller');
const authenticate = require('../../middleware/auth.middleware');


router.post('/signup', ctrl.signup);
router.post('/login', ctrl.login);
router.post('/portal/login', ctrl.portalLogin);
router.post('/google', ctrl.googleAuth);
router.post('/refresh', ctrl.refresh);
router.post('/logout', authenticate, ctrl.logout);
router.get('/me', authenticate, ctrl.me);
router.patch('/me/password', authenticate, ctrl.changePassword);

module.exports = router;

