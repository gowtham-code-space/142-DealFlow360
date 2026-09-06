const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  const users = await prisma.user.findMany({ where: { role: 'CUSTOMER' } });
  console.log('Customers:', users.map(u => u.email));
  const products = await prisma.product.findMany({ take: 2 });
  console.log('Products:', products.map(p => p.id));
}
run().catch(console.error).finally(() => prisma.$disconnect());
