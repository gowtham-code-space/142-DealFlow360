const prisma = require('../../config/db');

const USER_SELECT = {
  id: true, email: true, name: true, roleId: true,
  customerId: true, isActive: true, createdAt: true, updatedAt: true
};

async function findUsers({ where, skip, take }) {
  return prisma.user.findMany({
    where,
    skip,
    take,
    select: USER_SELECT,
    orderBy: { createdAt: 'desc' }
  });
}

async function countUsers(where) {
  return prisma.user.count({ where });
}

async function findUserByEmail(email) {
  return prisma.user.findUnique({ where: { email } });
}

async function findUserById(id) {
  return prisma.user.findUnique({ where: { id }, select: USER_SELECT });
}

async function findFullUserById(id) {
  return prisma.user.findUnique({ where: { id } });
}

async function createUser(data) {
  return prisma.user.create({
    data,
    select: USER_SELECT
  });
}

async function updateUser(id, data) {
  return prisma.user.update({
    where: { id },
    data,
    select: USER_SELECT
  });
}

async function countActiveAdmins() {
  return prisma.user.count({
    where: { role: 'ADMIN', isActive: true }
  });
}

module.exports = {
  USER_SELECT,
  findUsers,
  countUsers,
  findUserByEmail,
  findUserById,
  findFullUserById,
  createUser,
  updateUser,
  countActiveAdmins
};
