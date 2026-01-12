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
const authAdmin = require('../middleware/authAdmin');

// Clé secrète JWT (en production, utiliser une variable d'environnement)
const JWT_EXPIRES_IN = '7d';

// Constants
const STADIUM_SECTIONS = [
  { key: 'virage_nord', label: 'Virage Nord', price_multiplier: 1.0 },
  { key: 'virage_sud', label: 'Virage Sud', price_multiplier: 1.0 },
  { key: 'pelouse', label: 'Pelouse', price_multiplier: 1.2 },
  { key: 'tribune', label: 'Tribune Latérale', price_multiplier: 1.5 },
  { key: 'tribune_honneur', label: 'Tribune d\'Honneur', price_multiplier: 2.0 },
];

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
router.post('/create', authAdmin, async (req, res) => {
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
router.get('/profile', authAdmin, async (req, res) => {
  try {
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

// ===========================================
// GET /admin/stats - Statistiques dashboard
// ===========================================
router.get('/stats', authAdmin, async (req, res) => {
  try {
    // Statistiques utilisateurs
    const usersTotal = await get('SELECT COUNT(*) as count FROM users');
    const usersNew = await get(
      "SELECT COUNT(*) as count FROM users WHERE created_at >= datetime('now', '-30 days')"
    );

    // Statistiques commandes
    const ordersTotal = await get('SELECT COUNT(*) as count FROM orders');
    const ordersPending = await get("SELECT COUNT(*) as count FROM orders WHERE status = 'pending'");
    const ordersConfirmed = await get("SELECT COUNT(*) as count FROM orders WHERE status = 'confirmed'");
    const ordersPaid = await get("SELECT COUNT(*) as count FROM orders WHERE status = 'paid'");
    const ordersShipped = await get("SELECT COUNT(*) as count FROM orders WHERE status = 'shipped'");
    const ordersDelivered = await get("SELECT COUNT(*) as count FROM orders WHERE status = 'delivered'");
    const ordersCancelled = await get("SELECT COUNT(*) as count FROM orders WHERE status = 'cancelled'");
    const ordersRevenue = await get("SELECT COALESCE(SUM(total_amount), 0) as total FROM orders WHERE status IN ('paid', 'shipped', 'delivered')");
    const ticketsRevenue = await get("SELECT COALESCE(SUM(total_amount), 0) as total FROM tickets WHERE status = 'paid'");

    // Statistiques tickets
    const ticketsTotal = await get('SELECT COUNT(*) as count FROM tickets');
    const ticketsPending = await get("SELECT COUNT(*) as count FROM tickets WHERE status = 'pending'");
    const ticketsPaid = await get("SELECT COUNT(*) as count FROM tickets WHERE status = 'paid'");

    // Statistiques produits
    const productsTotal = await get('SELECT COUNT(*) as count FROM products');
    const productsLowStock = await get('SELECT COUNT(*) as count FROM products WHERE stock < 10');

    // Statistiques joueurs
    const playersTotal = await get('SELECT COUNT(*) as count FROM players');

    // Statistiques matchs
    const matchesTotal = await get('SELECT COUNT(*) as count FROM matches');
    const matchesUpcoming = await get("SELECT COUNT(*) as count FROM matches WHERE match_date >= datetime('now')");

    // Statistiques news
    const newsTotal = await get('SELECT COUNT(*) as count FROM news');

    res.json({
      success: true,
      data: {
        users: {
          total: usersTotal?.count || 0,
          active: usersTotal?.count || 0,
          new: usersNew?.count || 0
        },
        orders: {
          total: ordersTotal?.count || 0,
          pending: ordersPending?.count || 0,
          confirmed: ordersConfirmed?.count || 0,
          paid: ordersPaid?.count || 0,
          shipped: ordersShipped?.count || 0,
          delivered: ordersDelivered?.count || 0,
          cancelled: ordersCancelled?.count || 0,
          revenue: (ordersRevenue?.total || 0) + (ticketsRevenue?.total || 0)
        },
        tickets: {
          total: ticketsTotal?.count || 0,
          pending: ticketsPending?.count || 0,
          paid: ticketsPaid?.count || 0
        },
        products: {
          total: productsTotal?.count || 0,
          lowStock: productsLowStock?.count || 0
        },
        players: {
          total: playersTotal?.count || 0
        },
        matches: {
          total: matchesTotal?.count || 0,
          upcoming: matchesUpcoming?.count || 0
        },
        news: {
          total: newsTotal?.count || 0
        }
      }
    });

  } catch (error) {
    console.error('Erreur statistiques:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la récupération des statistiques'
    });
  }
});

// ===========================================
// GET /admin/users - Liste des utilisateurs
// ===========================================
router.get('/users', authAdmin, async (req, res) => {
  try {
    const { limit = 10, offset = 0 } = req.query;

    const users = await all(
      `SELECT id, name, email, phone, created_at 
       FROM users 
       ORDER BY created_at DESC 
       LIMIT ? OFFSET ?`,
      [parseInt(limit), parseInt(offset)]
    );

    const total = await get('SELECT COUNT(*) as count FROM users');

    res.json({
      success: true,
      data: users,
      pagination: {
        total: total?.count || 0,
        limit: parseInt(limit),
        offset: parseInt(offset)
      }
    });

  } catch (error) {
    console.error('Erreur liste utilisateurs:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la récupération des utilisateurs'
    });
  }
});

// ===========================================
// GET /admin/orders - Liste des commandes
// ===========================================
router.get('/orders', authAdmin, async (req, res) => {
  try {
    const { limit = 10, offset = 0, status } = req.query;

    let query = `
      SELECT o.*, u.name as user_name, u.email as user_email
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
    `;
    const params = [];

    if (status) {
      query += ' WHERE o.status = ?';
      params.push(status);
    }

    query += ' ORDER BY o.created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const orders = await all(query, params);

    let countQuery = 'SELECT COUNT(*) as count FROM orders';
    const countParams = [];
    if (status) {
      countQuery += ' WHERE status = ?';
      countParams.push(status);
    }
    const total = await get(countQuery, countParams);

    res.json({
      success: true,
      data: orders,
      pagination: {
        total: total?.count || 0,
        limit: parseInt(limit),
        offset: parseInt(offset)
      }
    });

  } catch (error) {
    console.error('Erreur liste commandes:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la récupération des commandes'
    });
  }
});

// ===========================================
// PUT /admin/orders/:id/status - Mettre à jour statut commande
// ===========================================
router.put('/orders/:id/status', authAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['pending', 'confirmed', 'paid', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Statut invalide'
      });
    }

    await run(
      'UPDATE orders SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [status, id]
    );

    const order = await get('SELECT * FROM orders WHERE id = ?', [id]);

    res.json({
      success: true,
      message: 'Statut de la commande mis à jour',
      data: order
    });

  } catch (error) {
    console.error('Erreur mise à jour commande:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la mise à jour'
    });
  }
});

// ===========================================
// GET /admin/tickets - Liste des tickets (admin)
// ===========================================
router.get('/tickets', authAdmin, async (req, res) => {
  try {
    const { limit = 20, offset = 0, status } = req.query;

    let query = `
      SELECT t.*, m.opponent, m.competition, m.match_date, m.venue,
             u.name as user_name, u.email as user_email
      FROM tickets t
      LEFT JOIN matches m ON t.match_id = m.id
      LEFT JOIN users u ON t.user_id = u.id
    `;
    const params = [];

    if (status) {
      query += ' WHERE t.status = ?';
      params.push(status);
    }

    query += ' ORDER BY t.created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const tickets = await all(query, params);

    let countQuery = 'SELECT COUNT(*) as count FROM tickets';
    const countParams = [];
    if (status) {
      countQuery += ' WHERE status = ?';
      countParams.push(status);
    }
    const total = await get(countQuery, countParams);

    res.json({
      success: true,
      data: tickets,
      pagination: {
        total: total?.count || 0,
        limit: parseInt(limit),
        offset: parseInt(offset)
      }
    });

  } catch (error) {
    console.error('Erreur liste tickets admin:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la récupération des tickets'
    });
  }
});

// ===========================================
// PUT /admin/tickets/:id/status - Mettre à jour statut ticket
// ===========================================
router.put('/tickets/:id/status', authAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['pending', 'paid', 'used', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Statut invalide'
      });
    }

    await run(
      'UPDATE tickets SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [status, id]
    );

    const ticket = await get('SELECT * FROM tickets WHERE id = ?', [id]);

    res.json({
      success: true,
      message: 'Statut du ticket mis à jour',
      data: ticket
    });

  } catch (error) {
    console.error('Erreur mise à jour ticket:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la mise à jour'
    });
  }
});

// ===========================================
// POST /admin/tickets - Créer un ticket (admin)
// Section par défaut si non spécifiée
// ===========================================


router.post('/tickets', authAdmin, async (req, res) => {
  try {
    const { user_id, match_id, seat_section, quantity, status } = req.body;

    // Validation
    if (!user_id || !match_id) {
      return res.status(400).json({
        success: false,
        message: 'user_id et match_id sont requis'
      });
    }

    // Vérifier que l'utilisateur existe
    const user = await get('SELECT id, name FROM users WHERE id = ?', [user_id]);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }

    // Vérifier que le match existe
    const match = await get('SELECT * FROM matches WHERE id = ?', [match_id]);
    if (!match) {
      return res.status(404).json({
        success: false,
        message: 'Match non trouvé'
      });
    }

    // Section par défaut: virage_nord
    const section = seat_section || 'virage_nord';
    const sectionData = STADIUM_SECTIONS.find(s => s.key === section) || STADIUM_SECTIONS[2];

    const qty = parseInt(quantity) || 1;
    const unitPrice = match.ticket_price * sectionData.price_multiplier;
    const totalAmount = unitPrice * qty;

    // Générer numéro de siège
    const seatNumber = `${section.toUpperCase().substring(0, 3)}-${Date.now().toString().slice(-6)}`;

    // Générer QR code
    const qrCode = `WAC-TICKET-ADMIN-${Date.now().toString(36).toUpperCase()}`;

    // Créer le ticket
    const result = await run(
      `INSERT INTO tickets (
        user_id, match_id, seat_section, seat_number,
        price, quantity, total_amount, status, qr_code, payment_date
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
      [
        user_id,
        match_id,
        section,
        seatNumber,
        unitPrice,
        qty,
        totalAmount,
        status || 'paid',
        qrCode
      ]
    );

    // Mettre à jour les places disponibles
    await run(
      'UPDATE matches SET available_seats = available_seats - ? WHERE id = ?',
      [qty, match_id]
    );

    // Récupérer le ticket créé
    const newTicket = await get(`
      SELECT t.*, m.opponent, m.competition, m.match_date, m.venue, u.name as user_name
      FROM tickets t
      JOIN matches m ON t.match_id = m.id
      JOIN users u ON t.user_id = u.id
      WHERE t.id = ?
    `, [result.id]);

    res.status(201).json({
      success: true,
      message: 'Ticket créé avec succès',
      data: newTicket
    });

  } catch (error) {
    console.error('Erreur création ticket admin:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la création du ticket'
    });
  }
});

// ===========================================
// DELETE /admin/tickets/:id - Supprimer un ticket (admin)
// ===========================================
router.delete('/tickets/:id', authAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const ticket = await get('SELECT * FROM tickets WHERE id = ?', [id]);
    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket non trouvé'
      });
    }

    // Remettre les places disponibles
    await run(
      'UPDATE matches SET available_seats = available_seats + ? WHERE id = ?',
      [ticket.quantity, ticket.match_id]
    );

    await run('DELETE FROM tickets WHERE id = ?', [id]);

    res.json({
      success: true,
      message: 'Ticket supprimé avec succès'
    });

  } catch (error) {
    console.error('Erreur suppression ticket:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la suppression'
    });
  }
});

// ===========================================
// Gestion des Sections de Billets (Admin)
// ===========================================

// Obtenir la configuration des sections pour un match
router.get('/matches/:id/sections', authAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const sections = await all('SELECT * FROM match_sections WHERE match_id = ?', [id]);

    // Si aucune section n'existe, renvoyer la config par défaut
    if (!sections || sections.length === 0) {
      const defaultSections = STADIUM_SECTIONS.map(s => ({
        category_key: s.key,
        price: 50.0 * s.price_multiplier, // Prix de base par défaut
        capacity: 5000,
        sold: 0
      }));
      return res.json({ success: true, data: defaultSections });
    }

    res.json({ success: true, data: sections });
  } catch (error) {
    console.error('Erreur récupération sections:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// Sauvegarder la configuration des sections
router.post('/matches/:id/sections', authAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { sections } = req.body; // Array of { category_key, price, capacity }

    if (!sections || !Array.isArray(sections)) {
      return res.status(400).json({ success: false, message: 'Données invalides' });
    }

    const match = await get('SELECT * FROM matches WHERE id = ?', [id]);
    if (!match) {
      return res.status(404).json({ success: false, message: 'Match non trouvé' });
    }

    // Supprimer l'ancienne config ou faire un upsert
    // Ici on supprime tout pour ce match et on recrée (plus simple)
    // Mais attention aux billets déjà vendus -> IDÉALEMENT on update
    // Pour l'instant : UPSERT simulé (INSERT OR REPLACE)

    for (const section of sections) {
      await run(`
        INSERT INTO match_sections (match_id, category_key, price, capacity)
        VALUES (?, ?, ?, ?)
        ON CONFLICT(match_id, category_key) 
        DO UPDATE SET price = excluded.price, capacity = excluded.capacity
      `, [id, section.category_key, section.price, section.capacity]);
    }

    // Mettre à jour le prix de base du match (optionnel, prend le prix le plus bas)
    const minPrice = Math.min(...sections.map(s => s.price));
    const totalCapacity = sections.reduce((acc, s) => acc + parseInt(s.capacity), 0);

    await run('UPDATE matches SET ticket_price = ?, available_seats = ? WHERE id = ?',
      [minPrice, totalCapacity, id]);

    res.json({ success: true, message: 'Configuration sauvegardée' });

  } catch (error) {
    console.error('Erreur sauvegarde sections:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

module.exports = router;
