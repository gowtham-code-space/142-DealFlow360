const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany();
  console.log(users.map(u => ({ id: u.id, email: u.email, role: u.roleId, customerId: u.customerId })));
  await prisma.$disconnect();
}

main();
