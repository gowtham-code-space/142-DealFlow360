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
  }
};
