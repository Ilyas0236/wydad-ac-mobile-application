// ===========================================
// WYDAD AC - API SERVICE
// ===========================================

import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Configuration de base
const API_URL = 'http://10.0.2.2:3000'; // Android Emulator
// const API_URL = 'http://localhost:3000'; // iOS Simulator
// const API_URL = 'http://192.168.x.x:3000'; // Device physique

// Création de l'instance Axios
const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur pour ajouter le token aux requêtes
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('userToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Intercepteur pour gérer les réponses/erreurs
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response) {
      // Erreur du serveur
      const message = error.response.data?.message || 'Erreur serveur';
      
      // Si token expiré, déconnecter l'utilisateur
      if (error.response.status === 401) {
        AsyncStorage.removeItem('userToken');
        AsyncStorage.removeItem('userData');
      }
      
      return Promise.reject({ message, status: error.response.status });
    } else if (error.request) {
      // Pas de réponse du serveur
      return Promise.reject({ message: 'Impossible de contacter le serveur' });
    }
    return Promise.reject({ message: 'Erreur de connexion' });
  }
);

// ===========================================
// AUTH API
// ===========================================
export const authAPI = {
  login: (email, password) => 
    api.post('/auth/login', { email, password }),
  
  register: (name, email, password) => 
    api.post('/auth/register', { name, email, password }),
  
  getProfile: () => 
    api.get('/auth/me'),
  
  updateProfile: (data) => 
    api.put('/auth/profile', data),
  
  changePassword: (currentPassword, newPassword) => 
    api.put('/auth/password', { current_password: currentPassword, new_password: newPassword }),
};

// ===========================================
// PLAYERS API
// ===========================================
export const playersAPI = {
  getAll: () => 
    api.get('/players'),
  
  getByPosition: () => 
    api.get('/players/positions'),
  
  getById: (id) => 
    api.get(`/players/${id}`),
};

// ===========================================
// MATCHES API
// ===========================================
export const matchesAPI = {
  getAll: () => 
    api.get('/matches'),
  
  getUpcoming: () => 
    api.get('/matches/upcoming'),
  
  getResults: () => 
    api.get('/matches/results'),
  
  getById: (id) => 
    api.get(`/matches/${id}`),
};

// ===========================================
// TICKETS API
// ===========================================
export const ticketsAPI = {
  getMyTickets: () => 
    api.get('/tickets'),
  
  getSections: () => 
    api.get('/tickets/sections'),
  
  reserve: (matchId, section, quantity) => 
    api.post('/tickets/reserve', { match_id: matchId, section, quantity }),
  
  pay: (ticketId, paymentMethod = 'card') => 
    api.post(`/tickets/${ticketId}/pay`, { payment_method: paymentMethod }),
  
  cancel: (ticketId) => 
    api.post(`/tickets/${ticketId}/cancel`),
  
  getById: (id) => 
    api.get(`/tickets/${id}`),
};

// ===========================================
// PRODUCTS API
// ===========================================
export const productsAPI = {
  getAll: (params = {}) => 
    api.get('/products', { params }),
  
  getCategories: () => 
    api.get('/products/categories'),
  
  getFeatured: () => 
    api.get('/products/featured'),
  
  getById: (id) => 
    api.get(`/products/${id}`),
};

// ===========================================
// ORDERS API
// ===========================================
export const ordersAPI = {
  getMyOrders: () => 
    api.get('/orders/my'),
  
  create: (items, shippingAddress, shippingCity, shippingPhone) => 
    api.post('/orders', { 
      items, 
      shipping_address: shippingAddress,
      shipping_city: shippingCity,
      shipping_phone: shippingPhone 
    }),
  
  pay: (orderId, paymentMethod = 'card') => 
    api.post(`/orders/${orderId}/pay`, { payment_method: paymentMethod }),
  
  cancel: (orderId) => 
    api.post(`/orders/${orderId}/cancel`),
  
  getById: (id) => 
    api.get(`/orders/${id}`),
};

// ===========================================
// NEWS API
// ===========================================
export const newsAPI = {
  getAll: (params = {}) => 
    api.get('/news', { params }),
  
  getFeatured: () => 
    api.get('/news/featured'),
  
  getCategories: () => 
    api.get('/news/categories'),
  
  getById: (id) => 
    api.get(`/news/${id}`),
};

// ===========================================
// STORES API
// ===========================================
export const storesAPI = {
  getAll: (params = {}) => 
    api.get('/stores', { params }),
  
  getCities: () => 
    api.get('/stores/cities'),
  
  getNearby: (latitude, longitude, radius) => 
    api.get('/stores/nearby', { params: { latitude, longitude, radius } }),
  
  getById: (id) => 
    api.get(`/stores/${id}`),
};

export default api;
