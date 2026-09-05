export const ROLES = {
  SALES_REP: 'Sales Rep',
  SALES_MANAGER: 'Sales Manager',
  OPERATIONS: 'Operations / Finance',
  CUSTOMER: 'Customer Portal',
  ADMIN: 'Administrator'
};

export const QUOTE_STATUS = {
  DRAFT: 'DRAFT',
  PENDING_APPROVAL: 'PENDING_APPROVAL',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  CUSTOMER_NEGOTIATION: 'CUSTOMER_NEGOTIATION',
  CUSTOMER_ACCEPTED: 'CUSTOMER_ACCEPTED',
  FULFILLED: 'FULFILLED',
  INVOICED: 'INVOICED'
};

export const CUSTOMER_TIERS = {
  STANDARD: { name: 'Standard', maxDiscount: 10, color: 'silver' },
  GOLD: { name: 'Gold', maxDiscount: 20, color: 'gold' },
  PLATINUM: { name: 'Platinum', maxDiscount: 30, color: 'platinum' }
};

export const MOCK_CUSTOMERS = [
  { id: 'CUST-001', name: 'Apex Global Technologies', tier: 'PLATINUM', creditLimit: 20000000, riskScore: 18 },
  { id: 'CUST-002', name: 'Nexus HyperScale Ltd', tier: 'GOLD', creditLimit: 12000000, riskScore: 35 },
  { id: 'CUST-003', name: 'Vanguard Retail Systems', tier: 'STANDARD', creditLimit: 4000000, riskScore: 62 },
  { id: 'CUST-004', name: 'Quantum Cloud Logistics', tier: 'GOLD', creditLimit: 15000000, riskScore: 24 }
];

export const MOCK_PRODUCTS = [
  { id: 'PRD-101', name: 'Enterprise Cloud Server X1', category: 'Hardware', listPrice: 1000000, costPrice: 600000, minMargin: 25, billingType: 'ONE_TIME' },
  { id: 'PRD-102', name: 'High-Density Switch 48-Port', category: 'Hardware', listPrice: 250000, costPrice: 150000, minMargin: 20, billingType: 'ONE_TIME' },
  { id: 'PRD-201', name: 'DealFlow Platform SaaS License', category: 'Software', listPrice: 35000, costPrice: 4000, minMargin: 60, billingType: 'RECURRING_MONTHLY' },
  { id: 'PRD-202', name: '24/7 Mission Critical Support SLA', category: 'Service', listPrice: 100000, costPrice: 32000, minMargin: 40, billingType: 'RECURRING_ANNUAL' },
  { id: 'PRD-301', name: 'Optical Fiber SFP+ Transceiver Pack', category: 'Accessory', listPrice: 40000, costPrice: 12000, minMargin: 30, billingType: 'ONE_TIME', isUpsell: true }
];

export const MOCK_WAREHOUSES = [
  { id: 'WH-EAST', name: 'East Coast Distribution (NJ)', stock: 450, shippingCostRate: 95 },
  { id: 'WH-WEST', name: 'West Coast Logistics (CA)', stock: 320, shippingCostRate: 120 },
  { id: 'WH-CENTRAL', name: 'Midwest Hub (IL)', stock: 600, shippingCostRate: 75 }
];

export const MOCK_QUOTATIONS = [
  {
    id: 'Q-2026-001',
    customerName: 'Nexus HyperScale Ltd',
    customerId: 'CUST-002',
    tier: 'GOLD',
    totalValue: 6760000,
    discountPercent: 22,
    marginPercent: 38.5,
    status: 'PENDING_APPROVAL',
    requiresApprovalReason: 'Discount (22%) exceeds Gold tier max (20%)',
    itemsCount: 4,
    createdDate: '2026-09-02',
    repName: 'Sarah Jenkins',
    riskScore: 'LOW',
    items: [
      { id: 'i-1', productId: 'PRD-101', name: 'Enterprise Cloud Server X1', billingType: 'One-Time', quantity: 4, listPrice: 1000000, discountPercent: 20, lineTotal: 3200000 },
      { id: 'i-2', productId: 'PRD-102', name: 'High-Density Switch 48-Port', billingType: 'One-Time', quantity: 10, listPrice: 250000, discountPercent: 25, lineTotal: 1875000 },
      { id: 'i-3', productId: 'PRD-201', name: 'DealFlow Platform SaaS License', billingType: 'Monthly', quantity: 50, listPrice: 35000, discountPercent: 10, lineTotal: 1575000 }
    ]
  },
  {
    id: 'Q-2026-002',
    customerName: 'Apex Global Technologies',
    customerId: 'CUST-001',
    tier: 'PLATINUM',
    totalValue: 11360000,
    discountPercent: 18,
    marginPercent: 44.2,
    status: 'CUSTOMER_NEGOTIATION',
    requiresApprovalReason: null,
    itemsCount: 6,
    createdDate: '2026-09-03',
    repName: 'Alex Rivera',
    riskScore: 'VERY_LOW',
    items: [
      { id: 'i-1', productId: 'PRD-101', name: 'Enterprise Cloud Server X1', billingType: 'One-Time', quantity: 8, listPrice: 1000000, discountPercent: 18, lineTotal: 6560000 },
      { id: 'i-2', productId: 'PRD-202', name: '24/7 Mission Critical Support SLA', billingType: 'Annual', quantity: 2, listPrice: 2000000, discountPercent: 15, lineTotal: 3400000 },
      { id: 'i-3', productId: 'PRD-301', name: 'Optical Fiber SFP+ Transceiver Pack', billingType: 'One-Time', quantity: 40, listPrice: 40000, discountPercent: 20, lineTotal: 1280000 }
    ]
  },
  {
    id: 'Q-2026-003',
    customerName: 'Vanguard Retail Systems',
    customerId: 'CUST-003',
    tier: 'STANDARD',
    totalValue: 2272000,
    discountPercent: 15,
    marginPercent: 29.1,
    status: 'APPROVED',
    requiresApprovalReason: 'Approved by Sales Manager (Dave K.)',
    itemsCount: 3,
    createdDate: '2026-08-30',
    repName: 'Alex Rivera',
    riskScore: 'MEDIUM',
    items: [
      { id: 'i-1', productId: 'PRD-102', name: 'High-Density Switch 48-Port', billingType: 'One-Time', quantity: 5, listPrice: 250000, discountPercent: 15, lineTotal: 1062500 },
      { id: 'i-2', productId: 'PRD-201', name: 'DealFlow Platform SaaS License', billingType: 'Monthly', quantity: 35, listPrice: 35000, discountPercent: 15, lineTotal: 1041250 }
    ]
  },
  {
    id: 'Q-2026-004',
    customerName: 'Quantum Cloud Logistics',
    customerId: 'CUST-004',
    tier: 'GOLD',
    totalValue: 7680000,
    discountPercent: 12,
    marginPercent: 51.0,
    status: 'FULFILLED',
    requiresApprovalReason: null,
    itemsCount: 5,
    createdDate: '2026-08-25',
    repName: 'Sarah Jenkins',
    riskScore: 'LOW',
    items: [
      { id: 'i-1', productId: 'PRD-101', name: 'Enterprise Cloud Server X1', billingType: 'One-Time', quantity: 6, listPrice: 1000000, discountPercent: 12, lineTotal: 5280000 },
      { id: 'i-2', productId: 'PRD-202', name: '24/7 Mission Critical Support SLA', billingType: 'Annual', quantity: 1, listPrice: 2000000, discountPercent: 10, lineTotal: 1800000 }
    ]
  }
];
