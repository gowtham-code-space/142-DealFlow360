const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  const quotes = await prisma.quotation.findMany({ select: { id: true, quotationNumber: true } });
  console.log(quotes);
}

run().finally(() => prisma.$disconnect());
