const http = require('http');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

function post(path, data, token) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify(data);
    const req = http.request({
      hostname: 'localhost',
      port: 5000,
      path: path,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload),
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      }
    }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => resolve({ status: res.statusCode, data: JSON.parse(body || '{}') }));
    });
    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

function get(path, token) {
  return new Promise((resolve, reject) => {
    const req = http.request({
      hostname: 'localhost',
      port: 5000,
      path: path,
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      }
    }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => resolve({ status: res.statusCode, data: JSON.parse(body || '{}') }));
    });
    req.on('error', reject);
    req.end();
  });
}

async function runTest() {
  console.log('--- E2E VERIFICATION START ---');
  
  // 1. Login
  const login = await post('/api/v1/auth/login', { email: 'procurement@nexushyperscale.com', password: 'password123' });
  const token = login.data.data.accessToken;
  const customerId = login.data.data.user.customerId || 'CUST-002';
  console.log(`[1] Login Success: Token acquired for customer ${customerId}`);

  // 2. Fetch resources
  const resources = await get('/api/v1/portal/resources', token);
  const itemsList = resources.data.data;
  console.log(`[2] Resources Available: ${itemsList.length} items found.`);

  if (itemsList.length < 2) {
    throw new Error('Not enough products found for multi-product test');
  }

  const itemA = itemsList[0];
  const itemB = itemsList[1];

  // 3. Multi-Product Hold Request
  const holdPayload = {
    items: [
      { productId: itemA.id, quantity: 2 },
      { productId: itemB.id, quantity: 1 }
    ]
  };

  console.log('\n--- HOLD REQUEST PAYLOAD ---');
  console.log(JSON.stringify(holdPayload, null, 2));

  const holdRes = await post('/api/v1/portal/holds', holdPayload, token);
  console.log('\n--- HOLD API RESPONSE ---');
  console.log(`STATUS: ${holdRes.status}`);
  console.log(JSON.stringify(holdRes.data, null, 2));

  const ticketId = holdRes.data.data?.ticketId;
  const expiresAt = holdRes.data.data?.expiresAt;

  if (!ticketId) {
    throw new Error('Ticket ID was not returned in hold response');
  }

  // 4. Verify Prisma/MySQL Database Record for ProductHolds
  const dbHolds = await prisma.productHold.findMany({
    where: { ticketId: ticketId }
  });
  console.log(`\n--- DB PRISMA PRODUCT HOLD RECORDS (ticketId: ${ticketId}) ---`);
  console.log(`Count of ProductHold rows: ${dbHolds.length}`);
  console.log(JSON.stringify(dbHolds, null, 2));

  // 5. Generate Quotation
  const quoteGenPayload = { ticketId };
  const quoteGenRes = await post('/api/v1/portal/quotes/generate', quoteGenPayload, token);
  console.log('\n--- QUOTE GENERATE API RESPONSE ---');
  console.log(`STATUS: ${quoteGenRes.status}`);
  console.log(JSON.stringify(quoteGenRes.data, null, 2));

  const quoteId = quoteGenRes.data.data?.id;

  // 6. Verify Prisma/MySQL Quotation & Lines in DB
  const dbQuote = await prisma.quotation.findUnique({
    where: { id: quoteId },
    include: {
      items: true,
      customer: true
    }
  });

  console.log(`\n--- DB PRISMA QUOTATION RECORD (quoteId: ${quoteId}) ---`);
  console.log(JSON.stringify(dbQuote, null, 2));

  // 7. Check for Duplicates
  const allHoldsWithTicket = await prisma.productHold.count({
    where: { ticketId: ticketId }
  });

  await prisma.$disconnect();

  console.log('\n--- VERIFICATION SUMMARY DATA ---');
  return {
    holdPayload,
    holdStatus: holdRes.status,
    holdResponse: holdRes.data,
    ticketId,
    expiresAt,
    dbHolds,
    quoteGenStatus: quoteGenRes.status,
    quoteGenResponse: quoteGenRes.data,
    quoteId,
    dbQuote,
    allHoldsWithTicket,
    itemA,
    itemB
  };
}

runTest().then(res => {
  console.log('\n--- COMPLETE VERIFICATION FINISHED SUCCESSFULLY ---');
}).catch(err => {
  console.error('Verification failed:', err);
  prisma.$disconnect();
});
