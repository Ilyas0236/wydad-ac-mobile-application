/**
 * ===========================================
 * WYDAD ATHLETIC CLUB - UPLOAD ROUTES
 * ===========================================
 * Routes pour upload d'images
 * ===========================================
 */

const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const { upload, handleMulterError, uploadsDir } = require('../middleware/upload');
const { authUser, authAdmin } = require('../middleware');

// ===========================================
// POST /upload/:type - Upload d'une image
// Types: players, products, news, profiles
// ===========================================
router.post('/:type', authUser, upload.single('image'), handleMulterError, async (req, res) => {
  try {
    const { type } = req.params;
    const validTypes = ['players', 'products', 'news', 'profiles', 'general', 'matches'];

    if (!validTypes.includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Type d\'upload invalide'
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Aucun fichier reçu'
      });
    }

    // Construire l'URL de l'image
    const imageUrl = `/uploads/${type}/${req.file.filename}`;

    res.json({
      success: true,
      message: 'Image uploadée avec succès',
      data: {
        filename: req.file.filename,
        originalName: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
        url: imageUrl
      }
    });

  } catch (error) {
    console.error('Erreur upload:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de l\'upload'
    });
  }
});

// ===========================================
// POST /upload/:type/multiple - Upload multiple
// ===========================================
router.post('/:type/multiple', authAdmin, upload.array('images', 5), handleMulterError, async (req, res) => {
  try {
    const { type } = req.params;
    const validTypes = ['players', 'products', 'news', 'profiles', 'general', 'matches'];

    if (!validTypes.includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Type d\'upload invalide'
      });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Aucun fichier reçu'
      });
    }

    const uploadedFiles = req.files.map(file => ({
      filename: file.filename,
      originalName: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
      url: `/uploads/${type}/${file.filename}`
    }));

    res.json({
      success: true,
      message: `${uploadedFiles.length} image(s) uploadée(s) avec succès`,
      data: uploadedFiles
    });

  } catch (error) {
    console.error('Erreur upload multiple:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de l\'upload'
    });
  }
});

// ===========================================
// DELETE /upload/:type/:filename - Supprimer une image
// ===========================================
router.delete('/:type/:filename', authAdmin, async (req, res) => {
  try {
    const { type, filename } = req.params;
    const validTypes = ['players', 'products', 'news', 'profiles', 'general'];

    if (!validTypes.includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Type d\'upload invalide'
      });
    }

    // Sécurité: vérifier que le filename ne contient pas de path traversal
    if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
      return res.status(400).json({
        success: false,
        message: 'Nom de fichier invalide'
      });
    }

    const filePath = path.join(uploadsDir, type, filename);

    // Vérifier que le fichier existe
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: 'Fichier non trouvé'
      });
    }

    // Supprimer le fichier
    fs.unlinkSync(filePath);

    res.json({
      success: true,
      message: 'Image supprimée avec succès'
    });

  } catch (error) {
    console.error('Erreur suppression:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la suppression'
    });
  }
});

module.exports = router;
