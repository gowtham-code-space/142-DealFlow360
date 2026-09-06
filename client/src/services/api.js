import { MOCK_QUOTATIONS, MOCK_CUSTOMERS, MOCK_PRODUCTS, MOCK_WAREHOUSES } from '../utils/constants';

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

// Rich Mock Fallbacks for Offline Dev Mode
const MOCK_NEGOTIATIONS = {
  'Q-2026-002': {
    quoteId: 'Q-2026-002',
    customerName: 'Apex Global Technologies',
    customerId: 'CUST-001',
    tier: 'PLATINUM',
    repName: 'Alex Rivera',
    status: 'CUSTOMER_NEGOTIATION',
    originalTerms: {
      totalValue: 11360000,
      discountPercent: 18,
      marginPercent: 44.2,
      paymentTerms: 'Net 30',
      slaLevel: 'Mission Critical 24/7'
    },
    counterOffer: {
      requestedValue: 10240000,
      requestedDiscountPercent: 25,
      requestedTerms: 'Net 60',
      customerNote: 'We are ready to sign this fiscal quarter if discount is adjusted to 25% and terms extended to Net 60.',
      timestamp: '2026-09-04 14:32'
    },
    parameterDiffs: [
      { field: 'Total Contract Value', original: '₹1,13,60,000', counter: '₹1,02,40,000', delta: '-₹11,20,000 (-9.8%)' },
      { field: 'Overall Discount %', original: '18.0%', counter: '25.0%', delta: '+7.0%' },
      { field: 'Payment Terms', original: 'Net 30', counter: 'Net 60', delta: '+30 days cash float' },
      { field: 'Gross Margin %', original: '44.2%', counter: '36.8%', delta: '-7.4%' }
    ],
    messages: [
      {
        id: 'msg-1',
        sender: 'customer',
        author: 'Marcus Vance (VP Procurement, Apex Global)',
        text: 'Hi Alex, we reviewed the initial proposal. The hardware specs look great, but our budget committee capped this line item at ₹1,02,40,000.',
        timestamp: 'Sep 4, 02:15 PM'
      },
      {
        id: 'msg-2',
        sender: 'rep',
        author: 'Alex Rivera (Sales Rep)',
        text: 'Hello Marcus, thanks for reaching out. I understand the budget constraint. If we move to 25% discount, I will need to check if manager approval is triggered for Net 60 terms.',
        timestamp: 'Sep 4, 02:22 PM'
      },
      {
        id: 'msg-3',
        sender: 'customer',
        author: 'Marcus Vance (VP Procurement, Apex Global)',
        text: 'Understood. We are submitting a formal counter-offer of ₹1,02,40,000 with Net 60. Please confirm if we can finalize today.',
        timestamp: 'Sep 4, 02:32 PM'
      }
    ]
  }
};

const MOCK_RECOMMENDATIONS = [
  {
    id: 'REC-01',
    productId: 'PRD-301',
    name: 'Optical Fiber SFP+ Transceiver Pack (10x)',
    category: 'Accessory',
    listPrice: 40000,
    recommendedPrice: 34000,
    confidence: '94% Match',
    reason: 'Bought by 88% of Platinum customers purchasing Cloud Server X1',
    marginImpact: '+3.2% Margin Boost'
  },
  {
    id: 'REC-02',
    productId: 'PRD-202',
    name: '24/7 Mission Critical Support SLA (Annual)',
    category: 'Service',
    listPrice: 100000,
    recommendedPrice: 85000,
    confidence: '89% Match',
    reason: 'High margin recurring add-on for Enterprise Switch deployments',
    marginImpact: '+5.5% Margin Boost'
  }
];

export const api = {
  // Quotations List & Detail
  async getQuotations() {
    try {
      const res = await fetch(`${API_BASE_URL}/quotations`);
      if (res.ok) return await res.json();
      // HTTP Error from Backend: DO NOT SILENTLY MOCK
      return {
        success: false,
        error: `Backend HTTP Error ${res.status}: ${res.statusText || 'Server Error'}`,
        status: res.status
      };
    } catch (e) {
      // Network failure / server offline -> mock fallback
      console.info('[API Offline Mode] Backend unreachable, using mock quotations:', e.message);
      return { success: true, data: MOCK_QUOTATIONS };
    }
  },

  async getQuotationById(id) {
    try {
      const res = await fetch(`${API_BASE_URL}/quotations/${id}`);
      if (res.ok) return await res.json();
      return {
        success: false,
        error: `Backend HTTP Error ${res.status}: ${res.statusText || 'Quotation Not Found'}`,
        status: res.status
      };
    } catch (e) {
      console.info('[API Offline Mode] Backend unreachable, using mock quotation detail:', e.message);
      const found = MOCK_QUOTATIONS.find(q => q.id === id) || MOCK_QUOTATIONS[0];
      return { success: true, data: found };
    }
  },

  async createQuotation(quoteData) {
    try {
      const res = await fetch(`${API_BASE_URL}/quotations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(quoteData)
      });
      if (res.ok) return await res.json();
      return {
        success: false,
        error: `Backend HTTP Error ${res.status}: ${res.statusText || 'Failed to create quote'}`,
        status: res.status
      };
    } catch (e) {
      console.info('[API Offline Mode] Backend unreachable, mocking quote creation:', e.message);
      const newQuote = {
        id: `Q-2026-${Math.floor(100 + Math.random() * 900)}`,
        ...quoteData,
        createdDate: new Date().toISOString().split('T')[0]
      };
      MOCK_QUOTATIONS.unshift(newQuote);
      return { success: true, data: newQuote };
    }
  },

  // Backend Discount & Policy Evaluator
  async evaluateDiscount(quotePayload) {
    try {
      const res = await fetch(`${API_BASE_URL}/discount/evaluate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(quotePayload)
      });
      if (res.ok) return await res.json();
      return {
        success: false,
        error: `Backend HTTP Error ${res.status}: ${res.statusText || 'Discount Evaluation Failed'}`,
        status: res.status
      };
    } catch (e) {
      console.info('[API Offline Mode] Backend unreachable, evaluating policy via fallback engine:', e.message);
      const discount = Number(quotePayload.discountPercent || 0);
      const tier = quotePayload.tier || 'STANDARD';
      const total = Number(quotePayload.totalValue || 50000);

      let verdict = 'APPROVED_AUTOMATIC';
      let approvalReason = 'Discount within tier policy limits';
      let approvalPath = ['Sales Rep (Auto-Approved)'];
      let riskLevel = 'LOW';
      let riskScore = 22;

      if (tier === 'STANDARD' && discount > 10) {
        verdict = 'REQUIRES_MANAGER_APPROVAL';
        approvalReason = `Discount (${discount}%) exceeds Standard Tier limit (10%)`;
        approvalPath = ['Sales Rep', 'Sales Manager Approval Required'];
        riskLevel = 'MEDIUM';
        riskScore = 55;
      } else if (tier === 'GOLD' && discount > 20) {
        verdict = 'REQUIRES_MANAGER_APPROVAL';
        approvalReason = `Discount (${discount}%) exceeds Gold Tier limit (20%)`;
        approvalPath = ['Sales Rep', 'Sales Manager Approval Required'];
        riskLevel = 'MEDIUM';
        riskScore = 48;
      } else if (discount > 30 || total > 200000) {
        verdict = 'REQUIRES_DUAL_APPROVAL';
        approvalReason = `Discount (${discount}%) or Contract Value exceeds Executive threshold`;
        approvalPath = ['Sales Rep', 'Sales Manager', 'VP Finance Approval Required'];
        riskLevel = 'HIGH';
        riskScore = 78;
      } else if (discount > 45) {
        verdict = 'REJECTED_EXCEEDS_CEILING';
        approvalReason = `Discount (${discount}%) exceeds hard policy ceiling (45%)`;
        approvalPath = ['Rejected'];
        riskLevel = 'CRITICAL';
        riskScore = 95;
      }

      const calculatedMargin = Math.max(12, 50 - discount * 0.8).toFixed(1);

      return {
        success: true,
        data: {
          verdict,
          requiresApprovalReason: verdict === 'APPROVED_AUTOMATIC' ? null : approvalReason,
          approvalPath,
          calculatedMarginPercent: Number(calculatedMargin),
          marginHealth: Number(calculatedMargin) >= 35 ? 'HEALTHY' : 'WARNING',
          riskLevel,
          riskScore
        }
      };
    }
  },

  // Cross-sell / Upsell Recommendations
  async getRecommendations(customerId) {
    try {
      const res = await fetch(`${API_BASE_URL}/recommendations?customerId=${customerId}`);
      if (res.ok) return await res.json();
      return {
        success: false,
        error: `Backend HTTP Error ${res.status}: ${res.statusText || 'Failed to fetch recommendations'}`,
        status: res.status
      };
    } catch (e) {
      console.info('[API Offline Mode] Backend unreachable, using mock recommendations:', e.message);
      return { success: true, data: MOCK_RECOMMENDATIONS };
    }
  },

  // Negotiations & Direct Chat
  async getNegotiation(quoteId) {
    try {
      const res = await fetch(`${API_BASE_URL}/negotiation/${quoteId}`);
      if (res.ok) return await res.json();
      return {
        success: false,
        error: `Backend HTTP Error ${res.status}: ${res.statusText || 'Negotiation Session Not Found'}`,
        status: res.status
      };
    } catch (e) {
      console.info('[API Offline Mode] Backend unreachable, using mock negotiation:', e.message);
      const data = MOCK_NEGOTIATIONS[quoteId] || MOCK_NEGOTIATIONS['Q-2026-002'];
      return { success: true, data };
    }
  },

  async sendNegotiationMessage(quoteId, messagePayload) {
    try {
      const res = await fetch(`${API_BASE_URL}/negotiation/${quoteId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(messagePayload)
      });
      if (res.ok) return await res.json();
      return {
        success: false,
        error: `Backend HTTP Error ${res.status}: ${res.statusText || 'Failed to send message'}`,
        status: res.status
      };
    } catch (e) {
      console.info('[API Offline Mode] Backend unreachable, mocking message send:', e.message);
      const target = MOCK_NEGOTIATIONS[quoteId] || MOCK_NEGOTIATIONS['Q-2026-002'];
      const newMsg = {
        id: `msg-${Date.now()}`,
        sender: messagePayload.sender || 'rep',
        author: messagePayload.author || 'Alex Rivera (Sales Rep)',
        text: messagePayload.text,
        timestamp: 'Just now'
      };
      target.messages.push(newMsg);
      return { success: true, data: newMsg };
    }
  },

  async submitCounterOffer(quoteId, counterData) {
    try {
      const res = await fetch(`${API_BASE_URL}/negotiation/${quoteId}/counter`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(counterData)
      });
      if (res.ok) return await res.json();
      return {
        success: false,
        error: `Backend HTTP Error ${res.status}: ${res.statusText || 'Failed to submit counter-offer'}`,
        status: res.status
      };
    } catch (e) {
      console.info('[API Offline Mode] Backend unreachable, mocking counter-offer evaluation:', e.message);
      const discount = Number(counterData.proposedDiscount || 20);
      const requiresReapproval = discount > 20;

      return {
        success: true,
        data: {
          quoteId,
          newDiscountPercent: discount,
          requiresReapproval,
          reapprovalReason: requiresReapproval ? `Counter-offer discount (${discount}%) requires Sales Manager re-approval` : null,
          reapprovalPath: requiresReapproval ? ['Sales Rep', 'Sales Manager Re-approval'] : ['Auto-Approved'],
          status: requiresReapproval ? 'PENDING_APPROVAL' : 'CUSTOMER_NEGOTIATION'
        }
      };
    }
  },

  // Manager Approval Actions
  async approveQuote(approvalId, comments = '') {
    try {
      const res = await fetch(`${API_BASE_URL}/v1/approvals/${approvalId}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ comments })
      });
      if (res.ok) return await res.json();
      return {
        success: false,
        error: `Backend HTTP Error ${res.status}: ${res.statusText || 'Approval endpoint unmounted or unreachable'}`,
        status: res.status
      };
    } catch (e) {
      console.info('[API Offline Mode] Backend unreachable, processing approval decision locally:', e.message);
      return {
        success: true,
        data: { id: approvalId, status: 'APPROVED', comments, decisionDate: new Date().toISOString() }
      };
    }
  },

  async rejectQuote(approvalId, comments = '') {
    try {
      const res = await fetch(`${API_BASE_URL}/v1/approvals/${approvalId}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ comments })
      });
      if (res.ok) return await res.json();
      return {
        success: false,
        error: `Backend HTTP Error ${res.status}: ${res.statusText || 'Rejection endpoint unmounted or unreachable'}`,
        status: res.status
      };
    } catch (e) {
      console.info('[API Offline Mode] Backend unreachable, processing rejection decision locally:', e.message);
      return {
        success: true,
        data: { id: approvalId, status: 'REJECTED', comments, decisionDate: new Date().toISOString() }
      };
    }
  },

  async returnQuote(approvalId, comments = '') {
    try {
      const res = await fetch(`${API_BASE_URL}/v1/approvals/${approvalId}/return`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ comments })
      });
      if (res.ok) return await res.json();
      return {
        success: false,
        error: `Backend HTTP Error ${res.status}: ${res.statusText || 'Return endpoint unmounted or unreachable'}`,
        status: res.status
      };
    } catch (e) {
      console.info('[API Offline Mode] Backend unreachable, processing return decision locally:', e.message);
      return {
        success: true,
        data: { id: approvalId, status: 'CUSTOMER_NEGOTIATION', comments, decisionDate: new Date().toISOString() }
      };
    }
  },

  // Authenticated Helper
  async request(endpoint, options = {}) {
    try {
      const token = localStorage.getItem('dealflow_token');
      const headers = {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        ...options.headers
      };

      const res = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers
      });

      const json = await res.json().catch(() => null);
      if (res.ok) {
        return json || { success: true };
      }
      return {
        success: false,
        status: res.status,
        message: json?.message || res.statusText || 'Request failed'
      };
    } catch (err) {
      return {
        success: false,
        error: err.message,
        message: 'Network error or backend unreachable'
      };
    }
  },

  // Products, Customers & Warehouses
  async getProducts() {
    const res = await this.request('/products');
    if (res.success && res.data) return res;
    return { success: true, data: MOCK_PRODUCTS };
  },

  async createProduct(productData) {
    return this.request('/products', {
      method: 'POST',
      body: JSON.stringify(productData)
    });
  },

  async updateProduct(id, productData) {
    return this.request(`/products/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(productData)
    });
  },

  async deleteProduct(id) {
    return this.request(`/products/${id}`, { method: 'DELETE' });
  },

  async getCustomers() {
    const res = await this.request('/customers');
    if (res.success && res.data) return res;
    return { success: true, data: MOCK_CUSTOMERS };
  },

  async createCustomer(customerData) {
    return this.request('/customers', {
      method: 'POST',
      body: JSON.stringify(customerData)
    });
  },

  async updateCustomer(id, customerData) {
    return this.request(`/customers/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(customerData)
    });
  },

  async deleteCustomer(id) {
    return this.request(`/customers/${id}`, { method: 'DELETE' });
  },

  async reactivateCustomer(id) {
    return this.request(`/customers/${id}/reactivate`, { method: 'POST' });
  },

  async getWarehouses() {
    const res = await this.request('/warehouses');
    if (res.success && res.data) return res;
    return { success: true, data: MOCK_WAREHOUSES };
  },

  async createWarehouse(warehouseData) {
    return this.request('/warehouses', {
      method: 'POST',
      body: JSON.stringify(warehouseData)
    });
  },

  async updateWarehouse(id, warehouseData) {
    return this.request(`/warehouses/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(warehouseData)
    });
  },

  async deleteWarehouse(id) {
    return this.request(`/warehouses/${id}`, { method: 'DELETE' });
  },

  async getWarehouseInventory(warehouseId) {
    return this.request(`/warehouses/${warehouseId}/inventory`);
  },

  async adjustWarehouseInventory(warehouseId, productId, data) {
    return this.request(`/warehouses/${warehouseId}/inventory/${productId}`, {
      method: 'PATCH',
      body: JSON.stringify(data)
    });
  },

  // Users & RBAC
  async getUsers() {
    return this.request('/users');
  },

  async createUser(userData) {
    return this.request('/users', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
  },

  async updateUser(id, userData) {
    return this.request(`/users/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(userData)
    });
  },

  async deleteUser(id) {
    return this.request(`/users/${id}`, { method: 'DELETE' });
  },

  async reactivateUser(id) {
    return this.request(`/users/${id}/reactivate`, { method: 'POST' });
  },

  async bulkCreateUsers(users) {
    return this.request('/users/bulk', {
      method: 'POST',
      body: JSON.stringify({ users })
    });
  },

  async getRoles() {
    return this.request('/auth/roles');
  },

  // Product Variants
  async getProductVariants(productId) {
    return this.request(`/products/${productId}/variants`);
  },

  async createProductVariant(productId, variantData) {
    return this.request(`/products/${productId}/variants`, {
      method: 'POST',
      body: JSON.stringify(variantData)
    });
  },

  async updateProductVariant(productId, variantId, variantData) {
    return this.request(`/products/${productId}/variants/${variantId}`, {
      method: 'PATCH',
      body: JSON.stringify(variantData)
    });
  },

  async deleteProductVariant(productId, variantId) {
    return this.request(`/products/${productId}/variants/${variantId}`, {
      method: 'DELETE'
    });
  },

  // Discount Policies & Rules
  async getDiscountPolicies() {
    return this.request('/config/discount-policies');
  },

  async createDiscountPolicy(policyData) {
    return this.request('/config/discount-policies', {
      method: 'POST',
      body: JSON.stringify(policyData)
    });
  },

  async updateDiscountPolicy(id, policyData) {
    return this.request(`/config/discount-policies/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(policyData)
    });
  },

  async deleteDiscountPolicy(id) {
    return this.request(`/config/discount-policies/${id}`, { method: 'DELETE' });
  },

  async getDiscountTypes() {
    return this.request('/config/discount-types');
  },

  async createDiscountType(typeData) {
    return this.request('/config/discount-types', {
      method: 'POST',
      body: JSON.stringify(typeData)
    });
  },

  async updateDiscountType(id, typeData) {
    return this.request(`/config/discount-types/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(typeData)
    });
  },

  async deleteDiscountType(id) {
    return this.request(`/config/discount-types/${id}`, { method: 'DELETE' });
  },

  // Approval Chain Rules
  async getApprovalChains() {
    return this.request('/config/approval-chains');
  },

  async createApprovalChain(chainData) {
    return this.request('/config/approval-chains', {
      method: 'POST',
      body: JSON.stringify(chainData)
    });
  },

  async updateApprovalChain(id, chainData) {
    return this.request(`/config/approval-chains/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(chainData)
    });
  },

  async deleteApprovalChain(id) {
    return this.request(`/config/approval-chains/${id}`, { method: 'DELETE' });
  },

  // Pool Config
  async getPoolConfig() {
    return this.request('/config/pool-config');
  },

  async updatePoolConfig(poolData) {
    return this.request('/config/pool-config', {
      method: 'PUT',
      body: JSON.stringify(poolData)
    });
  },

  // Subscription Plans
  async getSubscriptionPlans() {
    return this.request('/config/subscription-plans');
  },

  async createSubscriptionPlan(planData) {
    return this.request('/config/subscription-plans', {
      method: 'POST',
      body: JSON.stringify(planData)
    });
  },

  async updateSubscriptionPlan(id, planData) {
    return this.request(`/config/subscription-plans/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(planData)
    });
  },

  async deleteSubscriptionPlan(id) {
    return this.request(`/config/subscription-plans/${id}`, { method: 'DELETE' });
  },

  // Upsell Rules
  async getUpsellRules() {
    return this.request('/config/upsell-rules');
  },

  async createUpsellRule(ruleData) {
    return this.request('/config/upsell-rules', {
      method: 'POST',
      body: JSON.stringify(ruleData)
    });
  },

  async updateUpsellRule(id, ruleData) {
    return this.request(`/config/upsell-rules/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(ruleData)
    });
  },

  async deleteUpsellRule(id) {
    return this.request(`/config/upsell-rules/${id}`, { method: 'DELETE' });
  },

  // Global Audit Logs
  async getGlobalAuditLogs(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/audit-logs${query ? `?${query}` : ''}`);
  }
};
