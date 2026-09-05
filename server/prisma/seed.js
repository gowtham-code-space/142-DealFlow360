// Seed script placeholder (Prisma disabled for Swagger preview)
async function main() {
  console.log('[Seed] Database seeding bypassed (Swagger mode)');
}

main()
  .catch((e) => {
    console.error(e);
  });


  // 1. Seed Customers
  const customerApex = await prisma.customer.upsert({
    where: { id: 'CUST-001' },
    update: {},
    create: {
      id: 'CUST-001',
      name: 'Apex Global Technologies',
      tier: 'PLATINUM',
      creditLimit: 250000.00,
      riskScore: 18,
      contactEmail: 'procurement@apextech.com',
      paymentTerms: 'Net-45'
    }
  });

  const customerNexus = await prisma.customer.upsert({
    where: { id: 'CUST-002' },
    update: {},
    create: {
      id: 'CUST-002',
      name: 'Nexus HyperScale Ltd',
      tier: 'GOLD',
      creditLimit: 150000.00,
      riskScore: 35,
      contactEmail: 'procurement@nexushyperscale.com',
      paymentTerms: 'Net-30'
    }
  });

  // 2. Seed Users
  const repUser = await prisma.user.upsert({
    where: { email: 'sarah.jenkins@dealflow360.internal' },
    update: {},
    create: {
      id: 'USR-101',
      email: 'sarah.jenkins@dealflow360.internal',
      password: 'password123',
      name: 'Sarah Jenkins',
      role: 'SALES_REP'
    }
  });

  const managerUser = await prisma.user.upsert({
    where: { email: 'david.keller@dealflow360.internal' },
    update: {},
    create: {
      id: 'USR-201',
      email: 'david.keller@dealflow360.internal',
      password: 'password123',
      name: 'David Keller',
      role: 'SALES_MANAGER'
    }
  });

  // 3. Seed Products
  const products = [
    { id: 'PRD-101', sku: 'SRV-X1', name: 'Enterprise Cloud Server X1', category: 'Hardware', listPrice: 12500.00, costPrice: 7500.00, minMargin: 25.00, billingType: 'ONE_TIME', isUpsell: false },
    { id: 'PRD-102', sku: 'SW-48P', name: 'High-Density Switch 48-Port', category: 'Hardware', listPrice: 3200.00, costPrice: 1800.00, minMargin: 20.00, billingType: 'ONE_TIME', isUpsell: false },
    { id: 'PRD-201', sku: 'SaaS-LIC', name: 'DealFlow Platform SaaS License', category: 'Software', listPrice: 450.00, costPrice: 50.00, minMargin: 60.00, billingType: 'RECURRING_MONTHLY', isUpsell: false },
    { id: 'PRD-202', sku: 'SLA-247', name: '24/7 Mission Critical Support SLA', category: 'Service', listPrice: 1200.00, costPrice: 400.00, minMargin: 40.00, billingType: 'RECURRING_ANNUAL', isUpsell: false },
    { id: 'PRD-301', sku: 'OPT-SFP', name: 'Optical Fiber SFP+ Tranceiver Pack', category: 'Accessory', listPrice: 480.00, costPrice: 160.00, minMargin: 30.00, billingType: 'ONE_TIME', isUpsell: true }
  ];

  for (const p of products) {
    await prisma.product.upsert({
      where: { id: p.id },
      update: {},
      create: p
    });
  }

  // 4. Seed Warehouses
  const warehouses = [
    { id: 'WH-EAST', code: 'US-EAST-NJ', name: 'East Coast Distribution (NJ)', location: 'Edison, NJ', shippingMultiplier: 1.20 },
    { id: 'WH-WEST', code: 'US-WEST-CA', name: 'West Coast Logistics (CA)', location: 'Fremont, CA', shippingMultiplier: 1.50 },
    { id: 'WH-CENTRAL', code: 'US-MID-IL', name: 'Midwest Hub (IL)', location: 'Chicago, IL', shippingMultiplier: 0.90 }
  ];

  for (const wh of warehouses) {
    await prisma.warehouse.upsert({
      where: { id: wh.id },
      update: {},
      create: wh
    });
  }

  console.log('✅ Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
