// ===========================================
// WYDAD AC - STATUS BADGE COMPONENT
// Badge de statut réutilisable
// ===========================================

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, SIZES } from '../theme/colors';
import { getStatusInfo } from '../utils/statusHelpers';

/**
 * Composant de badge de statut
 * @param {Object} props
 * @param {string} props.status - Clé du statut
 * @param {string} props.type - Type ('order' | 'ticket' | 'match' | 'payment')
 * @param {string} props.size - Taille ('small' | 'medium' | 'large')
 * @param {boolean} props.showIcon - Afficher l'icône
 * @param {Object} props.style - Style personnalisé
 */
const StatusBadge = ({
  status,
  type = 'order',
  size = 'medium',
  showIcon = true,
  style = null,
}) => {
  const statusInfo = getStatusInfo(status, type);
  const sizeStyles = sizes[size] || sizes.medium;

  return (
    <View style={[
      styles.badge,
      { backgroundColor: statusInfo.bgColor },
      sizeStyles.badge,
      style,
    ]}>
      {showIcon && (
        <Text style={[styles.icon, sizeStyles.icon]}>
          {statusInfo.icon}
        </Text>
      )}
      <Text style={[
        styles.label,
        { color: statusInfo.color },
        sizeStyles.label,
      ]}>
        {statusInfo.label}
      </Text>
    </View>
  );
};

/**
 * Variante avec juste un point coloré
 */
export const StatusDot = ({
  status,
  type = 'order',
  showLabel = false,
  style = null,
}) => {
  const statusInfo = getStatusInfo(status, type);

  return (
    <View style={[styles.dotContainer, style]}>
      <View style={[styles.dot, { backgroundColor: statusInfo.color }]} />
      {showLabel && (
        <Text style={[styles.dotLabel, { color: statusInfo.color }]}>
          {statusInfo.label}
        </Text>
      )}
    </View>
  );
};

/**
 * Badge de statut personnalisé
 */
export const CustomBadge = ({
  label,
  icon = null,
  color = COLORS.primary,
  bgColor = null,
  size = 'medium',
  style = null,
}) => {
  const sizeStyles = sizes[size] || sizes.medium;
  const backgroundColor = bgColor || color + '20';

  return (
    <View style={[styles.badge, { backgroundColor }, sizeStyles.badge, style]}>
      {icon && (
        <Text style={[styles.icon, sizeStyles.icon]}>{icon}</Text>
      )}
      <Text style={[styles.label, { color }, sizeStyles.label]}>
        {label}
      </Text>
    </View>
  );
};

const sizes = {
  small: {
    badge: {
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 8,
    },
    icon: {
      fontSize: 10,
      marginRight: 3,
    },
    label: {
      fontSize: 10,
    },
  },
  medium: {
    badge: {
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: 10,
    },
    icon: {
      fontSize: 12,
      marginRight: 4,
    },
    label: {
      fontSize: 12,
    },
  },
  large: {
    badge: {
      paddingHorizontal: 14,
      paddingVertical: 8,
      borderRadius: 12,
    },
    icon: {
      fontSize: 14,
      marginRight: 6,
    },
    label: {
      fontSize: 14,
    },
  },
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
  },
  icon: {
    // Taille définie par sizes
  },
  label: {
    fontWeight: '600',
  },

  // Dot styles
  dotContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  dotLabel: {
    fontSize: 12,
    marginLeft: 6,
    fontWeight: '500',
  },
});

export default StatusBadge;
