const prisma = require('../../config/db');

async function findUserByEmail(email) {
  return prisma.user.findUnique({ where: { email } });
}

async function findUserById(id) {
  return prisma.user.findUnique({ where: { id } });
}

async function createCustomerAndUser({ customerId, userId, name, email, phone, hashedPassword }) {
  const customer = await prisma.customer.create({
    data: {
      id: customerId,
      name,
      email,
      phone: phone || null,
      tier: 'FREE'
    }
  });

  const user = await prisma.user.create({
    data: {
      id: userId,
      email,
      password: hashedPassword,
      name,
      role: 'CUSTOMER',
      customerId: customer.id
    }
  });

  return { customer, user };
}

async function getUserProfile(userId) {
  return prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true, email: true, name: true, role: true, roleId: true,
      customerId: true, isActive: true, createdAt: true, updatedAt: true,
      customer: {
        select: {
          id: true, name: true, email: true, tier: true, phone: true,
          address: true, creditLimit: true, isActive: true
        }
      }
    }
  });
}

async function updateUserPassword(userId, hashedPassword) {
  return prisma.user.update({
    where: { id: userId },
    data: { password: hashedPassword }
  });
}

module.exports = {
  findUserByEmail,
  findUserById,
  createCustomerAndUser,
  getUserProfile,
  updateUserPassword
};
