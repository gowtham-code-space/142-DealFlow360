const authService = require('./auth.service');
const authModel = require('./auth.model');
const {
  successResponse, createdResponse,
  badRequestResponse, unauthorizedResponse, conflictResponse
} = require('../../utils/response');

async function signup(req, res) {
  const { name, email, password, phone } = req.body;
  if (!name || !email || !password) return badRequestResponse(res, 'name, email and password are required');
  if (password.length < 6) return badRequestResponse(res, 'Password must be at least 6 characters');

  const result = await authService.signup(name, email, password, phone);
  if (result.conflict) {
    return res.status(409).json({
      success: false,
      conflict: true,
      isEmployee: result.isEmployee,
      role: result.role,
      message: result.message || 'An account with this email already exists'
    });
  }

  res.cookie('refreshToken', result.refreshToken, authService.COOKIE_OPTIONS);
  return createdResponse(res, 'Account created successfully', {
    accessToken: result.accessToken,
    refreshToken: result.refreshToken,
    user: {
      id: result.user.id,
      email: result.user.email,
      name: result.user.name,
      role: result.user.role,
      roleId: result.user.roleId || result.user.role
    }
  });
}

async function login(req, res) {
  const { email, password } = req.body;
  if (!email || !password) return badRequestResponse(res, 'email and password are required');

  const result = await authService.loginInternal(email, password);
  if (result.invalid) return unauthorizedResponse(res, 'Invalid email or password');

  res.cookie('refreshToken', result.refreshToken, authService.COOKIE_OPTIONS);
  return successResponse(res, 'Login successful', {
    accessToken: result.accessToken,
    refreshToken: result.refreshToken,
    user: {
      id: result.user.id,
      email: result.user.email,
      name: result.user.name,
      role: result.user.role,
      roleId: result.user.roleId || result.user.role
    }
  });
}

async function portalLogin(req, res) {
  const { email, password } = req.body;
  if (!email || !password) return badRequestResponse(res, 'email and password are required');

  const result = await authService.loginPortal(email, password);
  if (result.invalid) return unauthorizedResponse(res, 'Invalid email or password');

  res.cookie('refreshToken', result.refreshToken, authService.COOKIE_OPTIONS);
  return successResponse(res, 'Portal login successful', {
    accessToken: result.accessToken,
    refreshToken: result.refreshToken,
    user: {
      id: result.user.id,
      email: result.user.email,
      name: result.user.name,
      role: result.user.role,
      roleId: result.user.roleId || result.user.role
    }
  });
}

async function googleAuth(req, res) {
  const { credential, token, idToken, mode } = req.body;
  const rawToken = credential || token || idToken;
  if (!rawToken) {
    return badRequestResponse(res, 'Google credential or idToken is required');
  }

  if (mode === 'signup') {
    const result = await authService.signupWithGoogle({ token: rawToken });
    if (result.conflict) {
      return res.status(409).json({
        success: false,
        conflict: true,
        isEmployee: result.isEmployee,
        role: result.role,
        roleId: result.roleId || result.role,
        message: result.message
      });
    }
    if (result.invalid) {
      return unauthorizedResponse(res, result.error || 'Google registration failed');
    }

    res.cookie('refreshToken', result.refreshToken, authService.COOKIE_OPTIONS);
    return createdResponse(res, 'Google account registered successfully', {
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
      user: {
        id: result.user.id,
        email: result.user.email,
        name: result.user.name,
        role: result.user.role,
        roleId: result.user.roleId || result.user.role
      }
    });
  }

  // Default: Login mode
  const result = await authService.loginWithGoogle({ token: rawToken });
  if (result.notFound) {
    return res.status(404).json({
      success: false,
      notFound: true,
      message: result.error || 'No account found with this Google email. Please sign up first.'
    });
  }
  if (result.invalid) {
    return unauthorizedResponse(res, result.error || 'Google authentication failed');
  }

  res.cookie('refreshToken', result.refreshToken, authService.COOKIE_OPTIONS);
  return successResponse(res, 'Google authentication successful', {
    accessToken: result.accessToken,
    refreshToken: result.refreshToken,
    user: {
      id: result.user.id,
      email: result.user.email,
      name: result.user.name,
      role: result.user.role,
      roleId: result.user.roleId || result.user.role
    }
  });
}

async function refresh(req, res) {
  const token = req.cookies?.refreshToken;
  if (!token) return unauthorizedResponse(res, 'Refresh token not found — please log in again');

  const result = await authService.refreshTokens(token);
  if (result.invalid) return unauthorizedResponse(res, 'Refresh token not found or has been revoked — please log in again');

  res.cookie('refreshToken', result.refreshToken, authService.COOKIE_OPTIONS);
  return successResponse(res, 'Token refreshed', { accessToken: result.accessToken });
}

async function logout(req, res) {
  res.clearCookie('refreshToken');
  return successResponse(res, 'Logged out successfully');
}

async function me(req, res) {
  const user = await authService.getMe(req.user.userId);
  if (!user) return unauthorizedResponse(res);
  return successResponse(res, 'Profile fetched', user);
}

async function changePassword(req, res) {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) return badRequestResponse(res, 'currentPassword and newPassword are required');
  if (newPassword.length < 8) return badRequestResponse(res, 'New password must be at least 8 characters');

  const result = await authService.changePassword(req.user.userId, currentPassword, newPassword);
  if (result.notFound) return unauthorizedResponse(res);
  if (result.invalid) return badRequestResponse(res, 'Current password is incorrect');

  return successResponse(res, 'Password changed successfully');
}

async function getRoles(req, res) {
  const roles = await authModel.getAllRoles();
  return successResponse(res, 'Roles retrieved successfully', roles);
}

module.exports = { signup, login, portalLogin, googleAuth, refresh, logout, me, changePassword, getRoles };
