import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const API_URL = process.env.EXPO_PUBLIC_BACKEND_URL || 'http://localhost:8001';

const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Token storage helpers
export const getToken = async () => {
  if (Platform.OS === 'web') {
    return localStorage.getItem('token');
  }
  return await SecureStore.getItemAsync('token');
};

export const setToken = async (token: string) => {
  if (Platform.OS === 'web') {
    localStorage.setItem('token', token);
  } else {
    await SecureStore.setItemAsync('token', token);
  }
};

export const removeToken = async () => {
  if (Platform.OS === 'web') {
    localStorage.removeItem('token');
  } else {
    await SecureStore.deleteItemAsync('token');
  }
};

// Request interceptor to add auth token
api.interceptors.request.use(async (config) => {
  const token = await getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth API
export const authAPI = {
  register: (data: any) => api.post('/auth/register', data),
  login: (data: any) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  verifyIdentity: (data: any) => api.post('/auth/verify-identity', data),
  initAdmin: (data: any) => api.post('/init-admin', data),
};

// Listings API
export const listingsAPI = {
  create: (data: any) => api.post('/listings', data),
  getAll: (params?: any) => api.get('/listings', { params }),
  getBoosted: (limit?: number) => api.get('/listings/boosted', { params: { limit } }),
  getById: (id: string) => api.get(`/listings/${id}`),
  getPublic: (id: string) => api.get(`/listings/${id}/public`),
  update: (id: string, data: any) => api.put(`/listings/${id}`, data),
  delete: (id: string) => api.delete(`/listings/${id}`),
  repost: (id: string) => api.post(`/listings/${id}/repost`),
  getMine: () => api.get('/my-listings'),
  getMyStats: () => api.get('/my-stats'),
};

// Favorites API
export const favoritesAPI = {
  add: (listingId: string) => api.post(`/favorites/${listingId}`),
  remove: (listingId: string) => api.delete(`/favorites/${listingId}`),
  getAll: () => api.get('/favorites'),
};

// Messages API
export const messagesAPI = {
  send: (data: any) => api.post('/messages', data),
  getConversations: () => api.get('/messages/conversations'),
  getMessages: (listingId: string, otherUserId: string) =>
    api.get(`/messages/${listingId}/${otherUserId}`),
};

// Payments API
export const paymentsAPI = {
  boost: (data: any) => api.post('/payments/boost', data),
  extraPhotos: (data: any) => api.post('/payments/extra-photos', data),
  getCryptoWallets: () => api.get('/payments/crypto-wallets'),
};

// Reports API
export const reportsAPI = {
  create: (data: any) => api.post('/reports', data),
};

// Admin API
export const adminAPI = {
  getPendingListings: () => api.get('/admin/pending-listings'),
  approveListing: (id: string) => api.post(`/admin/listings/${id}/approve`),
  rejectListing: (id: string, reason?: string) =>
    api.post(`/admin/listings/${id}/reject`, null, { params: { reason } }),
  getPendingVerifications: () => api.get('/admin/pending-verifications'),
  verifyIdentity: (userId: string, approved: boolean) =>
    api.post(`/admin/users/${userId}/verify-identity`, null, { params: { approved } }),
  getReports: () => api.get('/admin/reports'),
  resolveReport: (reportId: string, action: string) =>
    api.post(`/admin/reports/${reportId}/resolve`, null, { params: { action } }),
  makeAdmin: (userId: string) => api.post(`/admin/make-admin/${userId}`),
  getStats: () => api.get('/admin/stats'),
};

// Constants API
export const constantsAPI = {
  getCategories: () => api.get('/constants/categories'),
  getCarBrands: () => api.get('/constants/car-brands'),
  getMotoBrands: () => api.get('/constants/moto-brands'),
  getFuelTypes: () => api.get('/constants/fuel-types'),
  getVehicleTypes: () => api.get('/constants/vehicle-types'),
  getPropertyTypes: () => api.get('/constants/property-types'),
};

export default api;
