// Uses native fetch (Node 18+)
const jwt = require('jsonwebtoken');
require('dotenv').config();

async function testRest() {
  const secret = process.env.JWT_SECRET || 'dealflow360_super_secret_jwt_key_2024';
  const token = jwt.sign(
    { userId: 'bf8feed3-e2e0-4403-a199-323236699a1a', roleId: 'SALES_REP' },
    secret,
    { expiresIn: '1h' }
  );

  const QUOTE_ID = '07a3163c-78fd-47ce-b742-0fd0395d733d';

  // Test GET /quotes/:id
  const qRes = await fetch(`http://localhost:5000/api/v1/quotes/${QUOTE_ID}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const qData = await qRes.json();
  console.log(`=== GET /quotes/${QUOTE_ID} ===`);
  console.log(`status=${qRes.status} success=${qData.success}`);
  if (qData.data) {
    console.log(`  id=${qData.data.id} quotationNumber=${qData.data.quotationNumber} status=${qData.data.status}`);
    console.log(`  customer=${qData.data.customer?.name} tier=${qData.data.customer?.tier}`);
    console.log(`  items=${qData.data.items?.length}`);
  }

  // Test GET /quotes/:id/negotiations
  const nRes = await fetch(`http://localhost:5000/api/v1/quotes/${QUOTE_ID}/negotiations`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const nData = await nRes.json();
  console.log(`\n=== GET /quotes/${QUOTE_ID}/negotiations ===`);
  console.log(`status=${nRes.status} success=${nData.success} count=${nData.data?.length}`);
  nData.data?.forEach(m => {
    console.log(`  [${m.senderRole}] "${m.message}" by ${m.sender?.name}`);
  });

  // Test GET /quotes/:id/negotiation-tickets
  const tRes = await fetch(`http://localhost:5000/api/v1/quotes/${QUOTE_ID}/negotiation-tickets`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const tData = await tRes.json();
  console.log(`\n=== GET /quotes/${QUOTE_ID}/negotiation-tickets ===`);
  console.log(`status=${tRes.status} success=${tData.success} count=${tData.data?.length}`);
  tData.data?.forEach(t => {
    console.log(`  ticket ${t.id} status=${t.status} requestedDiscount=${t.requestedDiscountPct}%`);
  });
}

testRest().catch(console.error);
