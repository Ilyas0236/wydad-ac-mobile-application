/**
 * ===========================================
 * WYDAD ATHLETIC CLUB - BACKEND SERVER
 * ===========================================
 * Serveur principal de l'API REST
 * Club: Wydad Athletic Club (WAC) - Maroc
 * ===========================================
 */

const express = require('express');
const cors = require('cors');

// Initialisation de l'application Express
const app = express();

// Configuration du port
const PORT = process.env.PORT || 3000;

// ===========================================
// MIDDLEWARES GLOBAUX
// ===========================================

// Activation de CORS pour permettre les requêtes cross-origin
app.use(cors({
  origin: '*', // En production, spécifier les domaines autorisés
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Parser JSON pour les requêtes entrantes
app.use(express.json());

// Parser URL-encoded pour les formulaires
app.use(express.urlencoded({ extended: true });

// ===========================================
// ROUTE DE TEST / HEALTH CHECK
// ===========================================

app.get('/', (req, res) => {
  res.json({
    success: true,
    message: '🔴⚪ Bienvenue sur l\'API Wydad Athletic Club!',
    club: 'Wydad Athletic Club',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Route de vérification de santé de l'API
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// ===========================================
// GESTION DES ERREURS 404
// ===========================================

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route non trouvée'
  });
});

// ===========================================
// GESTION DES ERREURS GLOBALES
// ===========================================

app.use((err, req, res, next) => {
  console.error('Erreur serveur:', err.stack);
  res.status(500).json({
    success: false,
    message: 'Erreur interne du serveur'
  });
});

// ===========================================
// DÉMARRAGE DU SERVEUR
// ===========================================

app.listen(PORT, () => {
  console.log('===========================================');
  console.log('🔴⚪ WYDAD ATHLETIC CLUB - API SERVER 🔴⚪');
  console.log('===========================================');
  console.log(`✅ Serveur démarré sur le port ${PORT}`);
  console.log(`📍 URL: http://localhost:${PORT}`);
  console.log('===========================================');
});

module.exports = app;
