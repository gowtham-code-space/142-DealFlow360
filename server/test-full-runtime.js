const jwt = require('jsonwebtoken');
const { io } = require('socket.io-client');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { JWT_SECRET } = require('./src/config/env');

async function testFullRuntime() {
  console.log('=== STARTING FULL RUNTIME & DATABASE INTEGRATION TEST ===');

  // 1. Get real Sales Rep and Customer users from DB
  const salesRepUser = await prisma.user.findFirst({
    where: { roleId: 'SALES_REP' }
  });
  const customerUser = await prisma.user.findFirst({
    where: { roleId: 'CUSTOMER' }
  });

  console.log('[Test Setup] Sales Rep:', salesRepUser.id, salesRepUser.email);
  console.log('[Test Setup] Customer:', customerUser.id, customerUser.email);

  // 2. Get real CUSTOMER_NEGOTIATION quotation
  const realQuote = await prisma.quotation.findFirst({
    where: { status: 'CUSTOMER_NEGOTIATION' }
  });

  console.log('[Test Setup] Real Quote ID:', realQuote.id);
  console.log('[Test Setup] Real Quote Number:', realQuote.quotationNumber);

  // Generate tokens
  const salesToken = jwt.sign({ userId: salesRepUser.id, roleId: salesRepUser.roleId, email: salesRepUser.email }, JWT_SECRET, { expiresIn: '1h' });
  const customerToken = jwt.sign({ userId: customerUser.id, roleId: customerUser.roleId, email: customerUser.email }, JWT_SECRET, { expiresIn: '1h' });

  // 3. Test REST endpoints with both UUID and Quote Number
  const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

  // GET Quote by Quote Number
  const quoteByNumRes = await fetch(`http://localhost:5000/api/v1/quotes/${realQuote.quotationNumber}`, {
    headers: { Authorization: `Bearer ${salesToken}` }
  });
  console.log(`[REST Test] GET /quotes/${realQuote.quotationNumber} -> status ${quoteByNumRes.status}`);
  const quoteByNumData = await quoteByNumRes.json();
  if (quoteByNumRes.status !== 200 || !quoteByNumData.data?.id) {
    throw new Error('GET quote by quotationNumber failed');
  }

  // GET Quote by UUID
  const quoteByIdRes = await fetch(`http://localhost:5000/api/v1/quotes/${realQuote.id}`, {
    headers: { Authorization: `Bearer ${salesToken}` }
  });
  console.log(`[REST Test] GET /quotes/${realQuote.id} -> status ${quoteByIdRes.status}`);

  // GET Negotiations
  const negsRes = await fetch(`http://localhost:5000/api/v1/quotes/${realQuote.id}/negotiations`, {
    headers: { Authorization: `Bearer ${salesToken}` }
  });
  console.log(`[REST Test] GET /quotes/${realQuote.id}/negotiations -> status ${negsRes.status}`);

  // 4. Test Socket.IO end-to-end communication with real-time broadcast
  const testMessageText = `Socket test 001 - ${Date.now()}`;

  const socketSales = io('http://localhost:5000', { auth: { token: salesToken } });
  const socketCustomer = io('http://localhost:5000', { auth: { token: customerToken } });

  await new Promise((resolve, reject) => {
    let salesJoined = false;
    let customerJoined = false;
    let salesReceivedMsg = false;
    let customerReceivedMsg = false;

    socketSales.on('connect', () => {
      console.log('[Socket Test] Sales Rep connected socket id:', socketSales.id);
      // Join using quotationNumber (testing quote number resolution over socket!)
      socketSales.emit('negotiation:join', { quoteId: realQuote.quotationNumber });
    });

    socketCustomer.on('connect', () => {
      console.log('[Socket Test] Customer connected socket id:', socketCustomer.id);
      socketCustomer.emit('negotiation:join', { quoteId: realQuote.id });
    });

    socketSales.on('negotiation:joined', (data) => {
      console.log('[Socket Test] Sales Rep joined room:', data);
      salesJoined = true;
      if (salesJoined && customerJoined) triggerSend();
    });

    socketCustomer.on('negotiation:joined', (data) => {
      console.log('[Socket Test] Customer joined room:', data);
      customerJoined = true;
      if (salesJoined && customerJoined) triggerSend();
    });

    function triggerSend() {
      console.log('[Socket Test] Both clients joined. Sending test message via socket...');
      socketSales.emit('negotiation:message', {
        quoteId: realQuote.quotationNumber,
        message: testMessageText,
        proposedDiscount: 15
      });
    }

    socketSales.on('negotiation:message:new', (msg) => {
      console.log('[Socket Test] Sales Rep received broadcast:', msg.id, msg.message);
      if (msg.message === testMessageText) salesReceivedMsg = true;
      checkComplete();
    });

    socketCustomer.on('negotiation:message:new', (msg) => {
      console.log('[Socket Test] Customer received broadcast:', msg.id, msg.message);
      if (msg.message === testMessageText) customerReceivedMsg = true;
      checkComplete();
    });

    socketSales.on('negotiation:error', (err) => reject(new Error('Sales Socket Error: ' + JSON.stringify(err))));
    socketCustomer.on('negotiation:error', (err) => reject(new Error('Customer Socket Error: ' + JSON.stringify(err))));

    function checkComplete() {
      if (salesReceivedMsg && customerReceivedMsg) {
        console.log('[Socket Test] SUCCESS: Both Sales Rep and Customer received the real-time broadcast!');
        socketSales.disconnect();
        socketCustomer.disconnect();
        resolve();
      }
    }

    setTimeout(() => reject(new Error('Socket test timed out')), 8000);
  });

  // 5. Query Prisma/MySQL database after send to verify exact record
  const dbMsg = await prisma.negotiation.findFirst({
    where: { message: testMessageText },
    include: { quotation: true, sender: true }
  });

  console.log('\n=== DATABASE VERIFICATION RESULT ===');
  console.log(JSON.stringify({
    messageId: dbMsg.id,
    quotationId: dbMsg.quotationId,
    quotationNumber: dbMsg.quotation.quotationNumber,
    senderId: dbMsg.senderId,
    senderName: dbMsg.sender.name,
    senderRole: dbMsg.senderRole,
    message: dbMsg.message,
    proposedDiscount: dbMsg.proposedDiscount,
    createdAt: dbMsg.createdAt
  }, null, 2));

  if (!dbMsg || dbMsg.quotationId !== realQuote.id || dbMsg.senderId !== salesRepUser.id) {
    throw new Error('Database verification failed! Record in MySQL does not match requirements.');
  }

  console.log('\nALL VERIFICATIONS SUCCEEDED CLEANLY!');
}

testFullRuntime()
  .catch(err => {
    console.error('TEST FAILED:', err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
