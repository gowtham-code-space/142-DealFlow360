

const API = 'http://localhost:5001/api/v1';
let token = '';
let quoteId = '';

async function verify() {
  console.log("Starting Verification...");

  // 1. Backend Health
  try {
    const rRes = await fetch(`${API}/auth/roles`);
    if (!rRes.ok) throw new Error("Roles API failed");
    console.log("✅ Backend Health: PASS");
  } catch (e) {
    console.log("❌ Backend Health: FAIL", e.message);
    return;
  }

  // 2. Login
  try {
    const lRes = await fetch(`${API}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'sarah.jenkins@dealflow360.internal', password: 'password123' })
    });
    const lData = await lRes.json();
    if (!lData.success || !lData.data?.accessToken) throw new Error("Login failed");
    token = lData.data.accessToken;
    console.log("✅ Login & Auth: PASS");
  } catch (e) {
    console.log("❌ Login & Auth: FAIL", e.message);
  }

  const headers = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` };

  // 3. Dashboard
  try {
    const dRes = await fetch(`${API}/dashboard/summary?periodDays=30`, { headers });
    if (!dRes.ok) {
        const text = await dRes.text();
        throw new Error(`Dashboard summary failed: ${dRes.status} ${text}`);
    }
    console.log("✅ Dashboard: PASS");
  } catch (e) {
    console.log("❌ Dashboard: FAIL", e.message);
  }

  // 4. Customers
  let custId = '';
  try {
    const cRes = await fetch(`${API}/customers`, { headers });
    if (!cRes.ok) {
        const text = await cRes.text();
        throw new Error(`Customers failed: ${cRes.status} ${text}`);
    }
    const cData = await cRes.json();
    if (!cData.success) throw new Error("Customers failed in JSON: " + JSON.stringify(cData));
    custId = cData.data?.items?.[0]?.id || '';
    console.log("✅ Customers: PASS");
  } catch (e) {
    console.log("❌ Customers: FAIL", e.message);
  }

  // 5. Products & Warehouses & Inventory
  let prodId = '';
  try {
    const pRes = await fetch(`${API}/products`, { headers });
    const pData = await pRes.json();
    prodId = pData.data?.items?.[0]?.id || '';
    
    const wRes = await fetch(`${API}/warehouses`, { headers });
    const iRes = await fetch(`${API}/inventory`, { headers });
    if (!pRes.ok || !wRes.ok || !iRes.ok) throw new Error("Inventory APIs failed");
    console.log("✅ Inventory (Products/Warehouses): PASS");
  } catch (e) {
    console.log("❌ Inventory: FAIL", e.message);
  }

  // 6. Quotations List & Create
  try {
    const qListRes = await fetch(`${API}/quotes`, { headers });
    if (!qListRes.ok) throw new Error("Quote List failed");

    // Create quote
    const validUntil = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
    const qcRes = await fetch(`${API}/quotes`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ customerId: custId, validUntil })
    });
    const qcData = await qcRes.json();
    if (!qcData.success) throw new Error("Create Quote failed");
    quoteId = qcData.data.id;
    console.log("✅ Quote Creation: PASS");
  } catch (e) {
    console.log("❌ Quote Creation: FAIL", e.message);
  }

  // 7. Quote Lines
  try {
    if (quoteId && prodId) {
      const qlRes = await fetch(`${API}/quotes/${quoteId}/lines`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ productId: prodId, quantity: 1, discountPercent: 10 })
      });
      if (!qlRes.ok) throw new Error("Add Line failed");
      console.log("✅ Line Items: PASS");
    } else {
      console.log("❌ Line Items: SKIP (No quote or product)");
    }
  } catch (e) {
    console.log("❌ Line Items: FAIL", e.message);
  }

  // 8. Submit Quote (Approval/Discount/Risk)
  try {
    if (quoteId) {
      const subRes = await fetch(`${API}/quotes/${quoteId}/submit`, { method: 'POST', headers });
      const subData = await subRes.json();
      if (!subData.success) throw new Error("Submit Quote failed");
      console.log("✅ Discount/Risk/Submit: PASS");
    } else {
      console.log("❌ Discount/Risk/Submit: SKIP");
    }
  } catch (e) {
    console.log("❌ Discount/Risk/Submit: FAIL", e.message);
  }

  // 9. Negotiation
  try {
    if (quoteId) {
      const nRes = await fetch(`${API}/quotes/${quoteId}/negotiations`, { headers });
      if (!nRes.ok) throw new Error("Negotiation GET failed");
      
      const nmRes = await fetch(`${API}/quotes/${quoteId}/negotiations`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ message: 'Test message', senderRole: 'REP' })
      });
      if (!nmRes.ok) throw new Error("Negotiation POST failed");
      console.log("✅ Negotiation: PASS");
    } else {
      console.log("❌ Negotiation: SKIP");
    }
  } catch (e) {
    console.log("❌ Negotiation: FAIL", e.message);
  }

  // 10. Counter Offer
  try {
    if (quoteId) {
      // First we need a ticket to counter
      const tkRes = await fetch(`${API}/negotiation-tickets`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ quoteId, requestedDiscountPct: 20, comments: 'Customer wants 20%' })
      });
      const tkData = await tkRes.json();
      if (tkData.success) {
        const ticketId = tkData.data.id;
        const cRes = await fetch(`${API}/negotiation-tickets/${ticketId}/counter`, {
          method: 'POST',
          headers,
          body: JSON.stringify({ counterDiscountPct: 15, comments: 'How about 15%' })
        });
        if (!cRes.ok) throw new Error("Counter Offer POST failed");
        console.log("✅ Counter Offer: PASS");
      } else {
        throw new Error("Could not create ticket for counter offer test");
      }
    } else {
      console.log("❌ Counter Offer: SKIP");
    }
  } catch (e) {
    console.log("❌ Counter Offer: FAIL", e.message);
  }
}

verify();
