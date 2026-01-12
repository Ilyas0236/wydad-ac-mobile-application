// ===========================================
// WYDAD AC - QUANTITY SELECTOR COMPONENT
// Sélecteur de quantité réutilisable
// ===========================================

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS, SIZES, SHADOWS } from '../theme/colors';

/**
 * Composant de sélection de quantité
 * @param {Object} props
 * @param {number} props.value - Valeur actuelle
 * @param {Function} props.onChange - Callback de changement
 * @param {number} props.min - Valeur minimum (défaut: 1)
 * @param {number} props.max - Valeur maximum (défaut: 99)
 * @param {string} props.size - Taille ('small' | 'medium' | 'large')
 * @param {boolean} props.disabled - Désactivé
 * @param {Object} props.style - Style personnalisé
 */
const QuantitySelector = ({
  value = 1,
  onChange,
  min = 1,
  max = 99,
  size = 'medium',
  disabled = false,
  style = null,
}) => {
  const sizeStyles = sizes[size] || sizes.medium;

  const handleDecrease = () => {
    if (!disabled && value > min) {
      onChange(value - 1);
    }
  };

  const handleIncrease = () => {
    if (!disabled && value < max) {
      onChange(value + 1);
    }
  };

  const canDecrease = !disabled && value > min;
  const canIncrease = !disabled && value < max;

  return (
    <View style={[styles.container, sizeStyles.container, style]}>
      {/* Bouton - */}
      <TouchableOpacity
        style={[
          styles.button,
          sizeStyles.button,
          !canDecrease && styles.buttonDisabled,
        ]}
        onPress={handleDecrease}
        disabled={!canDecrease}
        activeOpacity={0.7}
      >
        <Text style={[
          styles.buttonText,
          sizeStyles.buttonText,
          !canDecrease && styles.buttonTextDisabled,
        ]}>
          −
        </Text>
      </TouchableOpacity>

      {/* Valeur */}
      <View style={[styles.valueContainer, sizeStyles.valueContainer]}>
        <Text style={[
          styles.value,
          sizeStyles.value,
          disabled && styles.valueDisabled,
        ]}>
          {value}
        </Text>
      </View>

      {/* Bouton + */}
      <TouchableOpacity
        style={[
          styles.button,
          sizeStyles.button,
          !canIncrease && styles.buttonDisabled,
        ]}
        onPress={handleIncrease}
        disabled={!canIncrease}
        activeOpacity={0.7}
      >
        <Text style={[
          styles.buttonText,
          sizeStyles.buttonText,
          !canIncrease && styles.buttonTextDisabled,
        ]}>
          +
        </Text>
      </TouchableOpacity>
    </View>
  );
};

/**
 * Version compacte (inline)
 */
export const QuantitySelectorCompact = ({
  value = 1,
  onChange,
  min = 1,
  max = 99,
  disabled = false,
  style = null,
}) => {
  const handleDecrease = () => {
    if (!disabled && value > min) {
      onChange(value - 1);
    }
  };

  const handleIncrease = () => {
    if (!disabled && value < max) {
      onChange(value + 1);
    }
  };

  const canDecrease = !disabled && value > min;
  const canIncrease = !disabled && value < max;

  return (
    <View style={[styles.compactContainer, style]}>
      <TouchableOpacity
        style={[styles.compactButton, !canDecrease && styles.compactButtonDisabled]}
        onPress={handleDecrease}
        disabled={!canDecrease}
      >
        <Text style={[styles.compactButtonText, !canDecrease && styles.compactButtonTextDisabled]}>
          −
        </Text>
      </TouchableOpacity>

      <Text style={[styles.compactValue, disabled && styles.valueDisabled]}>
        {value}
      </Text>

      <TouchableOpacity
        style={[styles.compactButton, !canIncrease && styles.compactButtonDisabled]}
        onPress={handleIncrease}
        disabled={!canIncrease}
      >
        <Text style={[styles.compactButtonText, !canIncrease && styles.compactButtonTextDisabled]}>
          +
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const sizes = {
  small: {
    container: {
      height: 32,
    },
    button: {
      width: 32,
      height: 32,
    },
    buttonText: {
      fontSize: 16,
    },
    valueContainer: {
      minWidth: 35,
    },
    value: {
      fontSize: 14,
    },
  },
  medium: {
    container: {
      height: 40,
    },
    button: {
      width: 40,
      height: 40,
    },
    buttonText: {
      fontSize: 20,
    },
    valueContainer: {
      minWidth: 45,
    },
    value: {
      fontSize: 16,
    },
  },
  large: {
    container: {
      height: 48,
    },
    button: {
      width: 48,
      height: 48,
    },
    buttonText: {
      fontSize: 24,
    },
    valueContainer: {
      minWidth: 55,
    },
    value: {
      fontSize: 20,
    },
  },
};

const styles = StyleSheet.create({
  // Standard version
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: SIZES.radiusMd,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
  },
  button: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  buttonDisabled: {
    backgroundColor: COLORS.background,
    opacity: 0.5,
  },
  buttonText: {
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  buttonTextDisabled: {
    color: COLORS.textLight,
  },
  valueContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: COLORS.border,
  },
  value: {
    color: COLORS.text,
    fontWeight: 'bold',
  },
  valueDisabled: {
    color: COLORS.textLight,
  },

  // Compact version
  compactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  compactButton: {
    width: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    borderRadius: 14,
  },
  compactButtonDisabled: {
    backgroundColor: COLORS.border,
  },
  compactButtonText: {
    color: COLORS.textWhite,
    fontSize: 16,
    fontWeight: 'bold',
  },
  compactButtonTextDisabled: {
    color: COLORS.textLight,
  },
  compactValue: {
    marginHorizontal: 15,
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
    minWidth: 25,
    textAlign: 'center',
  },
});

export default QuantitySelector;
