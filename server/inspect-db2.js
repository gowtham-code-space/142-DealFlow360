const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  // Check quotations with status CUSTOMER_NEGOTIATION or APPROVED
  const negotiationQuotes = await prisma.quotation.findMany({
    where: { status: { in: ['CUSTOMER_NEGOTIATION', 'APPROVED', 'SENT_TO_CUSTOMER'] } },
    select: { id: true, quotationNumber: true, status: true, repId: true }
  });
  console.log('=== NEGOTIABLE QUOTES ===');
  console.log(JSON.stringify(negotiationQuotes, null, 2));

  // Get all quotation statuses
  const allStatuses = await prisma.quotation.findMany({
    select: { id: true, quotationNumber: true, status: true }
  });
  console.log('\n=== ALL QUOTE STATUSES ===');
  console.log(JSON.stringify(allStatuses, null, 2));

  // Check which user IDs actually exist in users table
  const salesReps = await prisma.user.findMany({
    where: { roleId: 'SALES_REP' },
    select: { id: true, name: true, roleId: true }
  });
  console.log('\n=== SALES REP USERS ===');
  console.log(JSON.stringify(salesReps, null, 2));

  // Verify Negotiation table has quotationId FK issue
  const orphanedMsgs = await prisma.$queryRaw`
    SELECT n.id, n.quotation_id, n.sender_id, n.message 
    FROM negotiations n 
    LEFT JOIN quotations q ON q.id = n.quotation_id 
    WHERE q.id IS NULL
    LIMIT 10
  `;
  console.log('\n=== ORPHANED NEGOTIATION MESSAGES (bad FK) ===');
  console.log(JSON.stringify(orphanedMsgs, null, 2));
}

run().catch(console.error).finally(() => prisma.$disconnect());
