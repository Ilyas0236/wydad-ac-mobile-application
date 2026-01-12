// ===========================================
// WYDAD AC - SCREEN HEADER COMPONENT
// En-tête d'écran réutilisable
// ===========================================

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SIZES, SHADOWS } from '../theme/colors';

/**
 * Composant d'en-tête d'écran simple
 * @param {Object} props
 * @param {string} props.title - Titre de l'écran
 * @param {string} props.subtitle - Sous-titre (optionnel)
 * @param {Function} props.onBack - Action de retour
 * @param {React.ReactNode} props.rightAction - Composant à droite (optionnel)
 * @param {boolean} props.transparent - Fond transparent
 * @param {Object} props.style - Style personnalisé
 */
const ScreenHeader = ({
  title,
  subtitle = null,
  onBack = null,
  rightAction = null,
  transparent = false,
  style = null,
}) => {
  return (
    <View style={[
      styles.header,
      transparent && styles.headerTransparent,
      style
    ]}>
      {/* Bouton retour */}
      {onBack ? (
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Text style={[styles.backIcon, transparent && styles.backIconDark]}>←</Text>
        </TouchableOpacity>
      ) : (
        <View style={styles.placeholder} />
      )}

      {/* Titre */}
      <View style={styles.titleContainer}>
        <Text style={[styles.title, transparent && styles.titleDark]} numberOfLines={1}>
          {title}
        </Text>
        {subtitle && (
          <Text style={[styles.subtitle, transparent && styles.subtitleDark]}>
            {subtitle}
          </Text>
        )}
      </View>

      {/* Action à droite */}
      {rightAction ? (
        <View style={styles.rightAction}>{rightAction}</View>
      ) : (
        <View style={styles.placeholder} />
      )}
    </View>
  );
};

/**
 * Composant d'en-tête avec dégradé
 */
export const GradientHeader = ({
  title,
  subtitle = null,
  onBack = null,
  rightAction = null,
  colors = [COLORS.primary, COLORS.primaryDark || '#8B0000'],
  style = null,
}) => {
  return (
    <LinearGradient colors={colors} style={[styles.gradientHeader, style]}>
      {/* Bouton retour */}
      {onBack ? (
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
      ) : (
        <View style={styles.placeholder} />
      )}

      {/* Titre */}
      <View style={styles.titleContainer}>
        <Text style={styles.gradientTitle} numberOfLines={1}>
          {title}
        </Text>
        {subtitle && (
          <Text style={styles.gradientSubtitle}>{subtitle}</Text>
        )}
      </View>

      {/* Action à droite */}
      {rightAction ? (
        <View style={styles.rightAction}>{rightAction}</View>
      ) : (
        <View style={styles.placeholder} />
      )}
    </LinearGradient>
  );
};

/**
 * Composant d'en-tête compact (pour les modals)
 */
export const ModalHeader = ({
  title,
  onClose = null,
  leftAction = null,
}) => {
  return (
    <View style={styles.modalHeader}>
      {leftAction || <View style={styles.modalPlaceholder} />}
      
      <Text style={styles.modalTitle}>{title}</Text>
      
      {onClose ? (
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Text style={styles.closeIcon}>✕</Text>
        </TouchableOpacity>
      ) : (
        <View style={styles.modalPlaceholder} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  // Header Simple
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SIZES.screenPadding,
    backgroundColor: COLORS.primary,
  },
  headerTransparent: {
    backgroundColor: 'transparent',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  backButton: {
    padding: 5,
    minWidth: 40,
  },
  backIcon: {
    fontSize: 24,
    color: COLORS.textWhite,
  },
  backIconDark: {
    color: COLORS.text,
  },
  titleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.textWhite,
  },
  titleDark: {
    color: COLORS.text,
  },
  subtitle: {
    fontSize: 12,
    color: COLORS.textWhite + 'CC',
    marginTop: 2,
  },
  subtitleDark: {
    color: COLORS.textSecondary,
  },
  rightAction: {
    minWidth: 40,
    alignItems: 'flex-end',
  },
  placeholder: {
    width: 40,
  },

  // Gradient Header
  gradientHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SIZES.screenPadding,
    paddingTop: SIZES.screenPadding + 10,
  },
  gradientTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.textWhite,
  },
  gradientSubtitle: {
    fontSize: 13,
    color: COLORS.textWhite + 'CC',
    marginTop: 4,
  },

  // Modal Header
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    flex: 1,
    textAlign: 'center',
  },
  closeButton: {
    padding: 5,
    minWidth: 30,
    alignItems: 'center',
  },
  closeIcon: {
    fontSize: 20,
    color: COLORS.textSecondary,
  },
  modalPlaceholder: {
    width: 30,
  },
});

export default ScreenHeader;
