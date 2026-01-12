// ===========================================
// WYDAD AC - LOADING SCREEN COMPONENT
// Écran de chargement réutilisable
// ===========================================

import React from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { COLORS, SIZES } from '../theme/colors';

/**
 * Composant d'écran de chargement
 * @param {Object} props
 * @param {string} props.text - Texte à afficher (optionnel)
 * @param {string} props.color - Couleur de l'indicateur
 * @param {string} props.size - Taille de l'indicateur ('small' | 'large')
 * @param {boolean} props.fullScreen - Afficher en plein écran
 * @param {Object} props.style - Style personnalisé
 */
const LoadingScreen = ({
  text = null,
  color = COLORS.primary,
  size = 'large',
  fullScreen = true,
  style = null,
}) => {
  const containerStyle = fullScreen ? styles.fullScreen : styles.inline;

  return (
    <View style={[containerStyle, style]}>
      <ActivityIndicator size={size} color={color} />
      {text && <Text style={styles.text}>{text}</Text>}
    </View>
  );
};

/**
 * Version inline pour afficher dans une liste ou section
 */
export const LoadingIndicator = ({
  text = 'Chargement...',
  color = COLORS.primary,
  style = null,
}) => (
  <View style={[styles.inline, style]}>
    <ActivityIndicator size="small" color={color} />
    {text && <Text style={styles.inlineText}>{text}</Text>}
  </View>
);

/**
 * Overlay de chargement (pour les actions)
 */
export const LoadingOverlay = ({
  visible = true,
  text = 'Chargement...',
}) => {
  if (!visible) return null;

  return (
    <View style={styles.overlay}>
      <View style={styles.overlayContent}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        {text && <Text style={styles.overlayText}>{text}</Text>}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  fullScreen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  inline: {
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    marginTop: 15,
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  inlineText: {
    marginTop: 10,
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
  overlayContent: {
    backgroundColor: COLORS.card,
    borderRadius: SIZES.radiusMd,
    padding: 30,
    alignItems: 'center',
    minWidth: 150,
  },
  overlayText: {
    marginTop: 15,
    fontSize: 14,
    color: COLORS.text,
  },
});

export default LoadingScreen;
