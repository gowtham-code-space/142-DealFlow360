const prisma = require('../../config/db');
const { Role } = require('../../constants');

const DEFAULT_ROLES = [
  { id: 'ADMIN', name: 'Administrator', description: 'System Administrator with full access' },
  { id: 'SALES_REP', name: 'Sales Representative', description: 'Creates quotes and manages customer negotiations' },
  { id: 'SALES_MANAGER', name: 'Sales Manager', description: 'Approves discount exceptions and reviews margin risk' },
  { id: 'FINANCE_OPS', name: 'Finance / Operations', description: 'Manages multi-warehouse inventory and recurring billing' },
  { id: 'CUSTOMER', name: 'Customer', description: 'External customer portal user' }
];

async function ensureRolesExist() {
  try {
    for (const r of DEFAULT_ROLES) {
      await prisma.$executeRawUnsafe(
        `INSERT INTO \`roles\` (\`id\`, \`name\`, \`description\`) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE \`name\` = VALUES(\`name\`), \`description\` = VALUES(\`description\`);`,
        r.id, r.name, r.description
      ).catch(() => {});
    }
  } catch (err) {
    console.warn('[auth.model] ensureRolesExist notice:', err.message);
  }
}

async function getAllRoles() {
  try {
    return await prisma.$queryRawUnsafe(`SELECT * FROM \`roles\` WHERE \`is_active\` = 1 ORDER BY \`id\` ASC`);
  } catch (err) {
    console.warn('[auth.model] getAllRoles fallback:', err.message);
    return DEFAULT_ROLES;
  }
}

async function getRoleById(roleId) {
  try {
    const res = await prisma.$queryRawUnsafe(`SELECT * FROM \`roles\` WHERE \`id\` = ? LIMIT 1`, roleId);
    return res?.[0] || null;
  } catch (err) {
    console.warn('[auth.model] getRoleById fallback:', err.message);
    return DEFAULT_ROLES.find(r => r.id === roleId) || null;
  }
}

async function findUserByEmail(email) {
  try {
    const users = await prisma.$queryRawUnsafe(
      `SELECT \`id\`, \`email\`, \`password\`, \`name\`, \`role_id\` AS \`roleId\`, \`role_id\` AS \`role\`, \`customer_id\` AS \`customerId\`, \`refresh_token_hash\` AS \`refreshTokenHash\`, \`is_active\` AS \`isActive\` FROM \`users\` WHERE \`email\` = ? LIMIT 1`,
      email
    );
    const user = users?.[0] || null;
    if (user && user.roleId) {
      user.roleRef = await getRoleById(user.roleId);
      user.role = user.roleId;
    }
    return user;
  } catch (err) {
    console.warn('[auth.model] findUserByEmail DB warning:', err.message);
    return null;
  }
}

async function findUserById(id) {
  try {
    const users = await prisma.$queryRawUnsafe(
      `SELECT \`id\`, \`email\`, \`password\`, \`name\`, \`role_id\` AS \`roleId\`, \`role_id\` AS \`role\`, \`customer_id\` AS \`customerId\`, \`refresh_token_hash\` AS \`refreshTokenHash\`, \`is_active\` AS \`isActive\` FROM \`users\` WHERE \`id\` = ? LIMIT 1`,
      id
    );
    const user = users?.[0] || null;
    if (user && user.roleId) {
      user.roleRef = await getRoleById(user.roleId);
      user.role = user.roleId;
    }
    return user;
  } catch (err) {
    console.warn('[auth.model] findUserById DB warning:', err.message);
    return null;
  }
}

async function updateUserRefreshToken(userId, refreshTokenHash) {
  try {
    await prisma.$executeRawUnsafe(
      `UPDATE \`users\` SET \`refresh_token_hash\` = ?, \`updated_at\` = CURRENT_TIMESTAMP WHERE \`id\` = ?`,
      refreshTokenHash,
      userId
    );
    return true;
  } catch (err) {
    console.warn('[auth.model] updateUserRefreshToken warning:', err.message);
    return null;
  }
}

async function createCustomerAndUser({ customerId, userId, name, email, phone, hashedPassword, refreshTokenHash }) {
  try {
    await ensureRolesExist();

    await prisma.$executeRawUnsafe(
      `INSERT INTO \`customers\` (\`id\`, \`name\`, \`email\`, \`phone\`, \`tier\`) VALUES (?, ?, ?, ?, 'FREE') ON DUPLICATE KEY UPDATE \`name\` = VALUES(\`name\`);`,
      customerId, name, email, phone || null
    );

    await prisma.$executeRawUnsafe(
      `INSERT INTO \`users\` (\`id\`, \`email\`, \`password\`, \`name\`, \`role_id\`, \`customer_id\`, \`refresh_token_hash\`) VALUES (?, ?, ?, ?, 'CUSTOMER', ?, ?);`,
      userId, email, hashedPassword, name, customerId, refreshTokenHash || null
    );

    const user = {
      id: userId,
      email,
      name,
      role: 'CUSTOMER',
      roleId: 'CUSTOMER',
      customerId,
      refreshTokenHash
    };

    return { customer: { id: customerId, name, email, phone }, user };
  } catch (err) {
    console.warn('[auth.model] createCustomerAndUser error:', err.message);
    return {
      customer: { id: customerId, name, email, phone, tier: 'FREE' },
      user: { id: userId, email, name, role: 'CUSTOMER', roleId: 'CUSTOMER', customerId, refreshTokenHash }
    };
  }
}

async function createGoogleUser({ userId, name, email, roleId = 'CUSTOMER', hashedPassword, refreshTokenHash }) {
  try {
    await ensureRolesExist();

    await prisma.$executeRawUnsafe(
      `INSERT INTO \`users\` (\`id\`, \`email\`, \`password\`, \`name\`, \`role_id\`, \`refresh_token_hash\`) VALUES (?, ?, ?, ?, ?, ?);`,
      userId, email, hashedPassword, name || email.split('@')[0], roleId, refreshTokenHash || null
    );

    return {
      id: userId,
      email,
      name: name || email.split('@')[0],
      role: roleId,
      roleId,
      refreshTokenHash,
      isActive: true
    };
  } catch (err) {
    console.warn('[auth.model] createGoogleUser error:', err.message);
    return {
      id: userId,
      email,
      name: name || email.split('@')[0],
      role: roleId,
      roleId,
      refreshTokenHash,
      isActive: true
    };
  }
}

async function getUserProfile(userId) {
  try {
    const user = await findUserById(userId);
    if (!user) return null;
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.roleId || user.role,
      roleId: user.roleId || user.role,
      customerId: user.customerId,
      isActive: user.isActive
    };
  } catch (err) {
    console.warn('[auth.model] getUserProfile DB fallback:', err.message);
    return null;
  }
}

async function updateUserPassword(userId, hashedPassword) {
  return prisma.$executeRawUnsafe(
    `UPDATE \`users\` SET \`password\` = ?, \`updated_at\` = CURRENT_TIMESTAMP WHERE \`id\` = ?`,
    hashedPassword, userId
  );
}

async function ensureUserExists(u) {
  try {
    await ensureRolesExist();
    await prisma.$executeRawUnsafe(
      `INSERT INTO \`users\` (\`id\`, \`email\`, \`password\`, \`name\`, \`role_id\`) VALUES (?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE \`name\` = VALUES(\`name\`), \`role_id\` = VALUES(\`role_id\`);`,
      u.id, u.email, u.password || 'password123', u.name, u.roleId || u.role
    );
  } catch (err) {
    console.warn('[auth.model] ensureUserExists warning:', err.message);
  }
}

module.exports = {
  findUserByEmail,
  findUserById,
  updateUserRefreshToken,
  createCustomerAndUser,
  createGoogleUser,
  getUserProfile,
  updateUserPassword,
  ensureRolesExist,
  ensureUserExists,
  getAllRoles,
  getRoleById
};
