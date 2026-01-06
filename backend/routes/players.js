/**
 * ===========================================
 * WYDAD ATHLETIC CLUB - PLAYERS ROUTES
 * ===========================================
 * Routes pour la gestion des joueurs
 * GET public + POST/PUT/DELETE admin
 * ===========================================
 */

const express = require('express');
const router = express.Router();
const { run, get, all } = require('../database');
const authAdmin = require('../middleware/authAdmin');

// ===========================================
// GET /players - Liste tous les joueurs (public)
// ===========================================
router.get('/', async (req, res) => {
  try {
    const { position, active } = req.query;

    let sql = 'SELECT * FROM players WHERE 1=1';
    const params = [];

    // Filtre par position
    if (position) {
      sql += ' AND position = ?';
      params.push(position);
    }

    // Filtre par statut actif (par défaut: actifs seulement)
    if (active !== 'all') {
      sql += ' AND is_active = 1';
    }

    sql += ' ORDER BY number ASC';

    const players = await all(sql, params);

    res.json({
      success: true,
      count: players.length,
      data: players
    });

  } catch (error) {
    console.error('Erreur liste joueurs:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
});

// ===========================================
// GET /players/positions - Liste des positions
// ===========================================
router.get('/positions', async (req, res) => {
  try {
    const positions = [
      { key: 'goalkeeper', label: 'Gardien', labelFr: 'Gardien de but' },
      { key: 'defender', label: 'Défenseur', labelFr: 'Défenseur' },
      { key: 'midfielder', label: 'Milieu', labelFr: 'Milieu de terrain' },
      { key: 'forward', label: 'Attaquant', labelFr: 'Attaquant' }
    ];

    res.json({
      success: true,
      data: positions
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
});

// ===========================================
// GET /players/:id - Détail d'un joueur (public)
// ===========================================
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const player = await get('SELECT * FROM players WHERE id = ?', [id]);

    if (!player) {
      return res.status(404).json({
        success: false,
        message: 'Joueur non trouvé'
      });
    }

    res.json({
      success: true,
      data: player
    });

  } catch (error) {
    console.error('Erreur détail joueur:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
});

// ===========================================
// POST /players - Ajouter un joueur (admin)
// ===========================================
router.post('/', authAdmin, async (req, res) => {
  try {
    const {
      name,
      number,
      position,
      nationality,
      birth_date,
      height,
      weight,
      image,
      bio
    } = req.body;

    // Validation des champs requis
    if (!name || !position) {
      return res.status(400).json({
        success: false,
        message: 'Nom et position sont requis'
      });
    }

    // Vérifier si le numéro est déjà pris
    if (number) {
      const existingNumber = await get(
        'SELECT id FROM players WHERE number = ? AND is_active = 1',
        [number]
      );

      if (existingNumber) {
        return res.status(409).json({
          success: false,
          message: `Le numéro ${number} est déjà attribué`
        });
      }
    }

    // Insérer le joueur
    const result = await run(
      `INSERT INTO players (
        name, number, position, nationality, birth_date,
        height, weight, image, bio
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        name,
        number || null,
        position,
        nationality || 'Maroc',
        birth_date || null,
        height || null,
        weight || null,
        image || null,
        bio || null
      ]
    );

    // Récupérer le joueur créé
    const newPlayer = await get('SELECT * FROM players WHERE id = ?', [result.id]);

    res.status(201).json({
      success: true,
      message: 'Joueur ajouté avec succès',
      data: newPlayer
    });

  } catch (error) {
    console.error('Erreur ajout joueur:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
});

// ===========================================
// PUT /players/:id - Modifier un joueur (admin)
// ===========================================
router.put('/:id', authAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      number,
      position,
      nationality,
      birth_date,
      height,
      weight,
      image,
      bio,
      goals,
      assists,
      matches_played,
      is_active
    } = req.body;

    // Vérifier que le joueur existe
    const player = await get('SELECT * FROM players WHERE id = ?', [id]);

    if (!player) {
      return res.status(404).json({
        success: false,
        message: 'Joueur non trouvé'
      });
    }

    // Vérifier le numéro si modifié
    if (number && number !== player.number) {
      const existingNumber = await get(
        'SELECT id FROM players WHERE number = ? AND id != ? AND is_active = 1',
        [number, id]
      );

      if (existingNumber) {
        return res.status(409).json({
          success: false,
          message: `Le numéro ${number} est déjà attribué`
        });
      }
    }

    // Mettre à jour
    await run(
      `UPDATE players SET
        name = COALESCE(?, name),
        number = COALESCE(?, number),
        position = COALESCE(?, position),
        nationality = COALESCE(?, nationality),
        birth_date = COALESCE(?, birth_date),
        height = COALESCE(?, height),
        weight = COALESCE(?, weight),
        image = COALESCE(?, image),
        bio = COALESCE(?, bio),
        goals = COALESCE(?, goals),
        assists = COALESCE(?, assists),
        matches_played = COALESCE(?, matches_played),
        is_active = COALESCE(?, is_active),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?`,
      [
        name, number, position, nationality, birth_date,
        height, weight, image, bio, goals, assists,
        matches_played, is_active, id
      ]
    );

    // Récupérer le joueur mis à jour
    const updatedPlayer = await get('SELECT * FROM players WHERE id = ?', [id]);

    res.json({
      success: true,
      message: 'Joueur mis à jour',
      data: updatedPlayer
    });

  } catch (error) {
    console.error('Erreur modification joueur:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
});

// ===========================================
// DELETE /players/:id - Supprimer un joueur (admin)
// ===========================================
router.delete('/:id', authAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    // Vérifier que le joueur existe
    const player = await get('SELECT * FROM players WHERE id = ?', [id]);

    if (!player) {
      return res.status(404).json({
        success: false,
        message: 'Joueur non trouvé'
      });
    }

    // Soft delete (désactiver au lieu de supprimer)
    await run(
      'UPDATE players SET is_active = 0, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [id]
    );

    res.json({
      success: true,
      message: 'Joueur supprimé'
    });

  } catch (error) {
    console.error('Erreur suppression joueur:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
});

module.exports = router;
