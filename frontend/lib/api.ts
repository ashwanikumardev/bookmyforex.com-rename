/**
 * API client for backend communication
 */

import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// Create axios instance
const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Unauthorized - clear token and redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;

// Auth APIs
export const authAPI = {
  register: (data: any) => api.post('/auth/register', data),
  login: (data: any) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  updatePassword: (data: any) => api.put('/auth/password', data),
};

// Rate APIs
export const rateAPI = {
  getAllRates: () => api.get('/rates'),
  getRateByCurrency: (currencyCode: string) => api.get(`/rates/${currencyCode}`),
  calculateAmount: (data: any) => api.post('/rates/calculate', data),
  createRateAlert: (data: any) => api.post('/rates/alert', data),
  getMyAlerts: () => api.get('/rates/alerts/my'),
  deleteRateAlert: (id: string) => api.delete(`/rates/alert/${id}`),
};

// Order APIs
export const orderAPI = {
  createOrder: (data: any) => api.post('/orders', data),
  getMyOrders: (params?: any) => api.get('/orders', { params }),
  getOrderById: (id: string) => api.get(`/orders/${id}`),
  cancelOrder: (id: string) => api.put(`/orders/${id}/cancel`),
};

// User APIs
export const userAPI = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (data: any) => api.put('/users/profile', data),
  submitKYC: (formData: FormData) => api.post('/users/kyc', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  getAddresses: () => api.get('/users/addresses'),
  addAddress: (data: any) => api.post('/users/addresses', data),
  updateAddress: (id: string, data: any) => api.put(`/users/addresses/${id}`, data),
  deleteAddress: (id: string) => api.delete(`/users/addresses/${id}`),
  getReferrals: () => api.get('/users/referrals'),
};

// Payment APIs
export const paymentAPI = {
  createPaymentOrder: (data: any) => api.post('/payments/create-order', data),
  verifyPayment: (data: any) => api.post('/payments/verify', data),
  getTransactions: (params?: any) => api.get('/payments/transactions', { params }),
};

// Offer APIs
export const offerAPI = {
  getAllOffers: () => api.get('/offers'),
  getOfferByCode: (code: string) => api.get(`/offers/${code}`),
  validateOffer: (data: any) => api.post('/offers/validate', data),
};

// Partner APIs
export const partnerAPI = {
  getAllPartners: () => api.get('/partners'),
  getPartnersByCity: (city: string) => api.get(`/partners/city/${city}`),
};

// Admin APIs
export const adminAPI = {
  getDashboard: () => api.get('/admin/dashboard'),
  
  // Users
  getAllUsers: (params?: any) => api.get('/admin/users', { params }),
  getUserById: (id: string) => api.get(`/admin/users/${id}`),
  updateKYCStatus: (id: string, data: any) => api.put(`/admin/users/${id}/kyc`, data),
  updateUserStatus: (id: string, data: any) => api.put(`/admin/users/${id}/status`, data),
  
  // Orders
  getAllOrders: (params?: any) => api.get('/admin/orders', { params }),
  getOrderById: (id: string) => api.get(`/admin/orders/${id}`),
  updateOrderStatus: (id: string, data: any) => api.put(`/admin/orders/${id}/status`, data),
  assignPartner: (id: string, data: any) => api.put(`/admin/orders/${id}/assign`, data),
  
  // Rates
  createRate: (data: any) => api.post('/admin/rates', data),
  updateRate: (currencyCode: string, data: any) => api.put(`/admin/rates/${currencyCode}`, data),
  deleteRate: (currencyCode: string) => api.delete(`/admin/rates/${currencyCode}`),
  bulkUpdateRates: (data: any) => api.post('/admin/rates/bulk-update', data),
  
  // Partners
  getAllPartners: () => api.get('/admin/partners'),
  createPartner: (data: any) => api.post('/admin/partners', data),
  updatePartner: (id: string, data: any) => api.put(`/admin/partners/${id}`, data),
  deletePartner: (id: string) => api.delete(`/admin/partners/${id}`),
  
  // Offers
  getAllOffers: () => api.get('/admin/offers'),
  createOffer: (data: any) => api.post('/admin/offers', data),
  updateOffer: (id: string, data: any) => api.put(`/admin/offers/${id}`, data),
  deleteOffer: (id: string) => api.delete(`/admin/offers/${id}`),
  
  // Audit logs
  getAuditLogs: (params?: any) => api.get('/admin/audit-logs', { params }),
};
