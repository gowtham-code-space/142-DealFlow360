const io = require('socket.io-client');
const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const QUOTE_ID = '07a3163c-78fd-47ce-b742-0fd0395d733d'; // QT-2026-00004, CUSTOMER_NEGOTIATION
const secret = process.env.JWT_SECRET || 'dealflow360_super_secret_jwt_key_2024';

async function testSocket() {
  const prisma = new PrismaClient();

  // Count messages before
  const beforeCount = await prisma.negotiation.count({ where: { quotationId: QUOTE_ID } });
  console.log(`[Test] Messages before send: ${beforeCount}`);

  // Generate fresh token for DINESH M (SALES_REP)
  const token = jwt.sign(
    { userId: 'bf8feed3-e2e0-4403-a199-323236699a1a', roleId: 'SALES_REP' },
    secret,
    { expiresIn: '1h' }
  );

  console.log(`[Test] Connecting to socket with quoteId=${QUOTE_ID}`);

  const socket = io('http://127.0.0.1:5000', {
    auth: { token },
    reconnection: false,
    timeout: 5000
  });

  socket.on('connect', () => {
    console.log(`[Test] Connected: socketId=${socket.id}`);
    socket.emit('negotiation:join', { quoteId: QUOTE_ID });
  });

  socket.on('negotiation:joined', ({ quoteId, roomId }) => {
    console.log(`[Test] Joined room: quoteId=${quoteId} roomId=${roomId}`);
    
    setTimeout(() => {
      const testMessage = `Socket integration test — ${new Date().toISOString()}`;
      console.log(`[Test] Sending message: "${testMessage}"`);
      socket.emit('negotiation:message', {
        quoteId: QUOTE_ID,
        message: testMessage,
        proposedDiscount: null
      });
    }, 500);
  });

  socket.on('negotiation:message:new', async (msg) => {
    console.log(`[Test] Received broadcast: id=${msg.id} message="${msg.message}"`);
    
    // Verify in DB
    const afterCount = await prisma.negotiation.count({ where: { quotationId: QUOTE_ID } });
    const dbMsg = await prisma.negotiation.findUnique({ where: { id: msg.id } });
    
    console.log(`[Test] Messages after send: ${afterCount} (expected: ${beforeCount + 1})`);
    console.log(`[Test] DB verification: ${dbMsg ? 'PASS - message persisted' : 'FAIL - message NOT in DB'}`);
    
    if (dbMsg) {
      console.log(`[Test] DB record: quotationId=${dbMsg.quotationId} senderId=${dbMsg.senderId} senderRole=${dbMsg.senderRole}`);
    }

    await prisma.$disconnect();
    socket.disconnect();
    console.log(`\n[Test] === RESULT: ${dbMsg ? 'SUCCESS' : 'FAILURE'} ===`);
    process.exit(dbMsg ? 0 : 1);
  });

  socket.on('negotiation:error', (err) => {
    console.error(`[Test] SOCKET ERROR:`, err);
    prisma.$disconnect().then(() => process.exit(1));
  });

  socket.on('connect_error', (err) => {
    console.error(`[Test] CONNECT ERROR:`, err.message);
    prisma.$disconnect().then(() => process.exit(1));
  });

  // Timeout
  setTimeout(() => {
    console.error('[Test] TIMEOUT - No response received');
    prisma.$disconnect().then(() => process.exit(1));
  }, 10000);
}

testSocket().catch((err) => {
  console.error('[Test] Fatal error:', err);
  process.exit(1);
});
