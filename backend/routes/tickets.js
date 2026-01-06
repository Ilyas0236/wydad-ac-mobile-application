/**
 * ===========================================
 * WYDAD ATHLETIC CLUB - TICKETS ROUTES
 * ===========================================
 * Routes pour la réservation de billets
 * Réservation et gestion des tickets
 * ===========================================
 */

const express = require('express');
const router = express.Router();
const { run, get, all } = require('../database');
const { authUser } = require('../middleware');
const authAdmin = require('../middleware/authAdmin');

// Sections du stade Mohammed V
const STADIUM_SECTIONS = [
  { key: 'tribune_honneur', label: 'Tribune d\'Honneur', price_multiplier: 2.0 },
  { key: 'tribune_presidentielle', label: 'Tribune Présidentielle', price_multiplier: 2.5 },
  { key: 'virage_nord', label: 'Virage Nord (Winners)', price_multiplier: 1.0 },
  { key: 'virage_sud', label: 'Virage Sud', price_multiplier: 1.0 },
  { key: 'lateral_est', label: 'Latéral Est', price_multiplier: 1.5 },
  { key: 'lateral_ouest', label: 'Latéral Ouest', price_multiplier: 1.5 }
];

// ===========================================
// GET /tickets/sections - Sections du stade
// ===========================================
router.get('/sections', async (req, res) => {
  try {
    res.json({
      success: true,
      data: STADIUM_SECTIONS
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
});

// ===========================================
// GET /tickets - Mes tickets (utilisateur connecté)
// ===========================================
router.get('/', authUser, async (req, res) => {
  try {
    const { status } = req.query;

    let sql = `
      SELECT t.*, m.opponent, m.competition, m.match_date, m.venue
      FROM tickets t
      JOIN matches m ON t.match_id = m.id
      WHERE t.user_id = ?
    `;
    const params = [req.user.id];

    if (status) {
      sql += ' AND t.status = ?';
      params.push(status);
    }

    sql += ' ORDER BY m.match_date DESC';

    const tickets = await all(sql, params);

    res.json({
      success: true,
      count: tickets.length,
      data: tickets
    });

  } catch (error) {
    console.error('Erreur liste tickets:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
});

// ===========================================
// GET /tickets/:id - Détail d'un ticket
// ===========================================
router.get('/:id', authUser, async (req, res) => {
  try {
    const { id } = req.params;

    const ticket = await get(`
      SELECT t.*, m.opponent, m.competition, m.match_date, m.venue, m.is_home
      FROM tickets t
      JOIN matches m ON t.match_id = m.id
      WHERE t.id = ? AND t.user_id = ?
    `, [id, req.user.id]);

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket non trouvé'
      });
    }

    res.json({
      success: true,
      data: ticket
    });

  } catch (error) {
    console.error('Erreur détail ticket:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
});

// ===========================================
// POST /tickets - Réserver un ticket
// ===========================================
router.post('/', authUser, async (req, res) => {
  try {
    const { match_id, seat_section, quantity } = req.body;

    // Validation
    if (!match_id || !seat_section) {
      return res.status(400).json({
        success: false,
        message: 'Match et section requis'
      });
    }

    const qty = parseInt(quantity) || 1;

    if (qty < 1 || qty > 10) {
      return res.status(400).json({
        success: false,
        message: 'Quantité entre 1 et 10 tickets maximum'
      });
    }

    // Vérifier que le match existe et est à venir
    const match = await get(
      'SELECT * FROM matches WHERE id = ? AND status = "upcoming"',
      [match_id]
    );

    if (!match) {
      return res.status(404).json({
        success: false,
        message: 'Match non trouvé ou non disponible'
      });
    }

    // Vérifier la section
    const section = STADIUM_SECTIONS.find(s => s.key === seat_section);
    if (!section) {
      return res.status(400).json({
        success: false,
        message: 'Section invalide'
      });
    }

    // Vérifier les places disponibles
    if (match.available_seats < qty) {
      return res.status(400).json({
        success: false,
        message: 'Pas assez de places disponibles'
      });
    }

    // Calculer le prix
    const unitPrice = match.ticket_price * section.price_multiplier;
    const totalAmount = unitPrice * qty;

    // Générer un numéro de siège
    const seatNumber = `${seat_section.toUpperCase().substring(0, 3)}-${Date.now().toString().slice(-6)}`;

    // Créer le ticket
    const result = await run(
      `INSERT INTO tickets (
        user_id, match_id, seat_section, seat_number,
        price, quantity, total_amount, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        req.user.id,
        match_id,
        seat_section,
        seatNumber,
        unitPrice,
        qty,
        totalAmount,
        'pending'
      ]
    );

    // Mettre à jour les places disponibles
    await run(
      'UPDATE matches SET available_seats = available_seats - ? WHERE id = ?',
      [qty, match_id]
    );

    // Récupérer le ticket créé avec les infos du match
    const newTicket = await get(`
      SELECT t.*, m.opponent, m.competition, m.match_date, m.venue
      FROM tickets t
      JOIN matches m ON t.match_id = m.id
      WHERE t.id = ?
    `, [result.id]);

    res.status(201).json({
      success: true,
      message: 'Ticket réservé avec succès! Procédez au paiement.',
      data: newTicket
    });

  } catch (error) {
    console.error('Erreur réservation ticket:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
});

// ===========================================
// DELETE /tickets/:id - Annuler une réservation
// ===========================================
router.delete('/:id', authUser, async (req, res) => {
  try {
    const { id } = req.params;

    // Vérifier que le ticket existe et appartient à l'utilisateur
    const ticket = await get(
      'SELECT * FROM tickets WHERE id = ? AND user_id = ?',
      [id, req.user.id]
    );

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket non trouvé'
      });
    }

    // Vérifier que le ticket n'est pas déjà payé
    if (ticket.status === 'paid') {
      return res.status(400).json({
        success: false,
        message: 'Impossible d\'annuler un ticket déjà payé'
      });
    }

    // Remettre les places disponibles
    await run(
      'UPDATE matches SET available_seats = available_seats + ? WHERE id = ?',
      [ticket.quantity, ticket.match_id]
    );

    // Supprimer le ticket
    await run('DELETE FROM tickets WHERE id = ?', [id]);

    res.json({
      success: true,
      message: 'Réservation annulée'
    });

  } catch (error) {
    console.error('Erreur annulation ticket:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
});

// ===========================================
// POST /tickets/:id/pay - Paiement simulé
// ===========================================
router.post('/:id/pay', authUser, async (req, res) => {
  try {
    const { id } = req.params;
    const { payment_method, card_number, card_holder } = req.body;

    // Vérifier que le ticket existe et appartient à l'utilisateur
    const ticket = await get(
      'SELECT * FROM tickets WHERE id = ? AND user_id = ?',
      [id, req.user.id]
    );

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket non trouvé'
      });
    }

    // Vérifier que le ticket n'est pas déjà payé
    if (ticket.status === 'paid') {
      return res.status(400).json({
        success: false,
        message: 'Ce ticket est déjà payé'
      });
    }

    // Validation du moyen de paiement
    const validMethods = ['card', 'paypal', 'cash', 'mobile_money'];
    const method = payment_method || 'card';

    if (!validMethods.includes(method)) {
      return res.status(400).json({
        success: false,
        message: 'Moyen de paiement invalide'
      });
    }

    // Simulation de paiement (toujours réussi pour le projet)
    // En production, intégrer une vraie passerelle de paiement

    // Générer un QR code unique pour le ticket
    const qrCode = `WAC-TICKET-${ticket.id}-${Date.now().toString(36).toUpperCase()}`;

    // Mettre à jour le ticket
    await run(
      `UPDATE tickets SET 
        status = 'paid',
        payment_method = ?,
        payment_date = CURRENT_TIMESTAMP,
        qr_code = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?`,
      [method, qrCode, id]
    );

    // Récupérer le ticket mis à jour avec les infos du match
    const paidTicket = await get(`
      SELECT t.*, m.opponent, m.competition, m.match_date, m.venue
      FROM tickets t
      JOIN matches m ON t.match_id = m.id
      WHERE t.id = ?
    `, [id]);

    res.json({
      success: true,
      message: '🎉 Paiement réussi! Votre ticket est prêt.',
      data: {
        ticket: paidTicket,
        payment: {
          method: method,
          amount: ticket.total_amount,
          currency: 'MAD',
          transaction_id: `TXN-${Date.now()}`,
          date: new Date().toISOString()
        }
      }
    });

  } catch (error) {
    console.error('Erreur paiement ticket:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors du paiement'
    });
  }
});

// ===========================================
// GET /tickets/:id/verify - Vérifier un ticket (scan QR)
// ===========================================
router.get('/:id/verify', async (req, res) => {
  try {
    const { id } = req.params;
    const { qr_code } = req.query;

    let ticket;

    if (qr_code) {
      // Recherche par QR code
      ticket = await get(`
        SELECT t.*, m.opponent, m.competition, m.match_date, m.venue, u.name as user_name
        FROM tickets t
        JOIN matches m ON t.match_id = m.id
        JOIN users u ON t.user_id = u.id
        WHERE t.qr_code = ?
      `, [qr_code]);
    } else {
      // Recherche par ID
      ticket = await get(`
        SELECT t.*, m.opponent, m.competition, m.match_date, m.venue, u.name as user_name
        FROM tickets t
        JOIN matches m ON t.match_id = m.id
        JOIN users u ON t.user_id = u.id
        WHERE t.id = ?
      `, [id]);
    }

    if (!ticket) {
      return res.status(404).json({
        success: false,
        valid: false,
        message: 'Ticket non trouvé'
      });
    }

    // Vérifier le statut
    if (ticket.status !== 'paid') {
      return res.json({
        success: true,
        valid: false,
        message: 'Ticket non payé',
        data: {
          status: ticket.status
        }
      });
    }

    res.json({
      success: true,
      valid: true,
      message: '✅ Ticket valide',
      data: {
        ticket_id: ticket.id,
        user_name: ticket.user_name,
        match: `WAC vs ${ticket.opponent}`,
        competition: ticket.competition,
        date: ticket.match_date,
        venue: ticket.venue,
        section: ticket.seat_section,
        seat: ticket.seat_number,
        quantity: ticket.quantity,
        status: ticket.status
      }
    });

  } catch (error) {
    console.error('Erreur vérification ticket:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
});

// ===========================================
// GET /tickets/admin/all - Tous les tickets (admin)
// ===========================================
router.get('/admin/all', authAdmin, async (req, res) => {
  try {
    const { match_id, status } = req.query;

    let sql = `
      SELECT t.*, m.opponent, m.match_date, u.name as user_name, u.email as user_email
      FROM tickets t
      JOIN matches m ON t.match_id = m.id
      JOIN users u ON t.user_id = u.id
      WHERE 1=1
    `;
    const params = [];

    if (match_id) {
      sql += ' AND t.match_id = ?';
      params.push(match_id);
    }

    if (status) {
      sql += ' AND t.status = ?';
      params.push(status);
    }

    sql += ' ORDER BY t.created_at DESC';

    const tickets = await all(sql, params);

    res.json({
      success: true,
      count: tickets.length,
      data: tickets
    });

  } catch (error) {
    console.error('Erreur admin tickets:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
});

module.exports = router;
