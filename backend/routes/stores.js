// ===========================================
// WYDAD AC - ROUTES BOUTIQUES
// ===========================================

const express = require('express');
const router = express.Router();
const { run, get, all } = require('../database');
const { authAdmin } = require('../middleware');

// ===========================================
// LISTE DES BOUTIQUES (PUBLIC)
// GET /stores
// ===========================================
router.get('/', async (req, res) => {
  try {
    const { city, type } = req.query;

    let query = 'SELECT * FROM stores WHERE is_active = 1';
    const params = [];

    if (city) {
      query += ' AND city = ?';
      params.push(city);
    }

    if (type) {
      query += ' AND type = ?';
      params.push(type);
    }

    query += ' ORDER BY city, name';

    const stores = await all(query, params);

    res.json({
      success: true,
      count: stores.length,
      data: stores
    });

  } catch (error) {
    console.error('Erreur liste stores:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
});

// ===========================================
// VILLES DISPONIBLES
// GET /stores/cities
// ===========================================
router.get('/cities', async (req, res) => {
  try {
    const cities = await all(
      `SELECT DISTINCT city, COUNT(*) as store_count 
       FROM stores 
       WHERE is_active = 1 
       GROUP BY city 
       ORDER BY store_count DESC`
    );

    res.json({
      success: true,
      data: cities
    });

  } catch (error) {
    console.error('Erreur cities:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
});

// ===========================================
// TYPES DE BOUTIQUES
// GET /stores/types
// ===========================================
router.get('/types', async (req, res) => {
  try {
    const types = [
      { id: 'official', name: 'Boutique Officielle', icon: '🏪' },
      { id: 'stadium', name: 'Point de Vente Stade', icon: '🏟️' },
      { id: 'partner', name: 'Revendeur Agréé', icon: '🤝' },
      { id: 'popup', name: 'Boutique Éphémère', icon: '⭐' }
    ];

    res.json({
      success: true,
      data: types
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
});

// ===========================================
// BOUTIQUES À PROXIMITÉ
// GET /stores/nearby
// ===========================================
router.get('/nearby', async (req, res) => {
  try {
    const { latitude, longitude, radius = 10 } = req.query;

    if (!latitude || !longitude) {
      return res.status(400).json({
        success: false,
        message: 'Latitude et longitude requises'
      });
    }

    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);
    const rad = parseFloat(radius); // km

    // Formule Haversine simplifiée pour SQLite
    // Note: Pour une vraie app, utiliser une extension spatiale
    const stores = await all(
      `SELECT *, 
        (6371 * acos(
          cos(radians(?)) * cos(radians(latitude)) * 
          cos(radians(longitude) - radians(?)) + 
          sin(radians(?)) * sin(radians(latitude))
        )) AS distance
       FROM stores 
       WHERE is_active = 1
       HAVING distance <= ?
       ORDER BY distance
       LIMIT 10`,
      [lat, lng, lat, rad]
    );

    // Si la formule Haversine ne fonctionne pas (SQLite sans extension math)
    // On fait un filtre simple par bounding box
    if (stores.length === 0) {
      const latRange = rad / 111; // ~111km par degré de latitude
      const lngRange = rad / (111 * Math.cos(lat * Math.PI / 180));

      const nearbyStores = await all(
        `SELECT * FROM stores 
         WHERE is_active = 1
         AND latitude BETWEEN ? AND ?
         AND longitude BETWEEN ? AND ?
         ORDER BY name`,
        [lat - latRange, lat + latRange, lng - lngRange, lng + lngRange]
      );

      return res.json({
        success: true,
        count: nearbyStores.length,
        data: nearbyStores
      });
    }

    res.json({
      success: true,
      count: stores.length,
      data: stores
    });

  } catch (error) {
    console.error('Erreur nearby stores:', error);
    // Fallback: retourner toutes les boutiques
    const allStores = await all('SELECT * FROM stores WHERE is_active = 1');
    res.json({
      success: true,
      count: allStores.length,
      data: allStores,
      note: 'Toutes les boutiques (géolocalisation non disponible)'
    });
  }
});

// ===========================================
// DÉTAIL D'UNE BOUTIQUE
// GET /stores/:id
// ===========================================
router.get('/:id', async (req, res) => {
  try {
    const storeId = req.params.id;

    const store = await get(
      'SELECT * FROM stores WHERE id = ? AND is_active = 1',
      [storeId]
    );

    if (!store) {
      return res.status(404).json({
        success: false,
        message: 'Boutique non trouvée'
      });
    }

    // Autres boutiques dans la même ville
    const nearby = await all(
      `SELECT id, name, address, type 
       FROM stores 
       WHERE city = ? AND id != ? AND is_active = 1 
       LIMIT 3`,
      [store.city, storeId]
    );

    res.json({
      success: true,
      data: {
        ...store,
        nearby_stores: nearby
      }
    });

  } catch (error) {
    console.error('Erreur détail store:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
});

// ===========================================
// ADMIN: CRÉER UNE BOUTIQUE
// POST /stores
// ===========================================
router.post('/', authAdmin, async (req, res) => {
  try {
    const { 
      name, address, city, phone, email,
      latitude, longitude, type, 
      opening_hours, description, image 
    } = req.body;

    if (!name || !address || !city || !latitude || !longitude) {
      return res.status(400).json({
        success: false,
        message: 'Nom, adresse, ville et coordonnées GPS requis'
      });
    }

    const validTypes = ['official', 'stadium', 'partner', 'popup'];
    const storeType = validTypes.includes(type) ? type : 'partner';

    const result = await run(
      `INSERT INTO stores (
        name, address, city, phone, email,
        latitude, longitude, type, 
        opening_hours, description, image
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        name, address, city, phone || null, email || null,
        parseFloat(latitude), parseFloat(longitude), storeType,
        opening_hours || null, description || null, image || null
      ]
    );

    res.status(201).json({
      success: true,
      message: 'Boutique créée avec succès',
      data: {
        id: result.id,
        name,
        city,
        type: storeType
      }
    });

  } catch (error) {
    console.error('Erreur création store:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
});

// ===========================================
// ADMIN: MODIFIER UNE BOUTIQUE
// PUT /stores/:id
// ===========================================
router.put('/:id', authAdmin, async (req, res) => {
  try {
    const storeId = req.params.id;
    const { 
      name, address, city, phone, email,
      latitude, longitude, type, 
      opening_hours, description, image, is_active 
    } = req.body;

    const existing = await get('SELECT * FROM stores WHERE id = ?', [storeId]);

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Boutique non trouvée'
      });
    }

    await run(
      `UPDATE stores SET 
        name = COALESCE(?, name),
        address = COALESCE(?, address),
        city = COALESCE(?, city),
        phone = COALESCE(?, phone),
        email = COALESCE(?, email),
        latitude = COALESCE(?, latitude),
        longitude = COALESCE(?, longitude),
        type = COALESCE(?, type),
        opening_hours = COALESCE(?, opening_hours),
        description = COALESCE(?, description),
        image = COALESCE(?, image),
        is_active = COALESCE(?, is_active),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?`,
      [
        name, address, city, phone, email,
        latitude ? parseFloat(latitude) : null, 
        longitude ? parseFloat(longitude) : null, 
        type, opening_hours, description, image,
        is_active !== undefined ? (is_active ? 1 : 0) : null,
        storeId
      ]
    );

    res.json({
      success: true,
      message: 'Boutique mise à jour',
      data: { id: storeId }
    });

  } catch (error) {
    console.error('Erreur update store:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
});

// ===========================================
// ADMIN: SUPPRIMER UNE BOUTIQUE
// DELETE /stores/:id
// ===========================================
router.delete('/:id', authAdmin, async (req, res) => {
  try {
    const storeId = req.params.id;

    const existing = await get('SELECT * FROM stores WHERE id = ?', [storeId]);

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Boutique non trouvée'
      });
    }

    await run('DELETE FROM stores WHERE id = ?', [storeId]);

    res.json({
      success: true,
      message: 'Boutique supprimée'
    });

  } catch (error) {
    console.error('Erreur suppression store:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
});

// ===========================================
// ADMIN: TOUTES LES BOUTIQUES
// GET /stores/admin/all
// ===========================================
router.get('/admin/all', authAdmin, async (req, res) => {
  try {
    const stores = await all(
      'SELECT * FROM stores ORDER BY city, name'
    );

    const stats = await get(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN is_active = 1 THEN 1 ELSE 0 END) as active,
        SUM(CASE WHEN type = 'official' THEN 1 ELSE 0 END) as official,
        SUM(CASE WHEN type = 'stadium' THEN 1 ELSE 0 END) as stadium,
        SUM(CASE WHEN type = 'partner' THEN 1 ELSE 0 END) as partner
      FROM stores
    `);

    res.json({
      success: true,
      stats,
      count: stores.length,
      data: stores
    });

  } catch (error) {
    console.error('Erreur admin stores:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
});

module.exports = router;
