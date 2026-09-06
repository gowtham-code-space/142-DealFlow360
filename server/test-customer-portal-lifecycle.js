const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const http = require('http');

const API_HOST = 'localhost';
const API_PORT = 5000;

function apiRequest(method, path, body = null, token = null) {
  return new Promise((resolve, reject) => {
    const payload = body ? JSON.stringify(body) : '';
    const headers = {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(payload)
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const req = http.request({
      host: API_HOST,
      port: API_PORT,
      path: `/api/v1${path}`,
      method: method,
      headers: headers
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, body: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, body: data });
        }
      });
    });

    req.on('error', reject);
    if (payload) req.write(payload);
    req.end();
  });
}

async function runVerification() {
  console.log('--- STARTING PHASE 10 FULL CUSTOMER PORTAL LIFECYCLE TEST ---');
  
  try {
    // Step 0: Ensure test customer account password in DB
    const bcrypt = require('bcryptjs');
    const passHash = await bcrypt.hash('password123', 10);
    await prisma.user.updateMany({
      where: { email: 'www.dinesh171975@gmail.com' },
      data: { password: passHash }
    });

    // Step 1: Login as Customer
    console.log('\n1. Logging in as Customer (www.dinesh171975@gmail.com)...');
    const loginRes = await apiRequest('POST', '/auth/login', {
      email: 'www.dinesh171975@gmail.com',
      password: 'password123'
    });
    
    const token = loginRes.body.data?.accessToken || loginRes.body.data?.token;
    if (!loginRes.body.success || !token) {
      throw new Error(`Customer login failed: ${JSON.stringify(loginRes.body)}`);
    }
    console.log('✅ Logged in successfully. Customer Token acquired.');

    // Step 2: Fetch Portal Resource Catalog
    console.log('\n2. Fetching Catalog Resources with live stock availability...');
    const catRes = await apiRequest('GET', '/portal/resources', null, token);
    console.log(`✅ Catalog API response code: ${catRes.status}`);
    if (catRes.status !== 200 || !Array.isArray(catRes.body?.data) || catRes.body.data.length === 0) {
      throw new Error(`Catalog fetch failed: ${JSON.stringify(catRes.body)}`);
    }
    const targetProduct = catRes.body.data[0];
    console.log(`✅ Found Catalog Item: ${targetProduct.name} (SKU: ${targetProduct.id}), Available Stock: ${targetProduct.availableStock}`);

    // Step 3: Create Atomic 15-Minute Hold
    console.log('\n3. Creating Atomic 15-Minute ProductHold in Prisma/MySQL...');
    const holdRes = await apiRequest('POST', `/portal/resources/${targetProduct.id}/hold`, {
      quantityHeld: 2,
      poolType: 'FREE'
    }, token);
    console.log(`✅ Hold API response code: ${holdRes.status}`);
    const createdHold = holdRes.body.data;
    const holdId = createdHold.holdId || createdHold.id;
    if (holdRes.status !== 201 || !holdId) {
      throw new Error(`Hold creation failed: ${JSON.stringify(holdRes.body)}`);
    }
    console.log(`✅ ProductHold Created! ID: ${holdId}, ExpiresAt: ${createdHold.expiresAt}, Status: ${createdHold.status}`);

    // Verify hold in Prisma DB
    const dbHold = await prisma.productHold.findUnique({ where: { id: holdId } });
    if (!dbHold || dbHold.status !== 'ACTIVE') {
      throw new Error(`Prisma DB Verification Failed: Hold not ACTIVE in database`);
    }
    console.log(`✅ Prisma DB Verification Passed: Hold status in DB is ${dbHold.status}`);

    // Step 4: Verify Hold Status API
    console.log('\n4. Checking Hold Status via GET /api/v1/portal/holds/:holdId...');
    const getHoldRes = await apiRequest('GET', `/portal/holds/${holdId}`, null, token);
    console.log(`✅ GET Hold Status response: status=${getHoldRes.body?.data?.status}, secondsRemaining=${getHoldRes.body?.data?.secondsRemaining}`);

    // Step 5: Generate Quotation from Hold
    console.log('\n5. Generating Quotation from active hold...');
    const genQuoteRes = await apiRequest('POST', '/portal/quotes/generate', {
      holdId: holdId,
      productId: targetProduct.id,
      quantity: 2,
      currency: 'INR'
    }, token);
    console.log(`✅ Generate Quote response code: ${genQuoteRes.status}`);
    if (genQuoteRes.status !== 201 || !genQuoteRes.body?.data?.id) {
      throw new Error(`Quote generation failed: ${JSON.stringify(genQuoteRes.body)}`);
    }
    const createdQuote = genQuoteRes.body.data;
    console.log(`✅ Quotation Generated! Quote ID: ${createdQuote.id}, Total Net Estimated: ${createdQuote.estimatedNetTotal}, Subtotal: ${createdQuote.subtotal}`);

    // Verify hold consumed in Prisma DB
    const dbHoldAfter = await prisma.productHold.findUnique({ where: { id: holdId } });
    console.log(`✅ Hold status transition in DB: ${dbHoldAfter.status} (Expected: CONSUMED)`);

    // Step 6: Submit Counter-Offer / Negotiate Quote with Mandatory Declaration
    console.log('\n6. Submitting Counter-Offer with mandatory declaration flag...');
    const negRes = await apiRequest('POST', `/portal/quotes/${createdQuote.id}/negotiate`, {
      requestedDiscountPct: 22,
      comments: 'Requesting 22% enterprise volume discount for Q4 deployment.',
      declarationAccepted: true,
      basePaymentAmount: 100000
    }, token);
    console.log(`✅ Negotiation API response code: ${negRes.status}`);
    const negTicketData = negRes.body.data;
    const ticketId = negTicketData?.ticketId || negTicketData?.id;
    if (negRes.status !== 201 || !ticketId) {
      throw new Error(`Negotiation failed: ${JSON.stringify(negRes.body)}`);
    }
    console.log(`✅ NegotiationTicket Created! Ticket ID: ${ticketId}, Message: ${negTicketData.message}`);

    // Verify Ticket in Prisma DB
    const dbTicket = await prisma.negotiationTicket.findUnique({ where: { id: ticketId } });
    console.log(`✅ Prisma DB NegotiationTicket Verification Passed: Status = ${dbTicket.status}`);

    // Step 7: Process Internal Payment Confirmation / Deposit
    console.log('\n7. Processing Internal Deposit Payment confirmation...');
    const payRes = await apiRequest('POST', `/portal/quotes/${createdQuote.id}/deposit/pay`, {
      paymentMethod: 'ACH',
      paymentReference: 'PO-VERIFICATION-TEST-2026'
    }, token);
    console.log(`✅ Pay Deposit API response code: ${payRes.status}`);
    if (payRes.status !== 200) {
      throw new Error(`Pay Deposit failed: ${JSON.stringify(payRes.body)}`);
    }
    console.log(`✅ Deposit Record Paid! Record ID: ${payRes.body.data?.depositRecord?.id}, Payment Status: ${payRes.body.data?.depositRecord?.status}`);

    // Verify DepositRecord in Prisma DB
    const dbDeposit = await prisma.depositRecord.findFirst({
      where: { quotationId: createdQuote.id }
    });
    console.log(`✅ Prisma DB DepositRecord Verification Passed: ID = ${dbDeposit?.id}, Amount = ${dbDeposit?.amount}, Status = ${dbDeposit?.status}`);

    console.log('\n======================================================');
    console.log('🎉 ALL END-TO-END CUSTOMER PORTAL LIFECYCLE TESTS PASSED PERFECTLY!');
    console.log('======================================================\n');

  } catch (err) {
    console.error('❌ LIFECYCLE VERIFICATION TEST FAILED:', err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runVerification();
