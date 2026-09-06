const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function verify() {
  const QUOTE_ID = '07a3163c-78fd-47ce-b742-0fd0395d733d';

  const quote = await prisma.quotation.findUnique({
    where: { id: QUOTE_ID },
    select: { id: true, quotationNumber: true, status: true, repId: true }
  });
  console.log('=== QUOTE ===');
  console.log(JSON.stringify(quote, null, 2));

  const messages = await prisma.negotiation.findMany({
    where: { quotationId: QUOTE_ID },
    include: { sender: { select: { id: true, name: true, roleId: true } } },
    orderBy: { createdAt: 'asc' }
  });
  console.log(`\n=== MESSAGES FOR QUOTE (count=${messages.length}) ===`);
  messages.forEach(m => {
    console.log(`  [${m.createdAt.toISOString()}] ${m.senderRole} (${m.sender?.name}) id=${m.id}`);
    console.log(`    msg: "${m.message}"`);
  });

  const ticket = await prisma.negotiationTicket.findFirst({
    where: { quoteId: QUOTE_ID }
  });
  console.log('\n=== NEGOTIATION TICKET ===');
  console.log(JSON.stringify(ticket, null, 2));
}

verify().catch(console.error).finally(() => prisma.$disconnect());
