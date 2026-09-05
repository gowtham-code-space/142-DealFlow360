import { MOCK_QUOTATIONS, MOCK_CUSTOMERS, MOCK_PRODUCTS, MOCK_WAREHOUSES } from '../utils/constants';

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

// Unified mock and real API fetcher
export const api = {
  // Quotations
  async getQuotations() {
    try {
      const res = await fetch(`${API_BASE_URL}/quotations`);
      if (res.ok) return await res.json();
    } catch (e) {
      console.info('[API] Using mock quotations dataset:', e.message);
    }
    return { success: true, data: MOCK_QUOTATIONS };
  },

  async getQuotationById(id) {
    try {
      const res = await fetch(`${API_BASE_URL}/quotations/${id}`);
      if (res.ok) return await res.json();
    } catch (e) {
      console.info('[API] Using mock quotation detail:', e.message);
    }
    const found = MOCK_QUOTATIONS.find(q => q.id === id) || MOCK_QUOTATIONS[0];
    return { success: true, data: found };
  },

  // Products
  async getProducts() {
    try {
      const res = await fetch(`${API_BASE_URL}/products`);
      if (res.ok) return await res.json();
    } catch (e) {
      console.info('[API] Using mock products:', e.message);
    }
    return { success: true, data: MOCK_PRODUCTS };
  },

  // Customers
  async getCustomers() {
    try {
      const res = await fetch(`${API_BASE_URL}/customers`);
      if (res.ok) return await res.json();
    } catch (e) {
      console.info('[API] Using mock customers:', e.message);
    }
    return { success: true, data: MOCK_CUSTOMERS };
  },

  // Warehouses & Inventory
  async getWarehouses() {
    try {
      const res = await fetch(`${API_BASE_URL}/inventory/warehouses`);
      if (res.ok) return await res.json();
    } catch (e) {
      console.info('[API] Using mock warehouses:', e.message);
    }
    return { success: true, data: MOCK_WAREHOUSES };
  }
};
