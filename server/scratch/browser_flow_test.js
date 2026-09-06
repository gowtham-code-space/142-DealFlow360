const puppeteer = require('./e2e/node_modules/puppeteer');
const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function runBrowserFlow() {
  console.log('=== STARTING REAL BROWSER END-TO-END FLOW VERIFICATION ===');
  
  const browser = await puppeteer.launch({
    executablePath: chromePath,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 900 });

  const consoleLogs = [];
  const networkRequests = [];
  const networkErrors = [];

  page.on('console', msg => {
    consoleLogs.push(`[${msg.type().toUpperCase()}] ${msg.text()}`);
  });

  page.on('requestfailed', request => {
    networkErrors.push(`FAILED: ${request.method()} ${request.url()} - ${request.failure()?.errorText}`);
  });

  page.on('response', response => {
    networkRequests.push({
      url: response.url(),
      method: response.request().method(),
      status: response.status()
    });
  });

  try {
    // 1. Visit Login Page
    console.log('[STEP 1] Navigating to http://localhost:5173/login ...');
    await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle0' });

    // Fill login form
    console.log('[STEP 2] Logging in as procurement@nexushyperscale.com ...');
    await page.type('input[type="email"]', 'procurement@nexushyperscale.com');
    await page.type('input[type="password"]', 'password123');
    
    await Promise.all([
      page.click('button[type="submit"]'),
      page.waitForNavigation({ waitUntil: 'networkidle0' })
    ]);

    console.log('[STEP 3] Login successful! Current URL:', page.url());

    await new Promise(r => setTimeout(r, 1500));

    // 2. Multi-product quantity selection in Catalog Table
    console.log('[STEP 4] Locating quantity inputs in Catalog table...');
    const quantityInputs = await page.$$('input[type="number"]');
    console.log(`Found ${quantityInputs.length} quantity inputs in catalog`);

    if (quantityInputs.length >= 2) {
      // Set qty 2 for item 1 (PRD-101)
      await quantityInputs[0].click({ clickCount: 3 });
      await quantityInputs[0].type('2');
      
      // Set qty 1 for item 2 (PRD-102)
      await quantityInputs[1].click({ clickCount: 3 });
      await quantityInputs[1].type('1');
    }

    await page.screenshot({ path: path.join(__dirname, 'browser_step1_catalog.png') });

    // 3. Click Reserve Stock (15 min Hold) Button
    console.log('[STEP 5] Clicking 15 min Hold / Reserve button...');
    
    let holdApiPayload = null;
    let holdApiResponse = null;

    page.on('request', req => {
      if (req.url().includes('/portal/holds') && req.method() === 'POST') {
        holdApiPayload = req.postData();
      }
    });

    page.on('response', async res => {
      if (res.url().includes('/portal/holds') && res.request().method() === 'POST') {
        try {
          holdApiResponse = await res.json();
        } catch (e) {}
      }
    });

    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const target = btns.find(b => b.textContent.includes('Hold') || b.textContent.includes('Reserve'));
      if (target) target.click();
    });

    await new Promise(r => setTimeout(r, 2000));

    // Verify page is NOT blank
    const pageText = await page.evaluate(() => document.body.innerText);
    const isBlank = pageText.trim().length === 0;
    console.log('[STEP 6] Blank page check:', isBlank ? 'FAILED (BLANK PAGE)' : 'PASSED (UI rendered successfully)');

    await page.screenshot({ path: path.join(__dirname, 'browser_step2_hold.png') });

    // 4. Click Generate Quotation Now
    console.log('[STEP 7] Clicking Generate Quotation Now button...');
    let quoteGenPayload = null;
    let quoteGenResponse = null;

    page.on('request', req => {
      if (req.url().includes('/portal/quotes/generate') && req.method() === 'POST') {
        quoteGenPayload = req.postData();
      }
    });

    page.on('response', async res => {
      if (res.url().includes('/portal/quotes/generate') && res.request().method() === 'POST') {
        try {
          quoteGenResponse = await res.json();
        } catch (e) {}
      }
    });

    await page.waitForFunction(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      return btns.some(b => b.textContent.includes('Generate Quotation'));
    }, { timeout: 5000 });

    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const target = btns.find(b => b.textContent.includes('Generate Quotation'));
      if (target) target.click();
    });

    await new Promise(r => setTimeout(r, 3000));

    await page.screenshot({ path: path.join(__dirname, 'browser_step3_quote.png') });

    console.log('[STEP 8] Current page after Quote Generation:', page.url());

    // 5. Refresh page (F5) to verify backend persistence
    console.log('[STEP 9] Reloading page to verify persistence...');
    await page.reload({ waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 1500));

    await page.screenshot({ path: path.join(__dirname, 'browser_step4_refresh.png') });

    // 6. Query Prisma Database for exact verification
    let latestHoldTicketId = holdApiResponse?.data?.ticketId;
    let dbHolds = [];
    if (latestHoldTicketId) {
      dbHolds = await prisma.productHold.findMany({ where: { ticketId: latestHoldTicketId } });
    }

    let latestQuoteId = quoteGenResponse?.data?.id;
    let dbQuote = null;
    if (latestQuoteId) {
      dbQuote = await prisma.quotation.findUnique({
        where: { id: latestQuoteId },
        include: { items: { include: { product: true } }, customer: true }
      });
    }

    await browser.close();
    await prisma.$disconnect();

    return {
      success: true,
      isBlank,
      holdApiPayload,
      holdApiResponse,
      quoteGenPayload,
      quoteGenResponse,
      dbHolds,
      dbQuote,
      consoleLogs,
      networkErrors
    };

  } catch (err) {
    console.error('Browser execution error:', err);
    await page.screenshot({ path: path.join(__dirname, 'browser_error.png') });
    await browser.close();
    await prisma.$disconnect();
    throw err;
  }
}

runBrowserFlow().then(res => {
  console.log('\n=== REAL BROWSER FLOW TEST COMPLETED ===');
  console.log(JSON.stringify(res, null, 2));
}).catch(err => {
  console.error('Browser flow failed:', err);
});
