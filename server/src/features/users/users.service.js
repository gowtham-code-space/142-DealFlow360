const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');
const userModel = require('./users.model');
const { Role, Defaults } = require('../../constants');

async function listUsers({ page = Defaults.PAGE, pageSize = Defaults.PAGE_SIZE, role, isActive }) {
  const skip = (page - 1) * pageSize;
  const where = {};
  if (role) where.role = role.toUpperCase();
  if (isActive !== undefined) where.isActive = isActive === 'true' || isActive === true;
  where.role = where.role || { not: Role.CUSTOMER };

  const [items, total] = await Promise.all([
    userModel.findUsers({ where, skip, take: Number(pageSize) }),
    userModel.countUsers(where)
  ]);
  return { items, total, page: Number(page), pageSize: Number(pageSize), totalPages: Math.ceil(total / pageSize) };
}

async function createUser({ name, email, password, role }) {
  const existing = await userModel.findUserByEmail(email);
  if (existing) return { conflict: true };

  const hashed = await bcrypt.hash(password, 10);
  const user = await userModel.createUser({
    id: uuidv4(),
    name,
    email,
    password: hashed,
    role: role.toUpperCase()
  });
  return { user };
}

async function bulkCreateUsers(users) {
  const created = [];
  const failed = [];

  for (const u of users) {
    try {
      const existing = await userModel.findUserByEmail(u.email);
      if (existing) { failed.push({ ...u, reason: 'Email already exists' }); continue; }

      const hashed = await bcrypt.hash(u.password, 10);
      const user = await userModel.createUser({
        id: uuidv4(),
        name: u.name,
        email: u.email,
        password: hashed,
        role: u.role.toUpperCase()
      });
      created.push(user);
    } catch (err) {
      failed.push({ ...u, reason: err.message });
    }
  }
  return { created, failed };
}

async function getUserById(id) {
  return userModel.findUserById(id);
}

async function updateUser(id, { name, role, isActive }) {
  const data = {};
  if (name !== undefined) data.name = name;
  if (role !== undefined) data.role = role.toUpperCase();
  if (isActive !== undefined) data.isActive = isActive;

  return userModel.updateUser(id, data);
}

async function softDeleteUser(id, requesterId) {
  if (id === requesterId) return { self: true };

  const user = await userModel.findFullUserById(id);
  if (!user) return { notFound: true };

  if (user.role === Role.ADMIN) {
    const adminCount = await userModel.countActiveAdmins();
    if (adminCount <= 1) return { lastAdmin: true };
  }

  await userModel.updateUser(id, { isActive: false });
  return { success: true };
}

async function reactivateUser(id) {
  const user = await userModel.findFullUserById(id);
  if (!user) return null;
  return userModel.updateUser(id, { isActive: true });
}

module.exports = { listUsers, createUser, bulkCreateUsers, getUserById, updateUser, softDeleteUser, reactivateUser };
