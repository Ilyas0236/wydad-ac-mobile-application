// ===========================================
// WYDAD AC - API SERVICE
// ===========================================

import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

// Configuration automatique de l'IP
// Détecte automatiquement l'IP du serveur de développement Expo
const getApiUrl = () => {
  // En production, utiliser l'URL de production
  // return 'https://api.wydadac.ma';

  // En développement, détecter l'IP automatiquement
  const debuggerHost = Constants.expoConfig?.hostUri || Constants.manifest?.debuggerHost;

  if (debuggerHost) {
    // Extraire l'IP du debuggerHost (format: "192.168.1.100:8081")
    const host = debuggerHost.split(':')[0];
    return `http://${host}:3000`;
  }

  // Fallback pour émulateur Android
  return 'http://10.0.2.2:3000';
};

const API_URL = getApiUrl();
console.log('API URL:', API_URL); // Pour debug

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
    api.get('/auth/profile'),

  updateProfile: (data) =>
    api.put('/auth/profile', data),

  changePassword: (currentPassword, newPassword) =>
    api.put('/auth/password', { currentPassword, newPassword }),
};

// ===========================================
// PLAYERS API
// ===========================================
export const playersAPI = {
  getAll: () =>
    api.get('/players'),

  getByPosition: () =>
    api.get('/players/positions'),

  getOne: (id) =>
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

  getSections: (id) =>
    api.get(`/matches/${id}/sections`),
};

// ===========================================
// TICKETS API
// ===========================================
export const ticketsAPI = {
  // Mes tickets (utilisateur connecté)
  getMine: () =>
    api.get('/tickets'),

  // Sections du stade
  getSections: () =>
    api.get('/tickets/sections'),

  // Réserver un ticket
  purchase: (data) =>
    api.post('/tickets', data),

  // Payer un ticket (paiement simulé)
  pay: (ticketId, paymentData) =>
    api.post(`/tickets/${ticketId}/pay`, paymentData),

  // Annuler une réservation
  cancel: (ticketId) =>
    api.delete(`/tickets/${ticketId}`),

  // Détail d'un ticket
  getById: (id) =>
    api.get(`/tickets/${id}`),

  // Vérifier un ticket (scan QR)
  verify: (ticketId, qrCode) =>
    api.get(`/tickets/${ticketId}/verify`, { params: { qr_code: qrCode } }),

  // Télécharger le PDF d'un ticket
  downloadPDF: async (ticketId) => {
    const token = await AsyncStorage.getItem('userToken');
    return `${API_URL}/tickets/${ticketId}/pdf?token=${token}`;
  },
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

  getOne: (id) =>
    api.get(`/products/${id}`),
};

// ===========================================
// ORDERS API
// ===========================================
export const ordersAPI = {
  // Mes commandes
  getMine: () =>
    api.get('/orders/my'),

  // Créer une commande
  create: (data) =>
    api.post('/orders', data),

  // Payer une commande (simulé)
  pay: (orderId, paymentData) =>
    api.post(`/orders/${orderId}/pay`, paymentData),

  // Annuler une commande (utilise POST /cancel au lieu de DELETE)
  cancel: (orderId) =>
    api.post(`/orders/${orderId}/cancel`),

  // Détail d'une commande
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

  getOne: (id) =>
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

// ===========================================
// UPLOAD API
// ===========================================
export const uploadAPI = {
  /**
   * Upload une image vers le serveur
   * @param {Object} imageAsset - Asset image de expo-image-picker
   * @param {string} type - Type d'upload: 'players', 'products', 'news', 'profiles'
   * @returns {Promise} - Réponse avec l'URL de l'image
   */
  uploadImage: async (imageAsset, type = 'general') => {
    try {
      const formData = new FormData();

      // Extraire le nom du fichier et le type MIME
      const uri = imageAsset.uri;
      const filename = uri.split('/').pop();
      const match = /\.(\w+)$/.exec(filename);
      const mimeType = match ? `image/${match[1]}` : 'image/jpeg';

      // Ajouter le fichier au FormData
      formData.append('image', {
        uri: uri,
        name: filename || `image_${Date.now()}.jpg`,
        type: mimeType,
      });

      // Récupérer le token
      const token = await AsyncStorage.getItem('userToken');

      // Faire la requête avec axios
      const response = await axios.post(
        `${API_URL}/upload/${type}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': token ? `Bearer ${token}` : '',
          },
          timeout: 30000, // 30 secondes pour les uploads
        }
      );

      return response.data;
    } catch (error) {
      console.error('Erreur upload image:', error);
      if (error.response) {
        throw { message: error.response.data?.message || 'Erreur lors de l\'upload' };
      }
      throw { message: 'Impossible de contacter le serveur' };
    }
  },

  /**
   * Upload multiple images
   * @param {Array} imageAssets - Tableau d'assets image
   * @param {string} type - Type d'upload
   * @returns {Promise} - Réponse avec les URLs des images
   */
  uploadMultipleImages: async (imageAssets, type = 'general') => {
    try {
      const formData = new FormData();

      imageAssets.forEach((imageAsset, index) => {
        const uri = imageAsset.uri;
        const filename = uri.split('/').pop();
        const match = /\.(\w+)$/.exec(filename);
        const mimeType = match ? `image/${match[1]}` : 'image/jpeg';

        formData.append('images', {
          uri: uri,
          name: filename || `image_${Date.now()}_${index}.jpg`,
          type: mimeType,
        });
      });

      const token = await AsyncStorage.getItem('userToken');

      const response = await axios.post(
        `${API_URL}/upload/${type}/multiple`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': token ? `Bearer ${token}` : '',
          },
          timeout: 60000, // 60 secondes pour uploads multiples
        }
      );

      return response.data;
    } catch (error) {
      console.error('Erreur upload multiple:', error);
      if (error.response) {
        throw { message: error.response.data?.message || 'Erreur lors de l\'upload' };
      }
      throw { message: 'Impossible de contacter le serveur' };
    }
  },

  /**
   * Supprimer une image du serveur
   * @param {string} type - Type d'upload
   * @param {string} filename - Nom du fichier
   * @returns {Promise}
   */
  deleteImage: async (type, filename) => {
    return api.delete(`/upload/${type}/${filename}`);
  },

  /**
   * Obtenir l'URL complète d'une image
   * @param {string} relativePath - Chemin relatif de l'image
   * @returns {string} - URL complète
   */
  getImageUrl: (relativePath) => {
    if (!relativePath) return null;
    if (relativePath.startsWith('http')) return relativePath;
    return `${API_URL}${relativePath}`;
  },
};

// ===========================================
// ADMIN API
// ===========================================
export const adminAPI = {
  // Dashboard stats
  getStats: () => api.get('/admin/stats'),
  getUsers: (params = {}) => api.get('/admin/users', { params }),
  getOrders: (params = {}) => api.get('/admin/orders', { params }),
  getTickets: (params = {}) => api.get('/admin/tickets', { params }),

  // Update order status
  updateOrderStatus: (id, status) => api.put(`/admin/orders/${id}/status`, { status }),

  // Update ticket status
  updateTicketStatus: (id, status) => api.put(`/admin/tickets/${id}/status`, { status }),

  // Players CRUD
  createPlayer: (data) => api.post('/players', data),
  updatePlayer: (id, data) => api.put(`/players/${id}`, data),
  deletePlayer: (id) => api.delete(`/players/${id}`),

  // Products CRUD
  createProduct: (data) => api.post('/products', data),
  updateProduct: (id, data) => api.put(`/products/${id}`, data),
  deleteProduct: (id) => api.delete(`/products/${id}`),

  // News CRUD
  createNews: (data) => api.post('/news', data),
  updateNews: (id, data) => api.put(`/news/${id}`, data),
  deleteNews: (id) => api.delete(`/news/${id}`),

  // Matches CRUD
  createMatch: (data) => api.post('/matches', data),
  updateMatch: (id, data) => api.put(`/matches/${id}`, data),
  deleteMatch: (id) => api.delete(`/matches/${id}`),

  // Stores CRUD
  createStore: (data) => api.post('/stores', data),
  updateStore: (id, data) => api.put(`/stores/${id}`, data),
  deleteStore: (id) => api.delete(`/stores/${id}`),

  // Tickets CRUD (admin)
  createTicket: (data) => api.post('/admin/tickets', data),
  deleteTicket: (id) => api.delete(`/admin/tickets/${id}`),

  // Match Sections Configuration
  getMatchSections: (matchId) => api.get(`/admin/matches/${matchId}/sections`),
  saveMatchSections: (matchId, sections) => api.post(`/admin/matches/${matchId}/sections`, { sections }),
};


// ===========================================
// COMPLAINTS API
// ===========================================
export const complaintsAPI = {
  create: (data) => api.post('/complaints', data),
  getMy: () => api.get('/complaints/my'),
  getAllAdmin: () => api.get('/complaints/admin'),
  reply: (id, response) => api.put(`/complaints/${id}/reply`, { response }),
};

export default api;
