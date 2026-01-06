/**
 * ===========================================
 * WYDAD ATHLETIC CLUB - AUTH ADMIN MIDDLEWARE
 * ===========================================
 * Middleware pour protéger les routes admin
 * Vérifie le token JWT admin
 * ===========================================
 */

const jwt = require('jsonwebtoken');
const { get } = require('../database');

// Clé secrète JWT (doit être la même que dans les routes)
const JWT_SECRET = process.env.JWT_SECRET || 'wac_secret_key_2025_wydad_champions';

/**
 * Middleware d'authentification Admin
 * Vérifie que le token JWT est valide et appartient à un admin
 */
const authAdmin = async (req, res, next) => {
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

    // Vérifier que c'est bien un token admin
    if (decoded.type !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Accès refusé - Droits admin requis'
      });
    }

    // Vérifier que l'admin existe toujours en base
    const admin = await get(
      'SELECT id, username, email, role FROM admins WHERE id = ?',
      [decoded.id]
    );

    if (!admin) {
      return res.status(401).json({
        success: false,
        message: 'Admin non trouvé'
      });
    }

    // Ajouter les infos admin à la requête
    req.admin = {
      id: admin.id,
      username: admin.username,
      email: admin.email,
      role: admin.role
    };

    // Continuer vers la route suivante
    next();

  } catch (error) {
    console.error('Erreur auth admin middleware:', error.message);

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

module.exports = authAdmin;
