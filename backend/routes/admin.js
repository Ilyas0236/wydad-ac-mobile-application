/**
 * ===========================================
 * WYDAD ATHLETIC CLUB - ADMIN ROUTES
 * ===========================================
 * Routes d'authentification administrateur
 * ===========================================
 */

const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { run, get, all } = require('../database');

// Clé secrète JWT (en production, utiliser une variable d'environnement)
const JWT_SECRET = process.env.JWT_SECRET || 'wac_secret_key_2025_wydad_champions';
const JWT_EXPIRES_IN = '7d';

// ===========================================
// POST /admin/login - Connexion admin
// ===========================================
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation des champs
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email et mot de passe requis'
      });
    }

    // Rechercher l'admin par email
    const admin = await get('SELECT * FROM admins WHERE email = ?', [email]);

    if (!admin) {
      return res.status(401).json({
        success: false,
        message: 'Email ou mot de passe incorrect'
      });
    }

    // Vérifier le mot de passe
    const isPasswordValid = await bcrypt.compare(password, admin.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Email ou mot de passe incorrect'
      });
    }

    // Générer le token JWT
    const token = jwt.sign(
      { 
        id: admin.id, 
        email: admin.email, 
        role: admin.role,
        type: 'admin'
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    // Réponse avec token
    res.json({
      success: true,
      message: 'Connexion réussie',
      data: {
        admin: {
          id: admin.id,
          username: admin.username,
          email: admin.email,
          role: admin.role
        },
        token
      }
    });

  } catch (error) {
    console.error('Erreur login admin:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la connexion'
    });
  }
});

// ===========================================
// POST /admin/create - Créer un admin (protégé)
// ===========================================
router.post('/create', async (req, res) => {
  try {
    const { username, email, password, role } = req.body;

    // Validation des champs
    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Username, email et mot de passe requis'
      });
    }

    // Vérifier si l'email existe déjà
    const existingAdmin = await get('SELECT id FROM admins WHERE email = ?', [email]);

    if (existingAdmin) {
      return res.status(409).json({
        success: false,
        message: 'Cet email est déjà utilisé'
      });
    }

    // Hasher le mot de passe
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Insérer le nouvel admin
    const result = await run(
      'INSERT INTO admins (username, email, password, role) VALUES (?, ?, ?, ?)',
      [username, email, hashedPassword, role || 'admin']
    );

    res.status(201).json({
      success: true,
      message: 'Admin créé avec succès',
      data: {
        id: result.id,
        username,
        email,
        role: role || 'admin'
      }
    });

  } catch (error) {
    console.error('Erreur création admin:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la création'
    });
  }
});

// ===========================================
// GET /admin/profile - Profil admin (protégé)
// ===========================================
router.get('/profile', async (req, res) => {
  try {
    // Le middleware auth ajoutera req.admin
    if (!req.admin) {
      return res.status(401).json({
        success: false,
        message: 'Non autorisé'
      });
    }

    const admin = await get(
      'SELECT id, username, email, role, created_at FROM admins WHERE id = ?',
      [req.admin.id]
    );

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'Admin non trouvé'
      });
    }

    res.json({
      success: true,
      data: admin
    });

  } catch (error) {
    console.error('Erreur profil admin:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
});

module.exports = router;
