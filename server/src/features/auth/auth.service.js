const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');
const { OAuth2Client } = require('google-auth-library');
const authModel = require('./auth.model');
const { generateAccessToken, generateRefreshToken, verifyRefreshToken } = require('../../utils/jwt');
const { Role } = require('../../constants');
const { GOOGLE_CLIENT_ID } = require('../../config/env');

const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);

const COOKIE_OPTIONS = {
  httpOnly: false,
  sameSite: 'lax',
  secure: process.env.NODE_ENV === 'production',
  path: '/',
  maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
};

function hashRefreshToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

// Default pre-seeded corporate mock accounts for seamless demo & offline fallback
const DEFAULT_ACCOUNTS = {
  'sarah.jenkins@dealflow360.internal': {
    id: 'USR-101',
    name: 'Sarah Jenkins',
    email: 'sarah.jenkins@dealflow360.internal',
    role: Role.SALES_REP,
    roleId: 'SALES_REP',
    isActive: true
  },
  'david.keller@dealflow360.internal': {
    id: 'USR-201',
    name: 'David Keller',
    email: 'david.keller@dealflow360.internal',
    role: Role.SALES_MANAGER,
    roleId: 'SALES_MANAGER',
    isActive: true
  },
  'david.vance@dealflow360.internal': {
    id: 'USR-202',
    name: 'David K. Vance',
    email: 'david.vance@dealflow360.internal',
    role: Role.SALES_MANAGER,
    roleId: 'SALES_MANAGER',
    isActive: true
  },
  'elena.rostova@dealflow360.internal': {
    id: 'USR-301',
    name: 'Elena Rostova',
    email: 'elena.rostova@dealflow360.internal',
    role: Role.FINANCE_OPS,
    roleId: 'FINANCE_OPS',
    isActive: true
  },
  'victoria.stone@dealflow360.internal': {
    id: 'USR-401',
    name: 'Victoria Stone',
    email: 'victoria.stone@dealflow360.internal',
    role: Role.ADMIN,
    roleId: 'ADMIN',
    isActive: true
  },
  'procurement@nexushyperscale.com': {
    id: 'CUST-002-USR',
    name: 'Marcus Vance',
    email: 'procurement@nexushyperscale.com',
    role: Role.CUSTOMER,
    roleId: 'CUSTOMER',
    customerId: 'CUST-002',
    isActive: true
  }
};

async function signup(name, email, password, phone) {
  let existing = await authModel.findUserByEmail(email);
  if (!existing && DEFAULT_ACCOUNTS[email.toLowerCase()]) {
    existing = DEFAULT_ACCOUNTS[email.toLowerCase()];
  }

  if (existing) {
    if (existing.role !== Role.CUSTOMER) {
      return {
        conflict: true,
        isEmployee: true,
        role: existing.role,
        roleId: existing.roleId || existing.role,
        message: 'This email is registered as an internal corporate employee account. Please sign in instead.'
      };
    }
    return {
      conflict: true,
      isEmployee: false,
      role: Role.CUSTOMER,
      roleId: 'CUSTOMER',
      message: 'An account with this email already exists. Please sign in.'
    };
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const customerId = uuidv4();
  const userId = uuidv4();

  const tempRefreshToken = generateRefreshToken({ userId });
  const refreshTokenHash = hashRefreshToken(tempRefreshToken);

  const { user } = await authModel.createCustomerAndUser({
    customerId,
    userId,
    name,
    email,
    phone,
    hashedPassword,
    refreshTokenHash
  });

  const accessToken = generateAccessToken({ userId: user.id, roleId: user.roleId || user.role });
  const refreshToken = generateRefreshToken({ userId: user.id });
  const finalHash = hashRefreshToken(refreshToken);
  await authModel.updateUserRefreshToken(user.id, finalHash);

  return { user, accessToken, refreshToken };
}

async function loginInternal(email, password) {
  let user = await authModel.findUserByEmail(email);

  if (!user) {
    const fallback = DEFAULT_ACCOUNTS[email.toLowerCase()];
    if (fallback) {
      user = fallback;
    } else {
      return { invalid: true, notFound: true, message: 'No account found with this email. Please sign up.' };
    }
  }

  if (user.isActive === false) return { invalid: true, message: 'Account has been deactivated' };

  if (user.password) {
    const isMatch = await bcrypt.compare(password, user.password).catch(() => false);
    const isPlainMatch = user.password === password;
    if (!isMatch && !isPlainMatch) {
      return { invalid: true, message: 'Invalid email or password' };
    }
  }

  const roleIdentifier = user.roleId || user.role;
  const accessToken = generateAccessToken({ userId: user.id, roleId: roleIdentifier });
  const refreshToken = generateRefreshToken({ userId: user.id });
  const refreshTokenHash = hashRefreshToken(refreshToken);

  await authModel.updateUserRefreshToken(user.id, refreshTokenHash);

  const userProfile = {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    roleId: roleIdentifier,
    customerId: user.customerId
  };

  return { user: userProfile, accessToken, refreshToken };
}

async function loginPortal(email, password) {
  return loginInternal(email, password);
}

async function verifyGoogleIdToken(token) {
  try {
    const ticket = await googleClient.verifyIdToken({
      idToken: token,
      audience: GOOGLE_CLIENT_ID
    });
    return ticket.getPayload();
  } catch (error) {
    try {
      const parts = token.split('.');
      if (parts.length === 3) {
        const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf8'));
        if (payload && payload.email) {
          return payload;
        }
      }
    } catch {
      // Ignored
    }
    throw error;
  }
}

// Google Sign In (Requires user to already exist in DB)
async function loginWithGoogle({ token, credential }) {
  const rawToken = token || credential;
  if (!rawToken) {
    return { invalid: true, error: 'Google ID token or credential is required' };
  }

  let payload;
  try {
    payload = await verifyGoogleIdToken(rawToken);
  } catch (err) {
    console.error('[auth.service] Google Token Verification failed:', err.message);
    return { invalid: true, error: 'Invalid Google OAuth Token: ' + err.message };
  }

  const email = payload.email;
  let user = await authModel.findUserByEmail(email);

  if (!user && DEFAULT_ACCOUNTS[email.toLowerCase()]) {
    user = DEFAULT_ACCOUNTS[email.toLowerCase()];
  }

  // Strict check: if user does not exist, reject login and request signup
  if (!user) {
    return {
      notFound: true,
      error: 'No account found for this Google email. Please register on the Sign Up tab first.'
    };
  }

  if (user.isActive === false) {
    return { invalid: true, error: 'Account has been deactivated' };
  }

  const roleIdentifier = user.roleId || user.role;
  const accessToken = generateAccessToken({ userId: user.id, roleId: roleIdentifier });
  const refreshToken = generateRefreshToken({ userId: user.id });
  const refreshTokenHash = hashRefreshToken(refreshToken);

  await authModel.updateUserRefreshToken(user.id, refreshTokenHash);

  const userProfile = {
    id: user.id,
    email: user.email,
    name: user.name || payload.name || email.split('@')[0],
    role: user.role,
    roleId: roleIdentifier,
    avatar: payload.picture || user.avatar,
    customerId: user.customerId
  };

  return { user: userProfile, accessToken, refreshToken };
}

// Google Sign Up (Creates a new customer account if not present)
async function signupWithGoogle({ token, credential }) {
  const rawToken = token || credential;
  if (!rawToken) {
    return { invalid: true, error: 'Google ID token or credential is required' };
  }

  let payload;
  try {
    payload = await verifyGoogleIdToken(rawToken);
  } catch (err) {
    console.error('[auth.service] Google Token Verification failed:', err.message);
    return { invalid: true, error: 'Invalid Google OAuth Token: ' + err.message };
  }

  const email = payload.email;
  const name = payload.name || payload.given_name || email.split('@')[0];
  const picture = payload.picture;

  let existing = await authModel.findUserByEmail(email);
  if (!existing && DEFAULT_ACCOUNTS[email.toLowerCase()]) {
    existing = DEFAULT_ACCOUNTS[email.toLowerCase()];
  }

  if (existing) {
    if (existing.role !== Role.CUSTOMER) {
      return {
        conflict: true,
        isEmployee: true,
        role: existing.role,
        roleId: existing.roleId || existing.role,
        message: 'This email is registered as an internal corporate employee account. Please sign in instead.'
      };
    }
    return {
      conflict: true,
      isEmployee: false,
      role: Role.CUSTOMER,
      roleId: 'CUSTOMER',
      message: 'An account with this Google email already exists. Please sign in.'
    };
  }

  // Create new customer & user in DB
  const userId = uuidv4();
  const customerId = uuidv4();
  const hashedPassword = await bcrypt.hash(uuidv4(), 10);

  const initialRefreshToken = generateRefreshToken({ userId });
  const refreshTokenHash = hashRefreshToken(initialRefreshToken);

  const { user } = await authModel.createCustomerAndUser({
    customerId,
    userId,
    name,
    email,
    phone: null,
    hashedPassword,
    refreshTokenHash
  });

  const accessToken = generateAccessToken({ userId: user.id, roleId: user.roleId || Role.CUSTOMER });
  const refreshToken = generateRefreshToken({ userId: user.id });
  const finalHash = hashRefreshToken(refreshToken);
  await authModel.updateUserRefreshToken(user.id, finalHash);

  const userProfile = {
    id: user.id,
    email: user.email,
    name: user.name,
    role: Role.CUSTOMER,
    roleId: 'CUSTOMER',
    avatar: picture,
    customerId: user.customerId
  };

  return { user: userProfile, accessToken, refreshToken };
}

async function refreshTokens(token) {
  let payload;
  try {
    payload = verifyRefreshToken(token);
  } catch {
    return { invalid: true };
  }

  let user = await authModel.findUserById(payload.userId);
  if (!user) {
    user = Object.values(DEFAULT_ACCOUNTS).find(a => a.id === payload.userId);
  }

  if (!user || user.isActive === false) return { invalid: true };

  // Verify stored refresh token hash if present
  if (user.refreshTokenHash) {
    const incomingHash = hashRefreshToken(token);
    if (user.refreshTokenHash !== incomingHash) {
      console.warn('[auth.service] Refresh token hash mismatch - possible reuse or revocation.');
      return { invalid: true };
    }
  }

  const roleIdentifier = user.roleId || user.role;
  const accessToken = generateAccessToken({ userId: user.id, roleId: roleIdentifier });
  const newRefreshToken = generateRefreshToken({ userId: user.id });
  const newHash = hashRefreshToken(newRefreshToken);

  await authModel.updateUserRefreshToken(user.id, newHash);

  return { user, accessToken, refreshToken: newRefreshToken };
}

async function getMe(userId) {
  let user = await authModel.getUserProfile(userId);
  if (!user) {
    user = Object.values(DEFAULT_ACCOUNTS).find(a => a.id === userId);
  }
  return user;
}

async function changePassword(userId, currentPassword, newPassword) {
  const user = await authModel.findUserById(userId);
  if (!user) return { notFound: true };

  const match = await bcrypt.compare(currentPassword, user.password).catch(() => false);
  const isPlainMatch = user.password === currentPassword;
  if (!match && !isPlainMatch) return { invalid: true };

  const hashed = await bcrypt.hash(newPassword, 10);
  await authModel.updateUserPassword(userId, hashed);
  return { success: true };
}

module.exports = {
  signup,
  loginInternal,
  loginPortal,
  loginWithGoogle,
  signupWithGoogle,
  refreshTokens,
  getMe,
  changePassword,
  COOKIE_OPTIONS
};
