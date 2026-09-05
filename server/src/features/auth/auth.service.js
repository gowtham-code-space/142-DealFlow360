const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const authModel = require('./auth.model');
const { generateAccessToken, generateRefreshToken, verifyRefreshToken } = require('../../utils/jwt');
const { Role } = require('../../constants');

const COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: 'strict',
  secure: process.env.NODE_ENV === 'production',
  maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
};

async function signup(name, email, password, phone) {
  const existing = await authModel.findUserByEmail(email);
  if (existing) return { conflict: true };

  const hashedPassword = await bcrypt.hash(password, 10);
  const customerId = uuidv4();
  const userId = uuidv4();

  const { user } = await authModel.createCustomerAndUser({
    customerId,
    userId,
    name,
    email,
    phone,
    hashedPassword
  });

  const accessToken = generateAccessToken({ userId: user.id, roleId: user.role });
  const refreshToken = generateRefreshToken({ userId: user.id });

  return { user, accessToken, refreshToken };
}

async function loginInternal(email, password) {
  const user = await authModel.findUserByEmail(email);
  if (!user || user.role === Role.CUSTOMER) return { invalid: true };
  if (!user.isActive) return { invalid: true };

  const match = await bcrypt.compare(password, user.password);
  if (!match) return { invalid: true };

  const accessToken = generateAccessToken({ userId: user.id, roleId: user.role });
  const refreshToken = generateRefreshToken({ userId: user.id });

  return { user, accessToken, refreshToken };
}

async function loginPortal(email, password) {
  const user = await authModel.findUserByEmail(email);
  if (!user || user.role !== Role.CUSTOMER) return { invalid: true };
  if (!user.isActive) return { invalid: true };

  const match = await bcrypt.compare(password, user.password);
  if (!match) return { invalid: true };

  const accessToken = generateAccessToken({ userId: user.id, roleId: user.role });
  const refreshToken = generateRefreshToken({ userId: user.id });

  return { user, accessToken, refreshToken };
}

async function refreshTokens(token) {
  let payload;
  try {
    payload = verifyRefreshToken(token);
  } catch {
    return { invalid: true };
  }

  const user = await authModel.findUserById(payload.userId);
  if (!user || !user.isActive) return { invalid: true };

  const accessToken = generateAccessToken({ userId: user.id, roleId: user.role });
  const newRefreshToken = generateRefreshToken({ userId: user.id });

  return { user, accessToken, refreshToken: newRefreshToken };
}

async function getMe(userId) {
  return authModel.getUserProfile(userId);
}

async function changePassword(userId, currentPassword, newPassword) {
  const user = await authModel.findUserById(userId);
  if (!user) return { notFound: true };

  const match = await bcrypt.compare(currentPassword, user.password);
  if (!match) return { invalid: true };

  const hashed = await bcrypt.hash(newPassword, 10);
  await authModel.updateUserPassword(userId, hashed);
  return { success: true };
}

module.exports = {
  signup,
  loginInternal,
  loginPortal,
  refreshTokens,
  getMe,
  changePassword,
  COOKIE_OPTIONS
};
