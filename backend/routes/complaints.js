/**
 * ===========================================
 * WYDAD ATHLETIC CLUB - COMPLAINTS ROUTES
 * ===========================================
 * Routes pour la gestion des réclamations
 * ===========================================
 */

const express = require('express');
const router = express.Router();
const { run, get, all } = require('../database');
const { authUser } = require('../middleware');
const authAdmin = require('../middleware/authAdmin');

// ===========================================
// POST /complaints - Créer une réclamation (User)
// ===========================================
router.post('/', authUser, async (req, res) => {
    try {
        const { subject, message } = req.body;

        if (!subject || !message) {
            return res.status(400).json({
                success: false,
                message: 'Sujet et message requis'
            });
        }

        const result = await run(
            `INSERT INTO complaints (user_id, subject, message) VALUES (?, ?, ?)`,
            [req.user.id, subject, message]
        );

        const newComplaint = await get('SELECT * FROM complaints WHERE id = ?', [result.id]);

        res.status(201).json({
            success: true,
            message: 'Réclamation envoyée avec succès',
            data: newComplaint
        });

    } catch (error) {
        console.error('Erreur création réclamation:', error);
        res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
});

// ===========================================
// GET /complaints/my - Récupérer mes réclamations (User)
// ===========================================
router.get('/my', authUser, async (req, res) => {
    try {
        const complaints = await all(
            'SELECT * FROM complaints WHERE user_id = ? ORDER BY created_at DESC',
            [req.user.id]
        );

        res.json({
            success: true,
            data: complaints
        });

    } catch (error) {
        console.error('Erreur récupération réclamations user:', error);
        res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
});

// ===========================================
// GET /complaints/admin - Récupérer toutes les réclamations (Admin)
// ===========================================
router.get('/admin', authAdmin, async (req, res) => {
    try {
        const complaints = await all(`
      SELECT c.*, u.name as user_name, u.email as user_email
      FROM complaints c
      JOIN users u ON c.user_id = u.id
      ORDER BY 
        CASE WHEN c.status = 'pending' THEN 0 ELSE 1 END,
        c.created_at DESC
    `);

        res.json({
            success: true,
            data: complaints
        });

    } catch (error) {
        console.error('Erreur admin réclamations:', error);
        res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
});

// ===========================================
// PUT /complaints/:id/reply - Répondre à une réclamation (Admin)
// ===========================================
router.put('/:id/reply', authAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { response } = req.body;

        if (!response) {
            return res.status(400).json({ success: false, message: 'Réponse requise' });
        }

        await run(
            `UPDATE complaints 
       SET admin_response = ?, status = 'replied', updated_at = CURRENT_TIMESTAMP 
       WHERE id = ?`,
            [response, id]
        );

        const updatedComplaint = await get('SELECT * FROM complaints WHERE id = ?', [id]);

        res.json({
            success: true,
            message: 'Réponse envoyée',
            data: updatedComplaint
        });

    } catch (error) {
        console.error('Erreur réponse réclamation:', error);
        res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
});

module.exports = router;
