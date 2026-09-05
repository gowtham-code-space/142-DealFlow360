const { v4: uuidv4 } = require('uuid');
const billingModel = require('./billing.model');
const { calculateProration } = require('../../utils/proration');
const {
  InvoiceType,
  InvoiceStatus,
  PaymentStatus,
  SubscriptionStatus,
  BillingPeriod,
  ProrationType,
  ProductType,
  DepositStatus,
  Defaults
} = require('../../constants');

// ─── Helpers ─────────────────────────────────────────────────────────────────

function generateInvoiceNumber() {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `INV-${dateStr}-${rand}`;
}

function calculateNextBillingDate(startDate, billingPeriod) {
  const next = new Date(startDate);
  if (billingPeriod === BillingPeriod.YEARLY || billingPeriod === 'ANNUAL') {
    next.setFullYear(next.getFullYear() + 1);
  } else if (billingPeriod === BillingPeriod.QUARTERLY) {
    next.setMonth(next.getMonth() + 3);
  } else {
    next.setMonth(next.getMonth() + 1);
  }
  return next;
}

// ─── Invoices ────────────────────────────────────────────────────────────────

async function listInvoices({ page = Defaults.PAGE, pageSize = Defaults.PAGE_SIZE, customerId, status, type, dateFrom, dateTo }) {
  const skip = (page - 1) * pageSize;
  const where = {};
  if (customerId) where.customerId = customerId;
  if (status) where.status = status.toUpperCase();
  if (type) where.type = type.toUpperCase();
  if (dateFrom || dateTo) {
    where.createdAt = {};
    if (dateFrom) where.createdAt.gte = new Date(dateFrom);
    if (dateTo) where.createdAt.lte = new Date(dateTo);
  }

  const [items, total] = await Promise.all([
    billingModel.findInvoices({ where, skip, take: Number(pageSize) }),
    billingModel.countInvoices(where)
  ]);
  return { items, total, page: Number(page), pageSize: Number(pageSize), totalPages: Math.ceil(total / pageSize) };
}

async function getInvoiceById(id) {
  return billingModel.findInvoiceById(id);
}

// ─── Generate Billing for Quote ──────────────────────────────────────────────

async function generateBilling(quotationId) {
  const quote = await billingModel.findQuotationForBilling(quotationId);
  if (!quote) return { notFound: true };

  const existingInvoices = await billingModel.findInvoicesByQuotation(quotationId);
  if (existingInvoices.length > 0) {
    return { conflict: true, message: 'Billing already generated for this quote' };
  }

  const hardwareItems = quote.items.filter(i => i.product.productType === ProductType.HARDWARE);
  const softwareItems = quote.items.filter(i => i.product.productType === ProductType.SOFTWARE || i.isRecurring);

  const depositPaid = quote.depositRecords.reduce((acc, d) => acc + Number(d.amount), 0);
  const createdInvoices = [];
  const createdSubscriptions = [];

  const now = new Date();
  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + 30); // 30 day net payment

  // 1. One-time hardware invoice
  if (hardwareItems.length > 0 || (hardwareItems.length === 0 && softwareItems.length === 0)) {
    const hwTotal = hardwareItems.reduce((acc, i) => acc + Number(i.netTotal), 0);
    const depositToDeduct = Math.min(depositPaid, hwTotal);
    const amountDue = Math.max(0, hwTotal - depositToDeduct);

    const invoice = await billingModel.createInvoice({
      id: uuidv4(),
      invoiceNumber: generateInvoiceNumber(),
      quotationId,
      customerId: quote.customerId,
      type: InvoiceType.ONE_TIME,
      amount: hwTotal,
      depositDeducted: depositToDeduct,
      amountDue,
      oneTimeTotal: hwTotal,
      recurringTotal: 0,
      status: amountDue === 0 ? InvoiceStatus.PAID : InvoiceStatus.SENT,
      dueDate,
      issuedAt: now,
      items: {
        create: hardwareItems.map(i => ({
          id: uuidv4(),
          quotationItemId: i.id,
          productId: i.productId,
          description: i.product.name,
          quantity: i.quantity,
          unitPrice: i.unitPrice,
          discountAmount: (Number(i.unitListPrice) - Number(i.unitPrice)) * i.quantity,
          taxAmount: 0,
          lineTotal: i.netTotal
        }))
      }
    });
    createdInvoices.push(invoice);
  }

  // 2. Subscriptions & first recurring invoice
  if (softwareItems.length > 0) {
    let recurringInvoiceTotal = 0;
    const invItemsData = [];

    for (const item of softwareItems) {
      const plan = item.subscriptionPlan;
      const billingPeriod = plan?.billingPeriod || BillingPeriod.MONTHLY;
      const amountPerCycle = Number(item.netTotal);
      const nextBillingDate = calculateNextBillingDate(now, billingPeriod);

      const sub = await billingModel.createSubscription({
        id: uuidv4(),
        quotationId,
        quoteLineId: item.id,
        customerId: quote.customerId,
        planId: plan ? plan.id : (await getOrCreateDefaultPlan()).id,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        discountPct: item.cumulativeDiscountPct,
        amountPerCycle,
        currency: quote.currency,
        status: SubscriptionStatus.ACTIVE,
        startDate: now,
        nextBillingDate,
        billingPeriod
      });
      createdSubscriptions.push(sub);
      recurringInvoiceTotal += amountPerCycle;

      invItemsData.push({
        id: uuidv4(),
        quotationItemId: item.id,
        productId: item.productId,
        subscriptionId: sub.id,
        description: `${item.product.name} (Subscription - 1st Cycle)`,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        discountAmount: (Number(item.unitListPrice) - Number(item.unitPrice)) * item.quantity,
        taxAmount: 0,
        lineTotal: item.netTotal
      });
    }

    const recInvoice = await billingModel.createInvoice({
      id: uuidv4(),
      invoiceNumber: generateInvoiceNumber(),
      quotationId,
      customerId: quote.customerId,
      type: InvoiceType.RECURRING,
      amount: recurringInvoiceTotal,
      depositDeducted: 0,
      amountDue: recurringInvoiceTotal,
      oneTimeTotal: 0,
      recurringTotal: recurringInvoiceTotal,
      billingCycle: 'FIRST_CYCLE',
      status: InvoiceStatus.SENT,
      dueDate,
      issuedAt: now,
      items: {
        create: invItemsData
      }
    });
    createdInvoices.push(recInvoice);
  }

  return { invoices: createdInvoices, subscriptions: createdSubscriptions };
}

async function getOrCreateDefaultPlan() {
  let plan = await billingModel.findActiveSubscriptionPlan();
  if (!plan) {
    plan = await billingModel.createDefaultSubscriptionPlan({
      id: uuidv4(),
      name: 'Standard Software Plan',
      billingPeriod: BillingPeriod.MONTHLY,
      prorationType: ProrationType.DAILY,
      price: 99.00,
      isActive: true
    });
  }
  return plan;
}

async function getQuoteBilling(quotationId) {
  const [invoices, subscriptions] = await Promise.all([
    billingModel.findInvoicesByQuotation(quotationId),
    billingModel.findSubscriptionsByQuotation(quotationId)
  ]);
  return { quotationId, invoices, subscriptions };
}

// ─── Subscriptions ───────────────────────────────────────────────────────────

async function listSubscriptions({ page = Defaults.PAGE, pageSize = Defaults.PAGE_SIZE, customerId, status }) {
  const skip = (page - 1) * pageSize;
  const where = {};
  if (customerId) where.customerId = customerId;
  if (status) where.status = status.toUpperCase();

  const [items, total] = await Promise.all([
    billingModel.findSubscriptions({ where, skip, take: Number(pageSize) }),
    billingModel.countSubscriptions(where)
  ]);
  return { items, total, page: Number(page), pageSize: Number(pageSize), totalPages: Math.ceil(total / pageSize) };
}

async function getSubscriptionById(id) {
  return billingModel.findSubscriptionById(id);
}

async function modifySubscription(id, { quantity, planId }) {
  const sub = await billingModel.findSubscriptionById(id);
  if (!sub) return { notFound: true };
  if (sub.status === SubscriptionStatus.CANCELLED) return { cancelled: true };

  let newPlan = sub.plan;
  if (planId && planId !== sub.planId) {
    newPlan = await billingModel.findSubscriptionPlanById(planId);
    if (!newPlan) return { planNotFound: true };
  }

  const newQty = quantity || sub.quantity;
  const newPrice = Number(newPlan.price) * newQty;
  const oldPrice = Number(sub.amountPerCycle);

  // Calculate proration
  const now = new Date();
  const cycleStart = new Date(sub.nextBillingDate);
  cycleStart.setMonth(cycleStart.getMonth() - 1);

  const proration = calculateProration({
    currentPlanPrice: oldPrice,
    newPlanPrice: newPrice,
    billingPeriod: sub.billingPeriod,
    cycleStartDate: cycleStart,
    cycleEndDate: sub.nextBillingDate,
    effectiveDate: now,
    prorationType: newPlan.prorationType || ProrationType.DAILY
  });

  const updated = await billingModel.updateSubscription(id, {
    quantity: newQty,
    planId: newPlan.id,
    amountPerCycle: newPrice,
    status: SubscriptionStatus.MODIFIED
  });

  return { subscription: updated, proration };
}

async function cancelSubscription(id, { reason }) {
  const sub = await billingModel.findSubscriptionById(id);
  if (!sub) return { notFound: true };
  if (sub.status === SubscriptionStatus.CANCELLED) return { alreadyCancelled: true };

  const now = new Date();
  const cycleStart = new Date(sub.nextBillingDate);
  cycleStart.setMonth(cycleStart.getMonth() - 1);

  const proration = calculateProration({
    currentPlanPrice: Number(sub.amountPerCycle),
    newPlanPrice: 0,
    billingPeriod: sub.billingPeriod,
    cycleStartDate: cycleStart,
    cycleEndDate: sub.nextBillingDate,
    effectiveDate: now,
    prorationType: sub.plan.prorationType || ProrationType.DAILY
  });

  const updated = await billingModel.updateSubscription(id, {
    status: SubscriptionStatus.CANCELLED
  });

  return { subscription: updated, creditProration: proration, reason };
}

async function getProrationPreview(id, { newQuantity, newPlanId }) {
  const sub = await billingModel.findSubscriptionById(id);
  if (!sub) return { notFound: true };

  let newPlan = sub.plan;
  if (newPlanId) {
    newPlan = await billingModel.findSubscriptionPlanById(newPlanId);
    if (!newPlan) return { planNotFound: true };
  }

  const newQty = newQuantity || sub.quantity;
  const newPrice = Number(newPlan.price) * newQty;
  const oldPrice = Number(sub.amountPerCycle);

  const now = new Date();
  const cycleStart = new Date(sub.nextBillingDate);
  cycleStart.setMonth(cycleStart.getMonth() - 1);

  return calculateProration({
    currentPlanPrice: oldPrice,
    newPlanPrice: newPrice,
    billingPeriod: sub.billingPeriod,
    cycleStartDate: cycleStart,
    cycleEndDate: sub.nextBillingDate,
    effectiveDate: now,
    prorationType: newPlan.prorationType || ProrationType.DAILY
  });
}

// ─── Payments ────────────────────────────────────────────────────────────────

async function listPayments({ page = Defaults.PAGE, pageSize = Defaults.PAGE_SIZE, invoiceId, customerId }) {
  const skip = (page - 1) * pageSize;
  const where = {};
  if (invoiceId) where.invoiceId = invoiceId;
  if (customerId) where.customerId = customerId;

  const [items, total] = await Promise.all([
    billingModel.findPayments({ where, skip, take: Number(pageSize) }),
    billingModel.countPayments(where)
  ]);
  return { items, total, page: Number(page), pageSize: Number(pageSize), totalPages: Math.ceil(total / pageSize) };
}

async function recordPayment(invoiceId, { amount, method = 'BANK_TRANSFER', reference }, userId) {
  const invoice = await billingModel.findInvoiceForPayment(invoiceId);
  if (!invoice) return { notFound: true };
  if (invoice.status === InvoiceStatus.PAID) return { alreadyPaid: true };

  const totalAlreadyPaid = invoice.payments.reduce((acc, p) => acc + Number(p.amount), 0);
  const remainingDue = Math.max(0, Number(invoice.amountDue) - totalAlreadyPaid);

  if (Number(amount) > remainingDue) {
    return {
      exceedsBalance: true,
      amount: Number(amount),
      remainingDue
    };
  }

  const payment = await billingModel.createPayment({
    id: uuidv4(),
    invoiceId,
    customerId: invoice.customerId,
    amount: Number(amount),
    status: PaymentStatus.SUCCESSFUL,
    method: method.toUpperCase(),
    reference,
    recordedByUserId: userId
  });

  const newTotalPaid = totalAlreadyPaid + Number(amount);
  if (newTotalPaid >= Number(invoice.amountDue)) {
    await billingModel.updateInvoice(invoiceId, {
      status: InvoiceStatus.PAID,
      paidAt: new Date()
    });
  }

  return payment;
}

async function getInvoicePayments(invoiceId) {
  return billingModel.findPaymentsByInvoiceId(invoiceId);
}

module.exports = {
  listInvoices, getInvoiceById, generateBilling, getQuoteBilling,
  listSubscriptions, getSubscriptionById, modifySubscription, cancelSubscription, getProrationPreview,
  listPayments, recordPayment, getInvoicePayments
};
