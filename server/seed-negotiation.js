const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  // Set QT-2026-00004 to CUSTOMER_NEGOTIATION status (it already has a test message)
  // This is the quote with id: 07a3163c-78fd-47ce-b742-0fd0395d733d, repId: USR-101
  const updated = await prisma.quotation.update({
    where: { id: '07a3163c-78fd-47ce-b742-0fd0395d733d' },
    data: { status: 'CUSTOMER_NEGOTIATION' },
    select: { id: true, quotationNumber: true, status: true, repId: true }
  });
  console.log('Updated quotation to CUSTOMER_NEGOTIATION:', JSON.stringify(updated, null, 2));

  // Also create a NegotiationTicket for it so the counterOffer section works
  const { v4: uuidv4 } = require('uuid');
  const existingTicket = await prisma.negotiationTicket.findFirst({
    where: { quoteId: '07a3163c-78fd-47ce-b742-0fd0395d733d' }
  });

  if (!existingTicket) {
    // Get customer for this quotation
    const q = await prisma.quotation.findUnique({
      where: { id: '07a3163c-78fd-47ce-b742-0fd0395d733d' },
      select: { customerId: true }
    });
    
    const ticket = await prisma.negotiationTicket.create({
      data: {
        id: uuidv4(),
        quoteId: '07a3163c-78fd-47ce-b742-0fd0395d733d',
        customerId: q.customerId,
        requestedDiscountPct: 22.0,
        comments: 'Customer requests 22% discount and Net 60 payment terms.',
        status: 'OPEN'
      }
    });
    console.log('Created NegotiationTicket:', JSON.stringify(ticket, null, 2));
  } else {
    console.log('Existing ticket found:', JSON.stringify(existingTicket, null, 2));
  }
}

run().catch(console.error).finally(() => prisma.$disconnect());
