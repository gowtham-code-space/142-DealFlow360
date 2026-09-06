const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');
require('dotenv').config();

async function main() {
  const prisma = new PrismaClient();
  
  // Get a fresh JWT by looking at the environment
  const secret = process.env.JWT_SECRET || 'dealflow360_super_secret_jwt_key_2024';
  
  // Generate a test token for DINESH M (SALES_REP)
  const token = jwt.sign(
    { userId: 'bf8feed3-e2e0-4403-a199-323236699a1a', roleId: 'SALES_REP' },
    secret,
    { expiresIn: '1h' }
  );
  
  console.log('=== TEST TOKEN (SALES_REP - DINESH M) ===');
  console.log(token);
  
  // Generate a test token for USR-101 (SALES_REP - Sarah Jenkins)
  const tokenSarah = jwt.sign(
    { userId: 'USR-101', roleId: 'SALES_REP' },
    secret,
    { expiresIn: '1h' }
  );
  console.log('\n=== TEST TOKEN (SALES_REP - USR-101/Sarah) ===');
  console.log(tokenSarah);

  // Verify the real quote exists
  const q = await prisma.quotation.findUnique({
    where: { id: '07a3163c-78fd-47ce-b742-0fd0395d733d' },
    select: { id: true, quotationNumber: true, status: true, repId: true }
  });
  console.log('\n=== TARGET QUOTE ===');
  console.log(JSON.stringify(q, null, 2));

  // Count current messages for this quote
  const msgCount = await prisma.negotiation.count({
    where: { quotationId: '07a3163c-78fd-47ce-b742-0fd0395d733d' }
  });
  console.log('\n=== CURRENT MESSAGE COUNT FOR QUOTE ===', msgCount);

  await prisma.$disconnect();
}

main().catch(console.error);
