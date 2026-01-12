// ===========================================
// WYDAD AC - ERROR STATE COMPONENT
// État d'erreur réutilisable
// ===========================================

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS, SIZES, SHADOWS } from '../theme/colors';

/**
 * Composant d'état d'erreur
 * @param {Object} props
 * @param {string} props.icon - Icône emoji à afficher
 * @param {string} props.title - Titre de l'erreur
 * @param {string} props.message - Message détaillé
 * @param {string} props.buttonText - Texte du bouton d'action
 * @param {Function} props.onAction - Action du bouton
 * @param {Function} props.onBack - Action de retour
 * @param {boolean} props.showBack - Afficher le bouton retour
 * @param {Object} props.style - Style personnalisé
 */
const ErrorState = ({
  icon = '❌',
  title = 'Erreur',
  message = 'Une erreur est survenue',
  buttonText = 'Réessayer',
  onAction = null,
  onBack = null,
  showBack = true,
  style = null,
}) => {
  return (
    <View style={[styles.container, style]}>
      <Text style={styles.icon}>{icon}</Text>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
      
      <View style={styles.buttonsContainer}>
        {onAction && (
          <TouchableOpacity style={styles.actionButton} onPress={onAction}>
            <Text style={styles.actionButtonText}>{buttonText}</Text>
          </TouchableOpacity>
        )}
        
        {showBack && onBack && (
          <TouchableOpacity style={styles.backButton} onPress={onBack}>
            <Text style={styles.backButtonText}>Retour</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

/**
 * Version pour "élément non trouvé"
 */
export const NotFoundState = ({
  itemName = 'Élément',
  onBack = null,
}) => (
  <ErrorState
    icon="🔍"
    title={`${itemName} non trouvé`}
    message={`Désolé, nous n'avons pas trouvé cet élément.`}
    showBack={!!onBack}
    onBack={onBack}
    onAction={null}
  />
);

/**
 * Version pour erreur de connexion
 */
export const ConnectionErrorState = ({
  onRetry = null,
  onBack = null,
}) => (
  <ErrorState
    icon="📡"
    title="Erreur de connexion"
    message="Impossible de se connecter au serveur. Vérifiez votre connexion internet."
    buttonText="Réessayer"
    onAction={onRetry}
    onBack={onBack}
  />
);

/**
 * Version pour erreur d'authentification
 */
export const AuthErrorState = ({
  onLogin = null,
}) => (
  <ErrorState
    icon="🔐"
    title="Connexion requise"
    message="Vous devez être connecté pour accéder à cette fonctionnalité."
    buttonText="Se connecter"
    onAction={onLogin}
    showBack={false}
  />
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
    backgroundColor: COLORS.background,
  },
  icon: {
    fontSize: 60,
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 10,
    textAlign: 'center',
  },
  message: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 22,
  },
  buttonsContainer: {
    width: '100%',
    maxWidth: 300,
    gap: 10,
  },
  actionButton: {
    backgroundColor: COLORS.primary,
    borderRadius: SIZES.radiusMd,
    padding: 15,
    alignItems: 'center',
    ...SHADOWS.small,
  },
  actionButtonText: {
    color: COLORS.textWhite,
    fontSize: 16,
    fontWeight: 'bold',
  },
  backButton: {
    backgroundColor: COLORS.card,
    borderRadius: SIZES.radiusMd,
    padding: 15,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  backButtonText: {
    color: COLORS.text,
    fontSize: 16,
  },
});

export default ErrorState;
