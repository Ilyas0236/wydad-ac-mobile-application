// ===========================================
// WYDAD AC - ROUTES COMMANDES BOUTIQUE
// ===========================================

const express = require('express');
const router = express.Router();
const { run, get, all } = require('../database');
const { authUser, authAdmin } = require('../middleware');

// ===========================================
// CRÉER UNE COMMANDE
// POST /orders
// ===========================================
router.post('/', authUser, async (req, res) => {
  try {
    const userId = req.user.id;
    const { items, shipping_address, shipping_city, shipping_phone, payment_method } = req.body;

    // Validation
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Le panier est vide'
      });
    }

    if (!shipping_address || !shipping_city || !shipping_phone) {
      return res.status(400).json({
        success: false,
        message: 'Adresse de livraison incomplète'
      });
    }

    // Vérifier le stock et calculer le total
    let totalAmount = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await get(
        'SELECT * FROM products WHERE id = ? AND is_active = 1',
        [item.product_id]
      );

      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Produit ID ${item.product_id} non trouvé`
        });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Stock insuffisant pour "${product.name}". Disponible: ${product.stock}`
        });
      }

      // Valider la taille si spécifiée
      if (item.size && product.sizes) {
        const availableSizes = product.sizes.split(',');
        if (!availableSizes.includes(item.size)) {
          return res.status(400).json({
            success: false,
            message: `Taille "${item.size}" non disponible pour "${product.name}"`
          });
        }
      }

      const itemTotal = product.price * item.quantity;
      totalAmount += itemTotal;

      orderItems.push({
        product_id: product.id,
        product_name: product.name,
        quantity: item.quantity,
        size: item.size || null,
        color: item.color || null,
        unit_price: product.price,
        total_price: itemTotal
      });
    }

    // Frais de livraison (gratuit au-dessus de 500 MAD)
    const shippingFee = totalAmount >= 500 ? 0 : 30;
    const finalTotal = totalAmount + shippingFee;

    // Générer un numéro de commande unique
    const orderNumber = `WAC-${Date.now()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;

    // Déterminer le statut initial selon le mode de paiement
    const isCOD = payment_method === 'cod';
    const initialStatus = isCOD ? 'confirmed' : 'pending';
    const paymentRef = isCOD ? `COD-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}` : null;

    // Créer la commande
    const result = await run(
      `INSERT INTO orders (
        user_id, order_number, total_amount, shipping_fee, 
        shipping_address, shipping_city, shipping_phone, status,
        payment_method, payment_ref
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [userId, orderNumber, finalTotal, shippingFee, shipping_address, shipping_city, shipping_phone, initialStatus, payment_method || 'card', paymentRef]
    );

    const orderId = result.id;

    // Ajouter les items de la commande
    for (const item of orderItems) {
      await run(
        `INSERT INTO order_items (
          order_id, product_id, product_name, quantity, size, color, unit_price, total_price
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [orderId, item.product_id, item.product_name, item.quantity, item.size, item.color, item.unit_price, item.total_price]
      );

      // Réduire le stock
      await run(
        'UPDATE products SET stock = stock - ? WHERE id = ?',
        [item.quantity, item.product_id]
      );
    }

    res.status(201).json({
      success: true,
      message: isCOD ? 'Commande confirmée (paiement à la livraison)' : 'Commande créée avec succès',
      data: {
        order_id: orderId,
        order_number: orderNumber,
        items_count: orderItems.length,
        subtotal: totalAmount,
        shipping_fee: shippingFee,
        total: finalTotal,
        status: initialStatus,
        payment_method: payment_method || 'card',
        payment_ref: paymentRef,
        shipping: {
          address: shipping_address,
          city: shipping_city,
          phone: shipping_phone
        }
      }
    });

  } catch (error) {
    console.error('Erreur création commande:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
});

// ===========================================
// PAYER UNE COMMANDE (SIMULATION)
// POST /orders/:id/pay
// ===========================================
router.post('/:id/pay', authUser, async (req, res) => {
  try {
    const orderId = req.params.id;
    const userId = req.user.id;
    const { payment_method } = req.body;

    // Vérifier que la commande existe et appartient à l'utilisateur
    const order = await get(
      'SELECT * FROM orders WHERE id = ? AND user_id = ?',
      [orderId, userId]
    );

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Commande non trouvée'
      });
    }

    if (order.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `Cette commande est déjà ${order.status}`
      });
    }

    // Méthodes de paiement acceptées
    const validMethods = ['card', 'cod', 'cash_on_delivery', 'bank_transfer'];
    const method = payment_method || 'card';

    if (!validMethods.includes(method)) {
      return res.status(400).json({
        success: false,
        message: 'Méthode de paiement invalide'
      });
    }

    // Simuler le paiement (toujours succès)
    const paymentRef = `PAY-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
    const newStatus = (method === 'cash_on_delivery' || method === 'cod') ? 'confirmed' : 'paid';

    await run(
      `UPDATE orders SET 
        status = ?, 
        payment_method = ?,
        payment_ref = ?,
        paid_at = CURRENT_TIMESTAMP,
        updated_at = CURRENT_TIMESTAMP 
      WHERE id = ?`,
      [newStatus, method, paymentRef, orderId]
    );

    res.json({
      success: true,
      message: method === 'cash_on_delivery' 
        ? 'Commande confirmée - Paiement à la livraison'
        : 'Paiement effectué avec succès',
      data: {
        order_id: orderId,
        order_number: order.order_number,
        payment_method: method,
        payment_ref: paymentRef,
        status: newStatus,
        total_paid: order.total_amount
      }
    });

  } catch (error) {
    console.error('Erreur paiement commande:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
});

// ===========================================
// MES COMMANDES
// GET /orders/my
// ===========================================
router.get('/my', authUser, async (req, res) => {
  try {
    const userId = req.user.id;

    const orders = await all(
      `SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC`,
      [userId]
    );

    // Récupérer les items pour chaque commande
    for (let order of orders) {
      order.items = await all(
        'SELECT * FROM order_items WHERE order_id = ?',
        [order.id]
      );
    }

    res.json({
      success: true,
      count: orders.length,
      data: orders
    });

  } catch (error) {
    console.error('Erreur récupération commandes:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
});

// ===========================================
// DÉTAIL D'UNE COMMANDE
// GET /orders/:id
// ===========================================
router.get('/:id', authUser, async (req, res) => {
  try {
    const orderId = req.params.id;
    const userId = req.user.id;

    const order = await get(
      'SELECT * FROM orders WHERE id = ? AND user_id = ?',
      [orderId, userId]
    );

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Commande non trouvée'
      });
    }

    // Récupérer les items
    order.items = await all(
      'SELECT * FROM order_items WHERE order_id = ?',
      [orderId]
    );

    res.json({
      success: true,
      data: order
    });

  } catch (error) {
    console.error('Erreur détail commande:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
});

// ===========================================
// ANNULER UNE COMMANDE
// POST /orders/:id/cancel
// ===========================================
router.post('/:id/cancel', authUser, async (req, res) => {
  try {
    const orderId = req.params.id;
    const userId = req.user.id;

    const order = await get(
      'SELECT * FROM orders WHERE id = ? AND user_id = ?',
      [orderId, userId]
    );

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Commande non trouvée'
      });
    }

    // Seules les commandes pending ou confirmed peuvent être annulées
    if (!['pending', 'confirmed'].includes(order.status)) {
      return res.status(400).json({
        success: false,
        message: 'Cette commande ne peut plus être annulée'
      });
    }

    // Restaurer le stock
    const items = await all(
      'SELECT product_id, quantity FROM order_items WHERE order_id = ?',
      [orderId]
    );

    for (const item of items) {
      await run(
        'UPDATE products SET stock = stock + ? WHERE id = ?',
        [item.quantity, item.product_id]
      );
    }

    // Annuler la commande
    await run(
      `UPDATE orders SET status = 'cancelled', updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      [orderId]
    );

    res.json({
      success: true,
      message: 'Commande annulée avec succès',
      data: {
        order_id: orderId,
        order_number: order.order_number,
        status: 'cancelled'
      }
    });

  } catch (error) {
    console.error('Erreur annulation commande:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
});

// ===========================================
// ADMIN: TOUTES LES COMMANDES
// GET /orders/admin/all
// ===========================================
router.get('/admin/all', authAdmin, async (req, res) => {
  try {
    const { status, limit = 50 } = req.query;

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

    query += ' ORDER BY o.created_at DESC LIMIT ?';
    params.push(parseInt(limit));

    const orders = await all(query, params);

    // Stats
    const stats = await get(`
      SELECT 
        COUNT(*) as total_orders,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
        SUM(CASE WHEN status = 'paid' THEN 1 ELSE 0 END) as paid,
        SUM(CASE WHEN status = 'shipped' THEN 1 ELSE 0 END) as shipped,
        SUM(CASE WHEN status = 'delivered' THEN 1 ELSE 0 END) as delivered,
        SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) as cancelled,
        SUM(CASE WHEN status IN ('paid', 'shipped', 'delivered') THEN total_amount ELSE 0 END) as total_revenue
      FROM orders
    `);

    res.json({
      success: true,
      stats,
      count: orders.length,
      data: orders
    });

  } catch (error) {
    console.error('Erreur admin commandes:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
});

// ===========================================
// ADMIN: METTRE À JOUR LE STATUT
// PUT /orders/admin/:id/status
// ===========================================
router.put('/admin/:id/status', authAdmin, async (req, res) => {
  try {
    const orderId = req.params.id;
    const { status } = req.body;

    const validStatuses = ['pending', 'confirmed', 'paid', 'shipped', 'delivered', 'cancelled'];

    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Statut invalide'
      });
    }

    const order = await get('SELECT * FROM orders WHERE id = ?', [orderId]);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Commande non trouvée'
      });
    }

    await run(
      `UPDATE orders SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      [status, orderId]
    );

    res.json({
      success: true,
      message: `Commande mise à jour: ${status}`,
      data: {
        order_id: orderId,
        order_number: order.order_number,
        old_status: order.status,
        new_status: status
      }
    });

  } catch (error) {
    console.error('Erreur update statut:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
});

// ===========================================
// TÉLÉCHARGER UNE FACTURE EN PDF
// GET /orders/:id/invoice
// ===========================================
const { generateInvoicePDF } = require('../utils/pdfGenerator');

router.get('/:id/invoice', authUser, async (req, res) => {
  try {
    const orderId = req.params.id;
    const userId = req.user.id;

    // Récupérer la commande
    const order = await get(
      'SELECT * FROM orders WHERE id = ? AND user_id = ?',
      [orderId, userId]
    );

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Commande non trouvée'
      });
    }

    // Récupérer les items
    const items = await all(
      'SELECT * FROM order_items WHERE order_id = ?',
      [orderId]
    );

    // Récupérer les infos utilisateur
    const user = await get(
      'SELECT name, email, phone FROM users WHERE id = ?',
      [userId]
    );

    // Générer le PDF
    const pdfBuffer = await generateInvoicePDF(order, items, user);

    // Envoyer le PDF
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=facture-wac-${order.order_number}.pdf`);
    res.send(pdfBuffer);

  } catch (error) {
    console.error('Erreur génération facture PDF:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la génération de la facture'
    });
  }
});

module.exports = router;
