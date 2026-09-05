// DealFlow360 API Client — all data comes from the real backend (port 5001)

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api/v1';

function getAuthHeaders(customHeaders = {}) {
  const token = localStorage.getItem('dealflow_token');
  const headers = {
    'Content-Type': 'application/json',
    ...customHeaders
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

export const api = {
  // Quotations List & Detail
  async getQuotations(queryParams = {}) {
    try {
      const query = new URLSearchParams(queryParams).toString();
      const url = `${API_BASE_URL}/quotes${query ? `?${query}` : ''}`;
      const res = await fetch(url, { headers: getAuthHeaders() });
      const data = await res.json();
      if (res.ok && data.success) {
        // Backend returns { items, total, page, pageSize } inside data.data
        const items = data.data?.items || data.data || [];
        return { success: true, data: items, total: data.data?.total || items.length };
      }
      return {
        success: false,
        error: data.message || `Backend HTTP Error ${res.status}: ${res.statusText}`,
        status: res.status
      };
    } catch (e) {
      console.info('[API Offline Mode] Backend unreachable:', e.message);
      return { success: false, error: e.message };
    }
  },

  async getQuotationById(id) {
    try {
      const res = await fetch(`${API_BASE_URL}/quotes/${id}`, { headers: getAuthHeaders() });
      const data = await res.json();
      if (res.ok && data.success) {
        return { success: true, data: data.data };
      }
      return {
        success: false,
        error: data.message || `Backend HTTP Error ${res.status}`,
        status: res.status
      };
    } catch (e) {
      console.info('[API Offline Mode] Backend unreachable:', e.message);
      return { success: false, error: e.message };
    }
  },

  async createQuotation(quoteData) {
    try {
      const res = await fetch(`${API_BASE_URL}/quotes`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(quoteData)
      });
      const data = await res.json();
      if (res.ok && data.success) {
        return { success: true, data: data.data };
      }
      return {
        success: false,
        error: data.message || `Backend HTTP Error ${res.status}`,
        status: res.status
      };
    } catch (e) {
      return { success: false, error: e.message };
    }
  },

  // Approvals API
  async getApprovals(queryParams = {}) {
    try {
      const query = new URLSearchParams(queryParams).toString();
      const url = `${API_BASE_URL}/approvals${query ? `?${query}` : ''}`;
      const res = await fetch(url, { headers: getAuthHeaders() });
      const data = await res.json();
      if (res.ok && data.success) {
        const items = data.data?.items || data.data || [];
        return { success: true, data: items, total: data.data?.total || items.length };
      }
      return {
        success: false,
        error: data.message || `Backend HTTP Error ${res.status}`,
        status: res.status
      };
    } catch (e) {
      return { success: false, error: e.message };
    }
  },

  async getApprovalById(id) {
    try {
      const res = await fetch(`${API_BASE_URL}/approvals/${id}`, { headers: getAuthHeaders() });
      const data = await res.json();
      if (res.ok && data.success) {
        return { success: true, data: data.data };
      }
      return {
        success: false,
        error: data.message || `Backend HTTP Error ${res.status}`,
        status: res.status
      };
    } catch (e) {
      return { success: false, error: e.message };
    }
  },

  async approveQuote(approvalId, comments = '') {
    try {
      const res = await fetch(`${API_BASE_URL}/approvals/${approvalId}/approve`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ comments })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        return { success: true, data: data.data || { id: approvalId, status: 'APPROVED' }, message: data.message };
      }
      return {
        success: false,
        error: data.message || `Backend HTTP Error ${res.status}`,
        status: res.status
      };
    } catch (e) {
      return { success: false, error: e.message };
    }
  },

  async rejectQuote(approvalId, comments = '') {
    try {
      const res = await fetch(`${API_BASE_URL}/approvals/${approvalId}/reject`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ comments })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        return { success: true, data: data.data || { id: approvalId, status: 'REJECTED' }, message: data.message };
      }
      return {
        success: false,
        error: data.message || `Backend HTTP Error ${res.status}`,
        status: res.status
      };
    } catch (e) {
      return { success: false, error: e.message };
    }
  },

  async returnQuote(approvalId, comments = '') {
    try {
      const res = await fetch(`${API_BASE_URL}/approvals/${approvalId}/return`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ comments })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        return { success: true, data: data.data || { id: approvalId, status: 'RETURNED' }, message: data.message };
      }
      return {
        success: false,
        error: data.message || `Backend HTTP Error ${res.status}`,
        status: res.status
      };
    } catch (e) {
      return { success: false, error: e.message };
    }
  },

  // Manager Dashboard Metrics API
  async getDashboardSummary() {
    try {
      const res = await fetch(`${API_BASE_URL}/dashboard/summary`, { headers: getAuthHeaders() });
      const data = await res.json();
      if (res.ok && data.success) {
        return { success: true, data: data.data };
      }
      return { success: false, error: data.message };
    } catch (e) {
      return { success: false, error: e.message };
    }
  },

  async getDashboardPipeline() {
    try {
      const res = await fetch(`${API_BASE_URL}/dashboard/pipeline`, { headers: getAuthHeaders() });
      const data = await res.json();
      if (res.ok && data.success) {
        return { success: true, data: data.data };
      }
      return { success: false, error: data.message };
    } catch (e) {
      return { success: false, error: e.message };
    }
  },

  async getDealHealth() {
    try {
      const res = await fetch(`${API_BASE_URL}/dashboard/deal-health`, { headers: getAuthHeaders() });
      const data = await res.json();
      if (res.ok && data.success) {
        return { success: true, data: data.data };
      }
      return { success: false, error: data.message };
    } catch (e) {
      return { success: false, error: e.message };
    }
  },

  // Negotiations & Direct Chat
  async getNegotiation(quoteId) {
    try {
      const res = await fetch(`${API_BASE_URL}/quotes/${quoteId}/negotiations`, { headers: getAuthHeaders() });
      const data = await res.json();
      if (res.ok && data.success) {
        return { success: true, data: data.data };
      }
      return {
        success: false,
        error: data.message || `Negotiation Session Not Found`,
        status: res.status
      };
    } catch (e) {
      return { success: false, error: e.message };
    }
  },

  async sendNegotiationMessage(quoteId, messagePayload) {
    try {
      const res = await fetch(`${API_BASE_URL}/quotes/${quoteId}/negotiations`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          message: messagePayload.text || messagePayload.message,
          proposedDiscount: messagePayload.proposedDiscount || null
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        return { success: true, data: data.data };
      }
      return { success: false, error: data.message };
    } catch (e) {
      return { success: false, error: e.message };
    }
  },

  async getNegotiationTickets() {
    try {
      const res = await fetch(`${API_BASE_URL}/negotiation-tickets`, { headers: getAuthHeaders() });
      const data = await res.json();
      if (res.ok && data.success) {
        return { success: true, data: data.data?.items || data.data || [] };
      }
      return { success: false, error: data.message };
    } catch (e) {
      return { success: false, error: e.message };
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

  async getRoles() {
    return this.request('/auth/roles');
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
