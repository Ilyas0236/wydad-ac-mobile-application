/**
 * ===========================================
 * WYDAD ATHLETIC CLUB - PRODUCTS ROUTES
 * ===========================================
 * Routes pour la boutique officielle WAC
 * GET public + POST/PUT/DELETE admin
 * ===========================================
 */

const express = require('express');
const router = express.Router();
const { run, get, all } = require('../database');
const authAdmin = require('../middleware/authAdmin');

// Catégories de produits
const PRODUCT_CATEGORIES = [
  { key: 'maillots', label: 'Maillots', icon: '👕' },
  { key: 'vetements', label: 'Vêtements', icon: '🧥' },
  { key: 'accessoires', label: 'Accessoires', icon: '🧢' },
  { key: 'echarpes', label: 'Écharpes & Drapeaux', icon: '🚩' },
  { key: 'equipement', label: 'Équipement', icon: '⚽' },
  { key: 'enfants', label: 'Enfants', icon: '👶' },
  { key: 'collectors', label: 'Collectors', icon: '🏆' }
];

// ===========================================
// GET /products/categories - Catégories
// ===========================================
router.get('/categories', async (req, res) => {
  try {
    res.json({
      success: true,
      data: PRODUCT_CATEGORIES
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
});

// ===========================================
// GET /products - Liste des produits (public)
// ===========================================
router.get('/', async (req, res) => {
  try {
    const { category, featured, search, min_price, max_price } = req.query;

    let sql = 'SELECT * FROM products WHERE is_active = 1';
    const params = [];

    // Filtre par catégorie
    if (category) {
      sql += ' AND category = ?';
      params.push(category);
    }

    // Produits mis en avant
    if (featured === 'true') {
      sql += ' AND is_featured = 1';
    }

    // Recherche par nom
    if (search) {
      sql += ' AND (name LIKE ? OR description LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    // Filtre par prix
    if (min_price) {
      sql += ' AND price >= ?';
      params.push(parseFloat(min_price));
    }

    if (max_price) {
      sql += ' AND price <= ?';
      params.push(parseFloat(max_price));
    }

    sql += ' ORDER BY is_featured DESC, created_at DESC';

    const products = await all(sql, params);

    res.json({
      success: true,
      count: products.length,
      data: products
    });

  } catch (error) {
    console.error('Erreur liste produits:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
});

// ===========================================
// GET /products/featured - Produits en vedette
// ===========================================
router.get('/featured', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 6;

    const products = await all(
      `SELECT * FROM products 
       WHERE is_active = 1 AND is_featured = 1
       ORDER BY created_at DESC 
       LIMIT ?`,
      [limit]
    );

    res.json({
      success: true,
      count: products.length,
      data: products
    });

  } catch (error) {
    console.error('Erreur produits vedette:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
});

// ===========================================
// GET /products/:id - Détail d'un produit
// ===========================================
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const product = await get(
      'SELECT * FROM products WHERE id = ? AND is_active = 1',
      [id]
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Produit non trouvé'
      });
    }

    // Parser les tailles et couleurs (stockées en JSON string)
    if (product.sizes) {
      product.sizes = product.sizes.split(',');
    }
    if (product.colors) {
      product.colors = product.colors.split(',');
    }

    res.json({
      success: true,
      data: product
    });

  } catch (error) {
    console.error('Erreur détail produit:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
});

// ===========================================
// POST /products - Ajouter un produit (admin)
// ===========================================
router.post('/', authAdmin, async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      category,
      image,
      stock,
      sizes,
      colors,
      is_featured
    } = req.body;

    // Validation
    if (!name || !price || !category) {
      return res.status(400).json({
        success: false,
        message: 'Nom, prix et catégorie requis'
      });
    }

    // Vérifier la catégorie
    const validCategory = PRODUCT_CATEGORIES.find(c => c.key === category);
    if (!validCategory) {
      return res.status(400).json({
        success: false,
        message: 'Catégorie invalide'
      });
    }

    // Convertir les tableaux en string
    const sizesStr = Array.isArray(sizes) ? sizes.join(',') : sizes;
    const colorsStr = Array.isArray(colors) ? colors.join(',') : colors;

    // Insérer le produit
    const result = await run(
      `INSERT INTO products (
        name, description, price, category, image,
        stock, sizes, colors, is_featured
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        name,
        description || null,
        price,
        category,
        image || null,
        stock || 0,
        sizesStr || null,
        colorsStr || null,
        is_featured ? 1 : 0
      ]
    );

    const newProduct = await get('SELECT * FROM products WHERE id = ?', [result.id]);

    res.status(201).json({
      success: true,
      message: 'Produit ajouté avec succès',
      data: newProduct
    });

  } catch (error) {
    console.error('Erreur ajout produit:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
});

// ===========================================
// PUT /products/:id - Modifier un produit (admin)
// ===========================================
router.put('/:id', authAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      description,
      price,
      category,
      image,
      stock,
      sizes,
      colors,
      is_featured,
      is_active
    } = req.body;

    // Vérifier que le produit existe
    const product = await get('SELECT * FROM products WHERE id = ?', [id]);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Produit non trouvé'
      });
    }

    // Convertir les tableaux en string
    const sizesStr = Array.isArray(sizes) ? sizes.join(',') : sizes;
    const colorsStr = Array.isArray(colors) ? colors.join(',') : colors;

    await run(
      `UPDATE products SET
        name = COALESCE(?, name),
        description = COALESCE(?, description),
        price = COALESCE(?, price),
        category = COALESCE(?, category),
        image = COALESCE(?, image),
        stock = COALESCE(?, stock),
        sizes = COALESCE(?, sizes),
        colors = COALESCE(?, colors),
        is_featured = COALESCE(?, is_featured),
        is_active = COALESCE(?, is_active),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?`,
      [
        name, description, price, category, image,
        stock, sizesStr, colorsStr, is_featured, is_active, id
      ]
    );

    const updatedProduct = await get('SELECT * FROM products WHERE id = ?', [id]);

    res.json({
      success: true,
      message: 'Produit mis à jour',
      data: updatedProduct
    });

  } catch (error) {
    console.error('Erreur modification produit:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
});

// ===========================================
// DELETE /products/:id - Supprimer un produit (admin)
// ===========================================
router.delete('/:id', authAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const product = await get('SELECT * FROM products WHERE id = ?', [id]);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Produit non trouvé'
      });
    }

    // Soft delete
    await run(
      'UPDATE products SET is_active = 0, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [id]
    );

    res.json({
      success: true,
      message: 'Produit supprimé'
    });

  } catch (error) {
    console.error('Erreur suppression produit:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
});

module.exports = router;
