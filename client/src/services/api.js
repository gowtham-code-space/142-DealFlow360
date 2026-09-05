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

  // Products, Customers & Warehouses
  async getProducts() {
    try {
      const res = await fetch(`${API_BASE_URL}/products`, { headers: getAuthHeaders() });
      const data = await res.json();
      if (res.ok && data.success) {
        return { success: true, data: data.data?.items || data.data || [] };
      }
      return { success: false, error: data.message };
    } catch (e) {
      return { success: false, error: e.message };
    }
  },

  async getCustomers() {
    try {
      const res = await fetch(`${API_BASE_URL}/customers`, { headers: getAuthHeaders() });
      const data = await res.json();
      if (res.ok && data.success) {
        return { success: true, data: data.data?.items || data.data || [] };
      }
      return { success: false, error: data.message };
    } catch (e) {
      return { success: false, error: e.message };
    }
  },

  async getWarehouses() {
    try {
      const res = await fetch(`${API_BASE_URL}/warehouses`, { headers: getAuthHeaders() });
      const data = await res.json();
      if (res.ok && data.success) {
        return { success: true, data: data.data?.items || data.data || [] };
      }
      return { success: false, error: data.message };
    } catch (e) {
      return { success: false, error: e.message };
    }
  },

  // Notifications API
  async getNotifications() {
    try {
      const res = await fetch(`${API_BASE_URL}/notifications`, { headers: getAuthHeaders() });
      const data = await res.json();
      if (res.ok && data.success) {
        return { success: true, data: data.data?.items || data.data || [] };
      }
      return { success: false, error: data.message };
    } catch (e) {
      return { success: false, error: e.message };
    }
  },

  async markNotificationRead(id) {
    try {
      const res = await fetch(`${API_BASE_URL}/notifications/${id}/read`, {
        method: 'PATCH',
        headers: getAuthHeaders()
      });
      const data = await res.json();
      return { success: Boolean(res.ok && data.success) };
    } catch (e) {
      return { success: false, error: e.message };
    }
  },

  async markAllNotificationsRead() {
    try {
      const res = await fetch(`${API_BASE_URL}/notifications/mark-all-read`, {
        method: 'POST',
        headers: getAuthHeaders()
      });
      const data = await res.json();
      return { success: Boolean(res.ok && data.success) };
    } catch (e) {
      return { success: false, error: e.message };
    }
  }
};
