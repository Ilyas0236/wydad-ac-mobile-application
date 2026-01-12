/**
 * ===========================================
 * WYDAD ATHLETIC CLUB - MIDDLEWARES INDEX
 * ===========================================
 * Export centralisé de tous les middlewares
 * ===========================================
 */

const authAdmin = require('./authAdmin');
const { authUser, optionalAuth } = require('./authUser');
const { upload, handleMulterError } = require('./upload');

module.exports = {
  authAdmin,
  authUser,
  optionalAuth,
  upload,
  handleMulterError
};
