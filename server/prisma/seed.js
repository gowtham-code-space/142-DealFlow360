const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('[Seed] Starting database seeding...');

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
      email: 'procurement@apextech.com',
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
      email: 'procurement@nexushyperscale.com',
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
      roleId: 'SALES_REP'
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
      roleId: 'SALES_MANAGER'
    }
  });

  const products = [
    { id: 'PRD-101', sku: 'SRV-X1', name: 'Enterprise Cloud Server X1', category: 'Hardware', listPrice: 12500.00, cost: 7500.00, minMargin: 25.00, isRecurring: false, isUpsell: false, productType: 'HARDWARE' },
    { id: 'PRD-102', sku: 'SW-48P', name: 'High-Density Switch 48-Port', category: 'Hardware', listPrice: 3200.00, cost: 1800.00, minMargin: 20.00, isRecurring: false, isUpsell: false, productType: 'HARDWARE' },
    { id: 'PRD-201', sku: 'SaaS-LIC', name: 'DealFlow Platform SaaS License', category: 'Software', listPrice: 450.00, cost: 50.00, minMargin: 60.00, isRecurring: true, isUpsell: false, productType: 'SOFTWARE' },
    { id: 'PRD-202', sku: 'SLA-247', name: '24/7 Mission Critical Support SLA', category: 'Service', listPrice: 1200.00, cost: 400.00, minMargin: 40.00, isRecurring: true, isUpsell: false, productType: 'SERVICE' },
    { id: 'PRD-301', sku: 'OPT-SFP', name: 'Optical Fiber SFP+ Tranceiver Pack', category: 'Accessory', listPrice: 480.00, cost: 160.00, minMargin: 30.00, isRecurring: false, isUpsell: true, productType: 'HARDWARE' }
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
    { id: 'WH-EAST', code: 'US-EAST-NJ', name: 'East Coast Distribution (NJ)', location: 'Edison, NJ', region: 'EAST', shippingCostFactor: 1.20, locationLat: 40.5187, locationLng: -74.4121 },
    { id: 'WH-WEST', code: 'US-WEST-CA', name: 'West Coast Logistics (CA)', location: 'Fremont, CA', region: 'WEST', shippingCostFactor: 1.50, locationLat: 37.5485, locationLng: -121.9886 },
    { id: 'WH-CENTRAL', code: 'US-MID-IL', name: 'Midwest Hub (IL)', location: 'Chicago, IL', region: 'CENTRAL', shippingCostFactor: 0.90, locationLat: 41.8781, locationLng: -87.6298 }
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
