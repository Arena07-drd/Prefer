import apiClient from './client.js';

export const authApi = {
  login: (email, password) => apiClient.post('/auth/login', { email, password }),
  refresh: (refreshToken) => apiClient.post('/auth/refresh', { refreshToken }),
  logout: (refreshToken) => apiClient.post('/auth/logout', { refreshToken }),
  getMe: () => apiClient.get('/auth/me'),
  changePassword: (oldPassword, newPassword) => apiClient.post('/auth/change-password', { oldPassword, newPassword })
};

export const productsApi = {
  getAll: (params) => apiClient.get('/products', { params }),
  getById: (id) => apiClient.get(`/products/${id}`),
  search: (params) => apiClient.get('/products/search', { params })
};

export const categoriesApi = {
  getAll: (params) => apiClient.get('/categories', { params })
};

export const ordersApi = {
  create: (data) => apiClient.post('/orders', data),
  getAll: (params) => apiClient.get('/orders', { params }),
  getById: (id) => apiClient.get(`/orders/${id}`)
};

export const notificationsApi = {
  getAll: (params) => apiClient.get('/notifications', { params }),
  getUnreadCount: () => apiClient.get('/notifications/unread-count'),
  markAsRead: (id) => apiClient.patch(`/notifications/${id}/read`),
  markAllAsRead: () => apiClient.patch('/notifications/read-all')
};
