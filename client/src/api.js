import { handleMockRequest } from './mockBackend';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

export async function request(endpoint, options = {}) {
  // If running on GitHub Pages and no custom API URL is configured, use mock backend directly for zero-latency, glitch-free demo
  const isGitHubPages = typeof window !== 'undefined' && window.location.hostname.includes('github.io');
  if (isGitHubPages && !import.meta.env.VITE_API_URL) {
    try {
      return await handleMockRequest(endpoint, options);
    } catch (mockErr) {
      console.warn('[MockBackend Error]', mockErr);
      throw mockErr;
    }
  }

  const token = localStorage.getItem('ath_token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    // If server returned 404 (e.g. static host without /api handler), fallback to mock backend
    if (response.status === 404 || response.status === 502 || response.status === 503) {
      console.warn(`[API] ${endpoint} returned ${response.status}. Falling back to client demo engine.`);
      return await handleMockRequest(endpoint, options);
    }

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      const errorMsg = data.message || `Request failed with status ${response.status}`;
      const error = new Error(errorMsg);
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return data;
  } catch (netErr) {
    // If backend is unavailable or offline, transparently fall back to client mock backend
    console.warn(`[API Network Fallback] Backend unreachable (${netErr.message}). Routing ${endpoint} to client demo engine.`);
    return await handleMockRequest(endpoint, options);
  }
}

export const api = {
  // Auth
  login: (credentials) => request('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
  register: (userData) => request('/auth/register', { method: 'POST', body: JSON.stringify(userData) }),
  getMe: () => request('/auth/me'),
  updateProfile: (profile) => request('/auth/profile', { method: 'PUT', body: JSON.stringify(profile) }),
  getDemoAccounts: () => request('/auth/demo-accounts'),
  demoLogin: (role) => request('/auth/demo-login', { method: 'POST', body: JSON.stringify({ role }) }),

  // Waste Listings
  getPublicWaste: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/waste?${query}`);
  },
  getWasteById: (id) => request(`/waste/${id}`),
  createWasteListing: (data) => request('/waste', { method: 'POST', body: JSON.stringify(data) }),
  getShopkeeperListings: () => request('/waste/shopkeeper/my-listings'),
  updateWasteListing: (id, data) => request(`/waste/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteWasteListing: (id) => request(`/waste/${id}`, { method: 'DELETE' }),
  getShopkeeperRequests: () => request('/waste/shopkeeper/requests'),
  requestWasteCollection: (data) => request('/waste/request-collection', { method: 'POST', body: JSON.stringify(data) }),
  getProducerRequests: () => request('/waste/producer/my-requests'),
  updateRequestStatus: (id, data) => request(`/waste/requests/${id}/status`, { method: 'PUT', body: JSON.stringify(data) }),

  // Compost Production
  getProducerBatches: () => request('/compost/my-batches'),
  createBatch: (data) => request('/compost/batches', { method: 'POST', body: JSON.stringify(data) }),
  updateBatch: (id, data) => request(`/compost/batches/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  getProducerStats: () => request('/compost/dashboard-stats'),

  // Products
  getPublicProducts: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/products?${query}`);
  },
  getProductById: (id) => request(`/products/${id}`),
  getProducerProducts: () => request('/products/producer/my-products'),
  createProduct: (data) => request('/products', { method: 'POST', body: JSON.stringify(data) }),
  updateProduct: (id, data) => request(`/products/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteProduct: (id) => request(`/products/${id}`, { method: 'DELETE' }),

  // Cart
  getCart: () => request('/cart'),
  addToCart: (data) => request('/cart/add', { method: 'POST', body: JSON.stringify(data) }),
  updateCartItem: (id, quantity) => request(`/cart/items/${id}`, { method: 'PUT', body: JSON.stringify({ quantity }) }),
  removeCartItem: (id) => request(`/cart/items/${id}`, { method: 'DELETE' }),
  clearCart: () => request('/cart/clear', { method: 'DELETE' }),

  // Orders
  createOrder: (orderData) => request('/orders', { method: 'POST', body: JSON.stringify(orderData) }),
  getMyOrders: () => request('/orders/my-orders'),
  getOrderById: (id) => request(`/orders/${id}`),
  updateOrderStatus: (id, status) => request(`/orders/${id}/status`, { method: 'PUT', body: JSON.stringify({ status }) }),

  // Reviews
  addReview: (data) => request('/reviews', { method: 'POST', body: JSON.stringify(data) }),

  // Impact
  getImpactStats: () => request('/impact'),

  // Notifications
  getNotifications: () => request('/notifications'),
  markNotificationRead: (id) => request(`/notifications/${id}/read`, { method: 'PUT' }),
  markAllNotificationsRead: () => request('/notifications/mark-all-read', { method: 'PUT' }),
  deleteNotification: (id) => request(`/notifications/${id}`, { method: 'DELETE' }),

  // Admin
  getAdminOverview: () => request('/admin/overview'),
  getAllUsers: () => request('/admin/users'),
  toggleUserStatus: (id, status) => request(`/admin/users/${id}/status`, { method: 'PUT', body: JSON.stringify({ status }) }),
  getAllComplaints: () => request('/admin/complaints'),
  updateComplaint: (id, data) => request(`/admin/complaints/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  createComplaint: (data) => request('/admin/complaints', { method: 'POST', body: JSON.stringify(data) }),
  getAuditLogs: () => request('/admin/audit-logs'),
  exportCSVUrl: (type) => `/api/admin/export/${type}`,
};
