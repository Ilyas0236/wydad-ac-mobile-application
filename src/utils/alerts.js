// ===========================================
// WYDAD AC - ALERT HELPERS
// Fonctions utilitaires pour les alertes
// ===========================================

import { Alert } from 'react-native';

/**
 * Affiche une alerte de confirmation de suppression
 * @param {string} itemName - Nom de l'élément à supprimer
 * @param {Function} onConfirm - Fonction à appeler si confirmé
 */
export const confirmDelete = (itemName, onConfirm) => {
  Alert.alert(
    'Confirmer la suppression',
    `Voulez-vous vraiment supprimer ${itemName}? Cette action est irréversible.`,
    [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Supprimer', style: 'destructive', onPress: onConfirm },
    ]
  );
};

/**
 * Affiche une alerte de confirmation de déconnexion
 * @param {Function} onConfirm - Fonction à appeler si confirmé
 */
export const confirmLogout = (onConfirm) => {
  Alert.alert(
    'Déconnexion',
    'Voulez-vous vraiment vous déconnecter?',
    [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Déconnexion', style: 'destructive', onPress: onConfirm },
    ]
  );
};

/**
 * Affiche une alerte de confirmation d'annulation
 * @param {string} message - Message personnalisé
 * @param {Function} onConfirm - Fonction à appeler si confirmé
 */
export const confirmCancel = (message, onConfirm) => {
  Alert.alert(
    'Annuler',
    message || 'Voulez-vous annuler cette action?',
    [
      { text: 'Non', style: 'cancel' },
      { text: 'Oui, annuler', style: 'destructive', onPress: onConfirm },
    ]
  );
};

/**
 * Affiche une alerte de confirmation générique
 * @param {Object} options - Options de l'alerte
 */
export const confirmAction = ({
  title = 'Confirmer',
  message,
  confirmText = 'Confirmer',
  cancelText = 'Annuler',
  onConfirm,
  destructive = false,
}) => {
  Alert.alert(title, message, [
    { text: cancelText, style: 'cancel' },
    { text: confirmText, style: destructive ? 'destructive' : 'default', onPress: onConfirm },
  ]);
};

/**
 * Affiche une alerte de succès
 * @param {string} message - Message de succès
 * @param {Function} onPress - Fonction à appeler quand OK est pressé
 */
export const showSuccess = (message, onPress = null) => {
  Alert.alert('Succès', message, [{ text: 'OK', onPress }]);
};

/**
 * Affiche une alerte d'erreur
 * @param {string} message - Message d'erreur
 * @param {Function} onPress - Fonction à appeler quand OK est pressé
 */
export const showError = (message, onPress = null) => {
  Alert.alert('Erreur', message, [{ text: 'OK', onPress }]);
};

/**
 * Affiche une alerte d'information
 * @param {string} title - Titre de l'alerte
 * @param {string} message - Message d'information
 */
export const showInfo = (title, message) => {
  Alert.alert(title, message, [{ text: 'OK' }]);
};

/**
 * Affiche une alerte demandant de se connecter
 * @param {Function} onLogin - Fonction pour naviguer vers login
 */
export const requireLogin = (onLogin) => {
  Alert.alert(
    'Connexion requise',
    'Veuillez vous connecter pour continuer',
    [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Se connecter', onPress: onLogin },
    ]
  );
};

/**
 * Affiche une alerte de confirmation d'achat
 * @param {Object} options - Options de l'alerte
 */
export const confirmPurchase = ({ itemName, price, onConfirm }) => {
  Alert.alert(
    'Confirmer l\'achat',
    `Voulez-vous acheter ${itemName} pour ${price} MAD?`,
    [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Confirmer', onPress: onConfirm },
    ]
  );
};

export default {
  confirmDelete,
  confirmLogout,
  confirmCancel,
  confirmAction,
  showSuccess,
  showError,
  showInfo,
  requireLogin,
  confirmPurchase,
};
