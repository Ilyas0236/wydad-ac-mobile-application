// ===========================================
// WYDAD AC - ROUTES ACTUALITÉS
// ===========================================

const express = require('express');
const router = express.Router();
const { run, get, all } = require('../database');
const { authAdmin } = require('../middleware');

// ===========================================
// LISTE DES ACTUALITÉS (PUBLIC)
// GET /news
// ===========================================
router.get('/', async (req, res) => {
  try {
    const { category, limit = 20, featured } = req.query;

    let query = 'SELECT * FROM news WHERE is_published = 1';
    const params = [];

    if (category) {
      query += ' AND category = ?';
      params.push(category);
    }

    if (featured === 'true') {
      query += ' AND is_featured = 1';
    }

    query += ' ORDER BY is_featured DESC, published_at DESC LIMIT ?';
    params.push(parseInt(limit));

    const news = await all(query, params);

    res.json({
      success: true,
      count: news.length,
      data: news
    });

  } catch (error) {
    console.error('Erreur liste news:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
});

// ===========================================
// CATÉGORIES D'ACTUALITÉS
// GET /news/categories
// ===========================================
router.get('/categories', async (req, res) => {
  try {
    const categories = [
      { id: 'match', name: 'Matchs', icon: '⚽' },
      { id: 'transfer', name: 'Transferts', icon: '🔄' },
      { id: 'team', name: 'Équipe', icon: '👥' },
      { id: 'club', name: 'Club', icon: '🏟️' },
      { id: 'youth', name: 'Formation', icon: '🌱' },
      { id: 'fans', name: 'Supporters', icon: '❤️' },
      { id: 'history', name: 'Histoire', icon: '🏆' }
    ];

    res.json({
      success: true,
      data: categories
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
});

// ===========================================
// ACTUALITÉS EN VEDETTE
// GET /news/featured
// ===========================================
router.get('/featured', async (req, res) => {
  try {
    const news = await all(
      `SELECT * FROM news 
       WHERE is_published = 1 AND is_featured = 1 
       ORDER BY published_at DESC 
       LIMIT 5`
    );

    res.json({
      success: true,
      count: news.length,
      data: news
    });

  } catch (error) {
    console.error('Erreur news featured:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
});

// ===========================================
// DÉTAIL D'UNE ACTUALITÉ
// GET /news/:id
// ===========================================
router.get('/:id', async (req, res) => {
  try {
    const newsId = req.params.id;

    const newsItem = await get(
      'SELECT * FROM news WHERE id = ? AND is_published = 1',
      [newsId]
    );

    if (!newsItem) {
      return res.status(404).json({
        success: false,
        message: 'Actualité non trouvée'
      });
    }

    // Incrémenter les vues
    await run(
      'UPDATE news SET views = views + 1 WHERE id = ?',
      [newsId]
    );

    // Articles similaires (même catégorie)
    const related = await all(
      `SELECT id, title, image, category, published_at 
       FROM news 
       WHERE category = ? AND id != ? AND is_published = 1 
       ORDER BY published_at DESC 
       LIMIT 3`,
      [newsItem.category, newsId]
    );

    res.json({
      success: true,
      data: {
        ...newsItem,
        views: newsItem.views + 1,
        related
      }
    });

  } catch (error) {
    console.error('Erreur détail news:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
});

// ===========================================
// ADMIN: CRÉER UNE ACTUALITÉ
// POST /news
// ===========================================
router.post('/', authAdmin, async (req, res) => {
  try {
    const { title, content, summary, category, image, is_featured, is_published } = req.body;

    if (!title || !content || !category) {
      return res.status(400).json({
        success: false,
        message: 'Titre, contenu et catégorie requis'
      });
    }

    const validCategories = ['general', 'match', 'transfer', 'transfert', 'team', 'club', 'youth', 'fans', 'history'];
    if (!validCategories.includes(category)) {
      return res.status(400).json({
        success: false,
        message: 'Catégorie invalide'
      });
    }

    // Normaliser la catégorie
    const normalizedCategory = category === 'transfert' ? 'transfer' : category;

    const result = await run(
      `INSERT INTO news (
        title, content, summary, category, image, 
        is_featured, is_published, published_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        title, 
        content, 
        summary || content.substring(0, 200) + '...', 
        normalizedCategory, 
        image || null,
        is_featured ? 1 : 0,
        is_published !== false ? 1 : 0,
        is_published !== false ? new Date().toISOString() : null
      ]
    );

    res.status(201).json({
      success: true,
      message: 'Actualité créée avec succès',
      data: {
        id: result.id,
        title,
        category
      }
    });

  } catch (error) {
    console.error('Erreur création news:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
});

// ===========================================
// ADMIN: MODIFIER UNE ACTUALITÉ
// PUT /news/:id
// ===========================================
router.put('/:id', authAdmin, async (req, res) => {
  try {
    const newsId = req.params.id;
    const { title, content, summary, category, image, is_featured, is_published } = req.body;

    const existing = await get('SELECT * FROM news WHERE id = ?', [newsId]);

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Actualité non trouvée'
      });
    }

    // Gérer la date de publication
    let publishedAt = existing.published_at;
    if (is_published && !existing.is_published) {
      publishedAt = new Date().toISOString();
    } else if (is_published === false) {
      publishedAt = null;
    }

    await run(
      `UPDATE news SET 
        title = COALESCE(?, title),
        content = COALESCE(?, content),
        summary = COALESCE(?, summary),
        category = COALESCE(?, category),
        image = COALESCE(?, image),
        is_featured = COALESCE(?, is_featured),
        is_published = COALESCE(?, is_published),
        published_at = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?`,
      [
        title, content, summary, category, image,
        is_featured !== undefined ? (is_featured ? 1 : 0) : null,
        is_published !== undefined ? (is_published ? 1 : 0) : null,
        publishedAt,
        newsId
      ]
    );

    res.json({
      success: true,
      message: 'Actualité mise à jour',
      data: { id: newsId }
    });

  } catch (error) {
    console.error('Erreur update news:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
});

// ===========================================
// ADMIN: SUPPRIMER UNE ACTUALITÉ
// DELETE /news/:id
// ===========================================
router.delete('/:id', authAdmin, async (req, res) => {
  try {
    const newsId = req.params.id;

    const existing = await get('SELECT * FROM news WHERE id = ?', [newsId]);

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Actualité non trouvée'
      });
    }

    await run('DELETE FROM news WHERE id = ?', [newsId]);

    res.json({
      success: true,
      message: 'Actualité supprimée'
    });

  } catch (error) {
    console.error('Erreur suppression news:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
});

// ===========================================
// ADMIN: TOUTES LES ACTUALITÉS
// GET /news/admin/all
// ===========================================
router.get('/admin/all', authAdmin, async (req, res) => {
  try {
    const news = await all(
      'SELECT * FROM news ORDER BY created_at DESC'
    );

    const stats = await get(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN is_published = 1 THEN 1 ELSE 0 END) as published,
        SUM(CASE WHEN is_published = 0 THEN 1 ELSE 0 END) as drafts,
        SUM(CASE WHEN is_featured = 1 THEN 1 ELSE 0 END) as featured,
        SUM(views) as total_views
      FROM news
    `);

    res.json({
      success: true,
      stats,
      count: news.length,
      data: news
    });

  } catch (error) {
    console.error('Erreur admin news:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
});

module.exports = router;
