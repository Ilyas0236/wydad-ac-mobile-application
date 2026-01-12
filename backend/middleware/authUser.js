/**
 * ===========================================
 * WYDAD ATHLETIC CLUB - AUTH USER MIDDLEWARE
 * ===========================================
 * Middleware pour protéger les routes utilisateur
 * Vérifie le token JWT utilisateur
 * ===========================================
 */

const jwt = require('jsonwebtoken');
const { get } = require('../database');

// Clé secrète JWT (doit être la même que dans les routes)
const JWT_SECRET = process.env.JWT_SECRET || 'wac_secret_key_2025_wydad_champions';

/**
 * Middleware d'authentification Utilisateur
 * Vérifie que le token JWT est valide et appartient à un utilisateur
 */
const authUser = async (req, res, next) => {
  try {
    // Récupérer le token du header Authorization
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: 'Accès refusé - Token requis'
      });
    }

    // Le token est au format "Bearer <token>"
    const token = authHeader.startsWith('Bearer ') 
      ? authHeader.slice(7) 
      : authHeader;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Accès refusé - Token invalide'
      });
    }

    // Vérifier et décoder le token
    const decoded = jwt.verify(token, JWT_SECRET);

    // Vérifier que c'est un token utilisateur ou admin
    if (decoded.type !== 'user' && decoded.type !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Accès refusé - Compte requis'
      });
    }

    // Si c'est un admin, récupérer les infos de la table admins
    if (decoded.type === 'admin') {
      const admin = await get(
        'SELECT id, username as name, email FROM admins WHERE id = ?',
        [decoded.id]
      );

      if (!admin) {
        return res.status(401).json({
          success: false,
          message: 'Admin non trouvé'
        });
      }

      req.user = {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        phone: null,
        avatar: null,
        type: 'admin'
      };

      return next();
    }

    // Vérifier que l'utilisateur existe et est actif
    const user = await get(
      'SELECT id, name, email, phone, avatar, is_active FROM users WHERE id = ?',
      [decoded.id]
    );

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }

    if (!user.is_active) {
      return res.status(403).json({
        success: false,
        message: 'Compte désactivé'
      });
    }

    // Ajouter les infos utilisateur à la requête
    req.user = {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      avatar: user.avatar
    };

    // Continuer vers la route suivante
    next();

  } catch (error) {
    console.error('Erreur auth user middleware:', error.message);

    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Token invalide'
      });
    }

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expiré - Veuillez vous reconnecter'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de l\'authentification'
    });
  }
};

/**
 * Middleware optionnel - Ajoute user si token présent, sinon continue
 * Utile pour les routes accessibles avec ou sans authentification
 */
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return next(); // Pas de token, continuer sans user
    }

    const token = authHeader.startsWith('Bearer ') 
      ? authHeader.slice(7) 
      : authHeader;

    if (!token) {
      return next();
    }

    const decoded = jwt.verify(token, JWT_SECRET);

    if (decoded.type === 'user') {
      const user = await get(
        'SELECT id, name, email, phone, avatar, is_active FROM users WHERE id = ?',
        [decoded.id]
      );

      if (user && user.is_active) {
        req.user = {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          avatar: user.avatar
        };
      }
    }

    next();

  } catch (error) {
    // En cas d'erreur, continuer sans user
    next();
  }
};

module.exports = { authUser, optionalAuth };
