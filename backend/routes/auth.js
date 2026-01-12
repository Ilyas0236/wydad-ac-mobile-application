/**
 * ===========================================
 * WYDAD ATHLETIC CLUB - AUTH ROUTES
 * ===========================================
 * Routes d'authentification utilisateurs
 * Inscription et connexion des supporters
 * ===========================================
 */

const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { run, get } = require('../database');
const { authUser } = require('../middleware');

// Clé secrète JWT
const JWT_SECRET = process.env.JWT_SECRET || 'wac_secret_key_2025_wydad_champions';
const JWT_EXPIRES_IN = '30d'; // Token valide 30 jours pour les users

// ===========================================
// POST /auth/register - Inscription utilisateur
// ===========================================
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    // Validation des champs requis
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Nom, email et mot de passe sont requis'
      });
    }

    // Validation email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Format d\'email invalide'
      });
    }

    // Validation mot de passe (min 6 caractères)
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Le mot de passe doit contenir au moins 6 caractères'
      });
    }

    // Vérifier si l'email existe déjà
    const existingUser = await get('SELECT id FROM users WHERE email = ?', [email]);

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'Cet email est déjà utilisé'
      });
    }

    // Hasher le mot de passe
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Insérer le nouvel utilisateur
    const result = await run(
      'INSERT INTO users (name, email, password, phone) VALUES (?, ?, ?, ?)',
      [name, email, hashedPassword, phone || null]
    );

    // Générer le token JWT
    const token = jwt.sign(
      { 
        id: result.id, 
        email: email,
        type: 'user'
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    // Réponse succès
    res.status(201).json({
      success: true,
      message: 'Inscription réussie! Bienvenue chez les Wydadis! 🔴⚪',
      data: {
        user: {
          id: result.id,
          name,
          email,
          phone: phone || null
        },
        token
      }
    });

  } catch (error) {
    console.error('Erreur inscription:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de l\'inscription'
    });
  }
});

// ===========================================
// POST /auth/login - Connexion utilisateur ou admin
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

    // D'abord chercher dans la table users
    let user = await get('SELECT * FROM users WHERE email = ?', [email]);
    let isAdmin = false;

    // Si pas trouvé dans users, chercher dans admins
    if (!user) {
      const admin = await get('SELECT * FROM admins WHERE email = ?', [email]);
      if (admin) {
        user = admin;
        isAdmin = true;
      }
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Email ou mot de passe incorrect'
      });
    }

    // Vérifier si le compte est actif (admins sont toujours actifs car pas de champ is_active)
    if (!isAdmin && user.is_active === 0) {
      return res.status(403).json({
        success: false,
        message: 'Votre compte a été désactivé'
      });
    }

    // Vérifier le mot de passe
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Email ou mot de passe incorrect'
      });
    }

    // Générer le token JWT
    const token = jwt.sign(
      { 
        id: user.id, 
        email: user.email,
        type: isAdmin ? 'admin' : 'user'
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    // Réponse avec token
    res.json({
      success: true,
      message: isAdmin ? 'Bienvenue Admin! 🔴⚪' : 'Connexion réussie! Dima Wydad! 🔴⚪',
      data: {
        user: {
          id: user.id,
          name: user.name || user.username,
          email: user.email,
          phone: user.phone || null,
          avatar: user.avatar || null,
          isAdmin: isAdmin
        },
        token
      }
    });

  } catch (error) {
    console.error('Erreur login:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la connexion'
    });
  }
});

// ===========================================
// GET /auth/profile - Profil utilisateur (protégé)
// ===========================================
router.get('/profile', authUser, async (req, res) => {
  try {
    const user = await get(
      'SELECT id, name, email, phone, avatar, created_at FROM users WHERE id = ?',
      [req.user.id]
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }

    res.json({
      success: true,
      data: user
    });

  } catch (error) {
    console.error('Erreur profil:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
});

// ===========================================
// PUT /auth/profile - Modifier profil
// ===========================================
// PUT /auth/profile - Modifier profil (protégé)
// ===========================================
router.put('/profile', authUser, async (req, res) => {
  try {
    const { name, phone, avatar } = req.body;

    // Construire la requête de mise à jour
    const updates = [];
    const params = [];

    if (name) {
      updates.push('name = ?');
      params.push(name);
    }
    if (phone !== undefined) {
      updates.push('phone = ?');
      params.push(phone);
    }
    if (avatar !== undefined) {
      updates.push('avatar = ?');
      params.push(avatar);
    }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Aucune donnée à mettre à jour'
      });
    }

    updates.push('updated_at = CURRENT_TIMESTAMP');
    params.push(req.user.id);

    await run(
      `UPDATE users SET ${updates.join(', ')} WHERE id = ?`,
      params
    );

    // Récupérer l'utilisateur mis à jour
    const updatedUser = await get(
      'SELECT id, name, email, phone, avatar, created_at FROM users WHERE id = ?',
      [req.user.id]
    );

    res.json({
      success: true,
      message: 'Profil mis à jour',
      data: updatedUser
    });

  } catch (error) {
    console.error('Erreur mise à jour profil:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
});

// ===========================================
// PUT /auth/password - Changer mot de passe (protégé)
// ===========================================
router.put('/password', authUser, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Mot de passe actuel et nouveau mot de passe requis'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Le nouveau mot de passe doit contenir au moins 6 caractères'
      });
    }

    // Récupérer l'utilisateur
    const user = await get('SELECT password FROM users WHERE id = ?', [req.user.id]);

    // Vérifier le mot de passe actuel
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Mot de passe actuel incorrect'
      });
    }

    // Hasher le nouveau mot de passe
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Mettre à jour
    await run(
      'UPDATE users SET password = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [hashedPassword, req.user.id]
    );

    res.json({
      success: true,
      message: 'Mot de passe modifié avec succès'
    });

  } catch (error) {
    console.error('Erreur changement mot de passe:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
});

module.exports = router;
