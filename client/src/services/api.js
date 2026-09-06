export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';

// Helper to get token and headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('dealflow_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
};

export const api = {
  // ─── Dashboard ─────────────────────────────────────────────────────────────
  
  async getDashboardSummary(periodDays = 30) {
    const res = await fetch(`${API_BASE_URL}/dashboard/summary?periodDays=${periodDays}`, {
      headers: getAuthHeaders()
    });
    const data = await res.json();
    return res.ok ? data : { success: false, error: data.message || 'Failed to fetch summary', status: res.status };
  },

  async getDashboardPipeline() {
    const res = await fetch(`${API_BASE_URL}/dashboard/pipeline`, {
      headers: getAuthHeaders()
    });
    const data = await res.json();
    return res.ok ? data : { success: false, error: data.message || 'Failed to fetch pipeline', status: res.status };
  },
  
  async getDealHealth() {
    const res = await fetch(`${API_BASE_URL}/dashboard/deal-health`, {
      headers: getAuthHeaders()
    });
    const data = await res.json();
    return res.ok ? data : { success: false, error: data.message || 'Failed to fetch deal health', status: res.status };
  },

  async getStalledDeals(stallDays = 14) {
    const res = await fetch(`${API_BASE_URL}/dashboard/stalled-deals?stallDays=${stallDays}`, {
      headers: getAuthHeaders()
    });
    const data = await res.json();
    return res.ok ? data : { success: false, error: data.message || 'Failed to fetch stalled deals', status: res.status };
  },

  // ─── Quotations List & Detail ─────────────────────────────────────────────
  
  async getQuotations() {
    const res = await fetch(`${API_BASE_URL}/quotes`, {
      headers: getAuthHeaders()
    });
    const data = await res.json();
    return res.ok ? data : { success: false, error: data.message || 'Failed to fetch quotations', status: res.status };
  },

  async getQuotationById(id) {
    const res = await fetch(`${API_BASE_URL}/quotes/${id}`, {
      headers: getAuthHeaders()
    });
    const data = await res.json();
    return res.ok ? data : { success: false, error: data.message || 'Quotation Not Found', status: res.status };
  },

  async createQuotation(quoteData) {
    const res = await fetch(`${API_BASE_URL}/quotes`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(quoteData)
    });
    const data = await res.json();
    return res.ok ? data : { success: false, error: data.message || 'Failed to create quote', status: res.status };
  },
  
  async updateQuotation(id, quoteData) {
    const res = await fetch(`${API_BASE_URL}/quotes/${id}`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(quoteData)
    });
    const data = await res.json();
    return res.ok ? data : { success: false, error: data.message || 'Failed to update quote', status: res.status };
  },

  async submitQuotation(id) {
    const res = await fetch(`${API_BASE_URL}/quotes/${id}/submit`, {
      method: 'POST',
      headers: getAuthHeaders()
    });
    const data = await res.json();
    return res.ok ? data : { success: false, error: data.message || 'Failed to submit quote', status: res.status };
  },

  async getQuoteRisk(id) {
    const res = await fetch(`${API_BASE_URL}/quotes/${id}/risk`, {
      headers: getAuthHeaders()
    });
    const data = await res.json();
    return res.ok ? data : { success: false, error: data.message || 'Failed to get quote risk', status: res.status };
  },
  
  async addQuoteLine(id, lineData) {
    const res = await fetch(`${API_BASE_URL}/quotes/${id}/lines`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(lineData)
    });
    const data = await res.json();
    return res.ok ? data : { success: false, error: data.message || 'Failed to add line item', status: res.status };
  },
  
  async updateQuoteLine(id, lineId, lineData) {
    const res = await fetch(`${API_BASE_URL}/quotes/${id}/lines/${lineId}`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(lineData)
    });
    const data = await res.json();
    return res.ok ? data : { success: false, error: data.message || 'Failed to update line item', status: res.status };
  },

  async deleteQuoteLine(id, lineId) {
    const res = await fetch(`${API_BASE_URL}/quotes/${id}/lines/${lineId}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    const data = await res.json();
    return res.ok ? data : { success: false, error: data.message || 'Failed to delete line item', status: res.status };
  },

  // ─── Cross-sell / Upsell Recommendations ────────────────────────────────
  
  async getRecommendations(quoteId) {
    const res = await fetch(`${API_BASE_URL}/quotes/${quoteId}/recommendations`, {
      headers: getAuthHeaders()
    });
    const data = await res.json();
    return res.ok ? data : { success: false, error: data.message || 'Failed to fetch recommendations', status: res.status };
  },

  // ─── Negotiations & Direct Chat ──────────────────────────────────────────
  
  async getNegotiation(quoteId) {
    const res = await fetch(`${API_BASE_URL}/quotes/${quoteId}/negotiations`, {
      headers: getAuthHeaders()
    });
    const data = await res.json();
    return res.ok ? data : { success: false, error: data.message || 'Negotiation Session Not Found', status: res.status };
  },

  async sendNegotiationMessage(quoteId, messagePayload) {
    const res = await fetch(`${API_BASE_URL}/quotes/${quoteId}/negotiations`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(messagePayload)
    });
    const data = await res.json();
    return res.ok ? data : { success: false, error: data.message || 'Failed to send message', status: res.status };
  },
  
  async getNegotiationTickets(quoteId) {
    const res = await fetch(`${API_BASE_URL}/quotes/${quoteId}/negotiation-tickets`, {
      headers: getAuthHeaders()
    });
    const data = await res.json();
    return res.ok ? data : { success: false, error: data.message || 'Failed to get tickets', status: res.status };
  },

  async submitCounterOffer(ticketId, counterData) {
    const res = await fetch(`${API_BASE_URL}/negotiation-tickets/${ticketId}/counter`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(counterData)
    });
    const data = await res.json();
    return res.ok ? data : { success: false, error: data.message || 'Failed to submit counter-offer', status: res.status };
  },

  async acceptNegotiationTicket(ticketId, payload) {
    const res = await fetch(`${API_BASE_URL}/negotiation-tickets/${ticketId}/accept`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload || {})
    });
    const data = await res.json();
    return res.ok ? data : { success: false, error: data.message || 'Failed to accept terms', status: res.status };
  },

  async escalateNegotiationTicket(ticketId, payload) {
    const res = await fetch(`${API_BASE_URL}/negotiation-tickets/${ticketId}/escalate`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload || {})
    });
    const data = await res.json();
    return res.ok ? data : { success: false, error: data.message || 'Failed to escalate ticket', status: res.status };
  },

  async exportNegotiationSummaryPdf(quoteId) {
    const res = await fetch(`${API_BASE_URL}/quotes/${quoteId}/negotiation-summary.pdf`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    if (!res.ok) {
      const data = await res.json();
      return { success: false, error: data.message || 'Failed to export PDF', status: res.status };
    }
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `DealFlow360-Negotiation-Summary-${quoteId}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    return { success: true };
  },

  // ─── Manager Approval Actions ─────────────────────────────────────────────
  
  async approveQuote(approvalId, comments = '') {
    const res = await fetch(`${API_BASE_URL}/approvals/${approvalId}/approve`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ comments })
    });
    const data = await res.json();
    return res.ok ? data : { success: false, error: data.message || 'Approval failed', status: res.status };
  },

  async rejectQuote(approvalId, comments = '') {
    const res = await fetch(`${API_BASE_URL}/approvals/${approvalId}/reject`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ comments })
    });
    const data = await res.json();
    return res.ok ? data : { success: false, error: data.message || 'Rejection failed', status: res.status };
  },

  async returnQuote(approvalId, comments = '') {
    const res = await fetch(`${API_BASE_URL}/approvals/${approvalId}/return`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ comments })
    });
    const data = await res.json();
    return res.ok ? data : { success: false, error: data.message || 'Return failed', status: res.status };
  },

  // ─── Products, Customers & Warehouses ────────────────────────────────────
  
  async getProducts() {
    const res = await fetch(`${API_BASE_URL}/products`, {
      headers: getAuthHeaders()
    });
    const data = await res.json();
    return res.ok ? data : { success: false, error: data.message || 'Failed to fetch products', status: res.status };
  },

  async getCustomers() {
    const res = await fetch(`${API_BASE_URL}/customers`, {
      headers: getAuthHeaders()
    });
    const data = await res.json();
    return res.ok ? data : { success: false, error: data.message || 'Failed to fetch customers', status: res.status };
  },

  async getWarehouses() {
    const res = await fetch(`${API_BASE_URL}/warehouses`, {
      headers: getAuthHeaders()
    });
    const data = await res.json();
    return res.ok ? data : { success: false, error: data.message || 'Failed to fetch warehouses', status: res.status };
  },

  async getInventory(productId) {
    const query = productId ? `?productId=${productId}` : '';
    const res = await fetch(`${API_BASE_URL}/inventory${query}`, {
      headers: getAuthHeaders()
    });
    const data = await res.json();
    return res.ok ? data : { success: false, error: data.message || 'Failed to fetch inventory', status: res.status };
  },

  // ─── Request helper (used by admin methods) ───────────────────────────────
  request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const headers = getAuthHeaders();
    return fetch(url, { ...options, headers: { ...headers, ...(options.headers || {}) } })
      .then(async res => {
        const data = await res.json();
        return res.ok ? data : { success: false, error: data.message || 'Request failed', status: res.status };
      })
      .catch(err => ({ success: false, error: err.message }));
  },

  // ─── Customer Portal Resource Catalog & Hold Endpoints ─────────────────────

  async getPortalResources() {
    const res = await fetch(`${API_BASE_URL}/portal/resources`, {
      headers: getAuthHeaders()
    });
    const data = await res.json();
    return res.ok ? data : { success: false, error: data.message || 'Failed to fetch portal resources', status: res.status };
  },

  async createProductHolds(items) {
    const res = await fetch(`${API_BASE_URL}/portal/holds`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ items })
    });
    const data = await res.json();
    return res.ok ? data : { success: false, error: data.message || 'Failed to reserve resources', status: res.status };
  },

  async createProductHold(productId, holdData = {}) {
    const res = await fetch(`${API_BASE_URL}/portal/resources/${productId}/hold`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(holdData)
    });
    const data = await res.json();
    return res.ok ? data : { success: false, error: data.message || 'Failed to reserve resource hold', status: res.status };
  },

  async getHoldStatus(holdId) {
    const res = await fetch(`${API_BASE_URL}/portal/holds/${holdId}`, {
      headers: getAuthHeaders()
    });
    const data = await res.json();
    return res.ok ? data : { success: false, error: data.message || 'Failed to fetch hold status', status: res.status };
  },

  async generateQuote(quotePayload) {
    const res = await fetch(`${API_BASE_URL}/portal/quotes/generate`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(quotePayload)
    });
    const data = await res.json();
    return res.ok ? data : { success: false, error: data.message || 'Failed to generate quotation', status: res.status };
  },

  // ─── Warehouse Admin Operations ─────────────────────────────────────────────

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

  // ─── Users & RBAC ────────────────────────────────────────────────────────────

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

  // ─── Product Variants ────────────────────────────────────────────────────────

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

  // ─── Discount Policies & Rules ───────────────────────────────────────────────

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

  // ─── Approval Chain Rules ────────────────────────────────────────────────────

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

  // ─── Pool Config ─────────────────────────────────────────────────────────────

  async getPoolConfig() {
    return this.request('/config/pool-config');
  },

  async updatePoolConfig(poolData) {
    return this.request('/config/pool-config', {
      method: 'PUT',
      body: JSON.stringify(poolData)
    });
  },

  // ─── Subscription Plans ──────────────────────────────────────────────────────

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

  // ─── Upsell Rules ────────────────────────────────────────────────────────────

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

  // ─── Global Audit Logs ───────────────────────────────────────────────────────

  async getGlobalAuditLogs(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/audit-logs${query ? `?${query}` : ''}`);
  }
};
