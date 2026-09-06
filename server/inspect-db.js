const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  // Check what users exist (for senderId validation)
  const users = await prisma.user.findMany({
    select: { id: true, name: true, roleId: true, email: true },
    take: 10
  });
  console.log('=== USERS ===');
  console.log(JSON.stringify(users, null, 2));

  // Check quotation full structure for a known ID
  const q = await prisma.quotation.findFirst({
    select: { id: true, quotationNumber: true, status: true, repId: true, customerId: true }
  });
  console.log('\n=== FIRST QUOTATION ===');
  console.log(JSON.stringify(q, null, 2));

  // Check quotation with CUSTOMER_NEGOTIATION status
  const neg = await prisma.quotation.findFirst({
    where: { status: 'CUSTOMER_NEGOTIATION' },
    select: { id: true, quotationNumber: true, status: true, repId: true }
  });
  console.log('\n=== CUSTOMER_NEGOTIATION QUOTATION ===');
  console.log(JSON.stringify(neg, null, 2));

  // Check Negotiation (message) model structure
  const msgs = await prisma.negotiation.findMany({
    take: 5,
    select: { id: true, quotationId: true, senderId: true, senderRole: true, message: true, createdAt: true }
  });
  console.log('\n=== NEGOTIATION MESSAGES ===');
  console.log(JSON.stringify(msgs, null, 2));
}

run().catch(console.error).finally(() => prisma.$disconnect());
