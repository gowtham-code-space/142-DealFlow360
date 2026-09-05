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
  { id: 'CUST-001', name: 'Apex Global Technologies', tier: 'PLATINUM', creditLimit: 250000, riskScore: 18 },
  { id: 'CUST-002', name: 'Nexus HyperScale Ltd', tier: 'GOLD', creditLimit: 150000, riskScore: 35 },
  { id: 'CUST-003', name: 'Vanguard Retail Systems', tier: 'STANDARD', creditLimit: 50000, riskScore: 62 },
  { id: 'CUST-004', name: 'Quantum Cloud Logistics', tier: 'GOLD', creditLimit: 180000, riskScore: 24 }
];

export const MOCK_PRODUCTS = [
  { id: 'PRD-101', name: 'Enterprise Cloud Server X1', category: 'Hardware', listPrice: 12500, costPrice: 7500, minMargin: 25, billingType: 'ONE_TIME' },
  { id: 'PRD-102', name: 'High-Density Switch 48-Port', category: 'Hardware', listPrice: 3200, costPrice: 1800, minMargin: 20, billingType: 'ONE_TIME' },
  { id: 'PRD-201', name: 'DealFlow Platform SaaS License', category: 'Software', listPrice: 450, costPrice: 50, minMargin: 60, billingType: 'RECURRING_MONTHLY' },
  { id: 'PRD-202', name: '24/7 Mission Critical Support SLA', category: 'Service', listPrice: 1200, costPrice: 400, minMargin: 40, billingType: 'RECURRING_ANNUAL' },
  { id: 'PRD-301', name: 'Optical Fiber SFP+ Tranceiver Pack', category: 'Accessory', listPrice: 480, costPrice: 160, minMargin: 30, billingType: 'ONE_TIME', isUpsell: true }
];

export const MOCK_WAREHOUSES = [
  { id: 'WH-EAST', name: 'East Coast Distribution (NJ)', stock: 450, shippingCostRate: 1.2 },
  { id: 'WH-WEST', name: 'West Coast Logistics (CA)', stock: 320, shippingCostRate: 1.5 },
  { id: 'WH-CENTRAL', name: 'Midwest Hub (IL)', stock: 600, shippingCostRate: 0.9 }
];

export const MOCK_QUOTATIONS = [
  {
    id: 'Q-2026-001',
    customerName: 'Nexus HyperScale Ltd',
    customerId: 'CUST-002',
    tier: 'GOLD',
    totalValue: 84500,
    discountPercent: 22,
    marginPercent: 38.5,
    status: 'PENDING_APPROVAL',
    requiresApprovalReason: 'Discount (22%) exceeds Gold tier max (20%)',
    itemsCount: 4,
    createdDate: '2026-09-02',
    repName: 'Sarah Jenkins',
    riskScore: 'LOW'
  },
  {
    id: 'Q-2026-002',
    customerName: 'Apex Global Technologies',
    customerId: 'CUST-001',
    tier: 'PLATINUM',
    totalValue: 142000,
    discountPercent: 18,
    marginPercent: 44.2,
    status: 'CUSTOMER_NEGOTIATION',
    requiresApprovalReason: null,
    itemsCount: 6,
    createdDate: '2026-09-03',
    repName: 'Alex Rivera',
    riskScore: 'VERY_LOW'
  },
  {
    id: 'Q-2026-003',
    customerName: 'Vanguard Retail Systems',
    customerId: 'CUST-003',
    tier: 'STANDARD',
    totalValue: 28400,
    discountPercent: 15,
    marginPercent: 29.1,
    status: 'APPROVED',
    requiresApprovalReason: 'Approved by Sales Manager (Dave K.)',
    itemsCount: 3,
    createdDate: '2026-08-30',
    repName: 'Alex Rivera',
    riskScore: 'MEDIUM'
  },
  {
    id: 'Q-2026-004',
    customerName: 'Quantum Cloud Logistics',
    customerId: 'CUST-004',
    tier: 'GOLD',
    totalValue: 96000,
    discountPercent: 12,
    marginPercent: 51.0,
    status: 'FULFILLED',
    requiresApprovalReason: null,
    itemsCount: 5,
    createdDate: '2026-08-25',
    repName: 'Sarah Jenkins',
    riskScore: 'LOW'
  }
];
