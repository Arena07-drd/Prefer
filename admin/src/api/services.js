import apiClient from './client.js';

// Auth
export const authApi = {
  login: (email, password) => apiClient.post('/auth/login', { email, password }),
  refresh: (refreshToken) => apiClient.post('/auth/refresh', { refreshToken }),
  logout: (refreshToken) => apiClient.post('/auth/logout', { refreshToken }),
  getMe: () => apiClient.get('/auth/me'),
  changePassword: (oldPassword, newPassword) => apiClient.post('/auth/change-password', { oldPassword, newPassword })
};

// Users
export const usersApi = {
  getAll: (params) => apiClient.get('/users', { params }),
  getById: (id) => apiClient.get(`/users/${id}`),
  create: (data) => apiClient.post('/users', data),
  update: (id, data) => apiClient.patch(`/users/${id}`, data),
  deactivate: (id) => apiClient.delete(`/users/${id}`),
  resetPassword: (id, newPassword) => apiClient.post(`/users/${id}/reset-password`, { newPassword })
};

// Products
export const productsApi = {
  getAll: (params) => apiClient.get('/products', { params }),
  getById: (id) => apiClient.get(`/products/${id}`),
  create: (data) => apiClient.post('/products', data),
  update: (id, data) => apiClient.patch(`/products/${id}`, data),
  delete: (id) => apiClient.delete(`/products/${id}`),
  search: (params) => apiClient.get('/products/search', { params })
};

// Categories
export const categoriesApi = {
  getAll: (params) => apiClient.get('/categories', { params }),
  getById: (id) => apiClient.get(`/categories/${id}`),
  create: (data) => apiClient.post('/categories', data),
  update: (id, data) => apiClient.patch(`/categories/${id}`, data),
  delete: (id) => apiClient.delete(`/categories/${id}`)
};

// Orders
export const ordersApi = {
  getAll: (params) => apiClient.get('/orders', { params }),
  getById: (id) => apiClient.get(`/orders/${id}`),
  create: (data) => apiClient.post('/orders', data),
  update: (id, data) => apiClient.patch(`/orders/${id}`, data),
  updateStatus: (id, status, note) => apiClient.patch(`/orders/${id}/status`, { status, note }),
  updatePayment: (id, isPaid) => apiClient.patch(`/orders/${id}/payment`, { isPaid })
};

// Notifications
export const notificationsApi = {
  getAll: (params) => apiClient.get('/notifications', { params }),
  getUnreadCount: () => apiClient.get('/notifications/unread-count'),
  markAsRead: (id) => apiClient.patch(`/notifications/${id}/read`),
  markAllAsRead: () => apiClient.patch('/notifications/read-all')
};

// Reports
export const reportsApi = {
  getDashboard: () => apiClient.get('/reports/dashboard'),
  getSales: (params) => apiClient.get('/reports/sales', { params }),
  getTopProducts: (params) => apiClient.get('/reports/top-products', { params }),
  getTopCustomers: (params) => apiClient.get('/reports/top-customers', { params }),
  getOrdersSummary: (params) => apiClient.get('/reports/orders-summary', { params }),
  getPayments: (params) => apiClient.get('/reports/payments', { params })
};

// Audit Logs
export const auditLogsApi = {
  getAll: (params) => apiClient.get('/audit-logs', { params })
};
