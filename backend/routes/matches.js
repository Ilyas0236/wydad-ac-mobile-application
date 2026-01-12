/**
 * ===========================================
 * WYDAD ATHLETIC CLUB - MATCHES ROUTES
 * ===========================================
 * Routes pour la gestion des matchs
 * GET public + POST/PUT/DELETE admin
 * ===========================================
 */

const express = require('express');
const router = express.Router();
const { run, get, all } = require('../database');
const authAdmin = require('../middleware/authAdmin');

// ===========================================
// GET /matches - Liste tous les matchs (public)
// ===========================================
router.get('/', async (req, res) => {
  try {
    const { status, competition, upcoming } = req.query;

    let sql = 'SELECT * FROM matches WHERE 1=1';
    const params = [];

    // Filtre par statut (upcoming, live, finished)
    if (status) {
      sql += ' AND status = ?';
      params.push(status);
    }

    // Filtre par compétition
    if (competition) {
      sql += ' AND competition = ?';
      params.push(competition);
    }

    // Filtre matchs à venir uniquement
    if (upcoming === 'true') {
      sql += ' AND match_date >= datetime("now")';
    }

    sql += ' ORDER BY match_date ASC';

    const matches = await all(sql, params);

    res.json({
      success: true,
      count: matches.length,
      data: matches
    });

  } catch (error) {
    console.error('Erreur liste matchs:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
});

// ===========================================
// GET /matches/upcoming - Prochains matchs (public)
// ===========================================
// Obtenir les sections d'un match (Prix et places)
router.get('/:id/sections', async (req, res) => {
  try {
    const { id } = req.params;
    const sections = await all('SELECT * FROM match_sections WHERE match_id = ?', [id]);

    // Si pas de config spécifique, retourner config par défaut basée sur STADIUM_SECTIONS
    if (!sections || sections.length === 0) {
      // On pourrait retourner un tableau vide, le front gérera les valeurs par défaut
      // Ou on génère les valeurs par défaut ici. Le front devra mapper avec les icônes.
      return res.json({ success: true, data: [] });
    }

    res.json({ success: true, data: sections });
  } catch (error) {
    console.error('Erreur récupération sections match:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// Obtenir tous les matchs à venir
router.get('/upcoming', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 5;

    const matches = await all(
      `SELECT * FROM matches 
       WHERE match_date >= datetime("now") AND status = "upcoming"
       ORDER BY match_date ASC 
       LIMIT ?`,
      [limit]
    );

    res.json({
      success: true,
      count: matches.length,
      data: matches
    });

  } catch (error) {
    console.error('Erreur prochains matchs:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
});

// ===========================================
// GET /matches/results - Résultats récents (public)
// ===========================================
router.get('/results', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 5;

    const matches = await all(
      `SELECT * FROM matches 
       WHERE status = "finished"
       ORDER BY match_date DESC 
       LIMIT ?`,
      [limit]
    );

    res.json({
      success: true,
      count: matches.length,
      data: matches
    });

  } catch (error) {
    console.error('Erreur résultats:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
});

// ===========================================
// GET /matches/competitions - Liste compétitions
// ===========================================
router.get('/competitions', async (req, res) => {
  try {
    const competitions = [
      { key: 'botola', label: 'Botola Pro', country: 'Maroc' },
      { key: 'caf_cl', label: 'Ligue des Champions CAF', country: 'Afrique' },
      { key: 'caf_cc', label: 'Coupe de la Confédération', country: 'Afrique' },
      { key: 'coupe_trone', label: 'Coupe du Trône', country: 'Maroc' },
      { key: 'supercoupe', label: 'Supercoupe du Maroc', country: 'Maroc' },
      { key: 'friendly', label: 'Match amical', country: '' }
    ];

    res.json({
      success: true,
      data: competitions
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
});

// ===========================================
// GET /matches/:id - Détail d'un match (public)
// ===========================================
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const match = await get('SELECT * FROM matches WHERE id = ?', [id]);

    if (!match) {
      return res.status(404).json({
        success: false,
        message: 'Match non trouvé'
      });
    }

    res.json({
      success: true,
      data: match
    });

  } catch (error) {
    console.error('Erreur détail match:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
});

// ===========================================
// POST /matches - Ajouter un match (admin)
// ===========================================
router.post('/', authAdmin, async (req, res) => {
  try {
    const {
      opponent,
      opponent_logo,
      competition,
      match_date,
      venue,
      is_home,
      wac_logo,
      ticket_price,
      available_seats
    } = req.body;

    // Validation des champs requis
    if (!opponent || !competition || !match_date) {
      return res.status(400).json({
        success: false,
        message: 'Adversaire, compétition et date sont requis'
      });
    }

    // Insérer le match
    const result = await run(
      `INSERT INTO matches (
        opponent, opponent_logo, competition, match_date,
        venue, is_home, wac_logo, ticket_price, available_seats, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        opponent,
        opponent_logo || null,
        competition,
        match_date,
        venue || 'Stade Mohammed V',
        is_home !== undefined ? is_home : 1,
        wac_logo || null,
        ticket_price || 50.00,
        available_seats || 45000,
        'upcoming'
      ]
    );

    // Récupérer le match créé
    const newMatch = await get('SELECT * FROM matches WHERE id = ?', [result.id]);

    res.status(201).json({
      success: true,
      message: 'Match ajouté avec succès',
      data: newMatch
    });

  } catch (error) {
    console.error('Erreur ajout match:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
});

// ===========================================
// PUT /matches/:id - Modifier un match (admin)
// ===========================================
router.put('/:id', authAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      opponent,
      opponent_logo,
      competition,
      match_date,
      venue,
      is_home,
      score_wac,
      score_opponent,
      status,
      wac_logo,
      ticket_price,
      available_seats
    } = req.body;

    // Vérifier que le match existe
    const match = await get('SELECT * FROM matches WHERE id = ?', [id]);

    if (!match) {
      return res.status(404).json({
        success: false,
        message: 'Match non trouvé'
      });
    }

    // Mettre à jour
    await run(
      `UPDATE matches SET
        opponent = COALESCE(?, opponent),
        opponent_logo = COALESCE(?, opponent_logo),
        competition = COALESCE(?, competition),
        match_date = COALESCE(?, match_date),
        venue = COALESCE(?, venue),
        is_home = COALESCE(?, is_home),
        score_wac = COALESCE(?, score_wac),
        score_opponent = COALESCE(?, score_opponent),
        status = COALESCE(?, status),
        wac_logo = COALESCE(?, wac_logo),
        ticket_price = COALESCE(?, ticket_price),
        available_seats = COALESCE(?, available_seats),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?`,
      [
        opponent, opponent_logo, competition, match_date,
        venue, is_home, score_wac, score_opponent, status,
        wac_logo, ticket_price, available_seats, id
      ]
    );

    // Récupérer le match mis à jour
    const updatedMatch = await get('SELECT * FROM matches WHERE id = ?', [id]);

    res.json({
      success: true,
      message: 'Match mis à jour',
      data: updatedMatch
    });

  } catch (error) {
    console.error('Erreur modification match:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
});

// ===========================================
// PUT /matches/:id/score - Mettre à jour le score (admin)
// ===========================================
router.put('/:id/score', authAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { score_wac, score_opponent, status } = req.body;

    // Vérifier que le match existe
    const match = await get('SELECT * FROM matches WHERE id = ?', [id]);

    if (!match) {
      return res.status(404).json({
        success: false,
        message: 'Match non trouvé'
      });
    }

    // Mettre à jour le score
    await run(
      `UPDATE matches SET
        score_wac = ?,
        score_opponent = ?,
        status = COALESCE(?, status),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?`,
      [score_wac, score_opponent, status || 'finished', id]
    );

    // Récupérer le match mis à jour
    const updatedMatch = await get('SELECT * FROM matches WHERE id = ?', [id]);

    res.json({
      success: true,
      message: 'Score mis à jour',
      data: updatedMatch
    });

  } catch (error) {
    console.error('Erreur mise à jour score:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
});

// ===========================================
// DELETE /matches/:id - Supprimer un match (admin)
// ===========================================
router.delete('/:id', authAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    // Vérifier que le match existe
    const match = await get('SELECT * FROM matches WHERE id = ?', [id]);

    if (!match) {
      return res.status(404).json({
        success: false,
        message: 'Match non trouvé'
      });
    }

    // Vérifier si des tickets sont liés à ce match
    const tickets = await get('SELECT COUNT(*) as count FROM tickets WHERE match_id = ?', [id]);

    if (tickets.count > 0) {
      return res.status(400).json({
        success: false,
        message: 'Impossible de supprimer: des tickets sont liés à ce match'
      });
    }

    // Supprimer le match
    await run('DELETE FROM matches WHERE id = ?', [id]);

    res.json({
      success: true,
      message: 'Match supprimé'
    });

  } catch (error) {
    console.error('Erreur suppression match:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
});

module.exports = router;
