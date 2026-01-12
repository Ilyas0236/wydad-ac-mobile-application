// ===========================================
// WYDAD AC - FILTER TABS COMPONENT
// Onglets de filtre réutilisables
// ===========================================

import React from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SIZES, SHADOWS } from '../theme/colors';

/**
 * Composant d'onglets de filtre
 * @param {Object} props
 * @param {Array} props.options - Liste des options [{key, label, icon?}]
 * @param {string} props.selected - Clé de l'option sélectionnée
 * @param {Function} props.onSelect - Callback de sélection
 * @param {boolean} props.useGradient - Utiliser un dégradé pour l'option active
 * @param {boolean} props.showIcons - Afficher les icônes
 * @param {Object} props.style - Style personnalisé du conteneur
 */
const FilterTabs = ({
  options = [],
  selected,
  onSelect,
  useGradient = false,
  showIcons = true,
  style = null,
}) => {
  const renderOption = ({ item }) => {
    const isSelected = selected === item.key;

    if (useGradient && isSelected) {
      return (
        <TouchableOpacity
          style={styles.filterBtn}
          onPress={() => onSelect(item.key)}
        >
          <LinearGradient
            colors={[COLORS.primary, COLORS.primaryDark || '#8B0000']}
            style={styles.gradientBtn}
          >
            {showIcons && item.icon && (
              <Text style={styles.iconActive}>{item.icon}</Text>
            )}
            <Text style={styles.textActive}>{item.label}</Text>
          </LinearGradient>
        </TouchableOpacity>
      );
    }

    return (
      <TouchableOpacity
        style={[
          styles.filterBtn,
          isSelected && styles.filterBtnActive,
        ]}
        onPress={() => onSelect(item.key)}
      >
        {showIcons && item.icon && (
          <Text style={[styles.icon, isSelected && styles.iconActive]}>
            {item.icon}
          </Text>
        )}
        <Text style={[styles.text, isSelected && styles.textActive]}>
          {item.label}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, style]}>
      <FlatList
        horizontal
        data={options}
        keyExtractor={(item) => item.key}
        renderItem={renderOption}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
};

/**
 * Version verticale des onglets de filtre
 */
export const FilterTabsVertical = ({
  options = [],
  selected,
  onSelect,
  style = null,
}) => {
  return (
    <View style={[styles.verticalContainer, style]}>
      {options.map((item) => {
        const isSelected = selected === item.key;
        return (
          <TouchableOpacity
            key={item.key}
            style={[
              styles.verticalBtn,
              isSelected && styles.verticalBtnActive,
            ]}
            onPress={() => onSelect(item.key)}
          >
            {item.icon && (
              <Text style={[styles.verticalIcon, isSelected && styles.verticalIconActive]}>
                {item.icon}
              </Text>
            )}
            <Text style={[styles.verticalText, isSelected && styles.verticalTextActive]}>
              {item.label}
            </Text>
            {item.count !== undefined && (
              <View style={[styles.countBadge, isSelected && styles.countBadgeActive]}>
                <Text style={[styles.countText, isSelected && styles.countTextActive]}>
                  {item.count}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

/**
 * Version sous forme de segments (pilules)
 */
export const SegmentedTabs = ({
  options = [],
  selected,
  onSelect,
  style = null,
}) => {
  return (
    <View style={[styles.segmentContainer, style]}>
      {options.map((item, index) => {
        const isSelected = selected === item.key;
        const isFirst = index === 0;
        const isLast = index === options.length - 1;

        return (
          <TouchableOpacity
            key={item.key}
            style={[
              styles.segmentBtn,
              isFirst && styles.segmentFirst,
              isLast && styles.segmentLast,
              isSelected && styles.segmentActive,
            ]}
            onPress={() => onSelect(item.key)}
          >
            {item.icon && (
              <Text style={styles.segmentIcon}>{item.icon}</Text>
            )}
            <Text style={[styles.segmentText, isSelected && styles.segmentTextActive]}>
              {item.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  // Horizontal Filter Tabs
  container: {
    backgroundColor: COLORS.card,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  listContent: {
    paddingHorizontal: SIZES.screenPadding,
  },
  filterBtn: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginRight: 10,
    borderRadius: 20,
    backgroundColor: COLORS.background,
    flexDirection: 'row',
    alignItems: 'center',
  },
  filterBtnActive: {
    backgroundColor: COLORS.primary,
  },
  gradientBtn: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    fontSize: 16,
    marginRight: 6,
  },
  iconActive: {
    marginRight: 6,
  },
  text: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  textActive: {
    color: COLORS.textWhite,
    fontWeight: '600',
  },

  // Vertical Filter Tabs
  verticalContainer: {
    backgroundColor: COLORS.card,
    borderRadius: SIZES.radiusMd,
    padding: 5,
    ...SHADOWS.small,
  },
  verticalBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: SIZES.radiusSm,
    marginBottom: 5,
  },
  verticalBtnActive: {
    backgroundColor: COLORS.primary + '15',
  },
  verticalIcon: {
    fontSize: 18,
    marginRight: 10,
  },
  verticalIconActive: {
    // Même style
  },
  verticalText: {
    flex: 1,
    fontSize: 14,
    color: COLORS.text,
  },
  verticalTextActive: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  countBadge: {
    backgroundColor: COLORS.background,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  countBadgeActive: {
    backgroundColor: COLORS.primary,
  },
  countText: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  countTextActive: {
    color: COLORS.textWhite,
  },

  // Segmented Tabs
  segmentContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.background,
    borderRadius: SIZES.radiusMd,
    padding: 4,
    ...SHADOWS.small,
  },
  segmentBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 15,
  },
  segmentFirst: {
    borderTopLeftRadius: SIZES.radiusMd - 2,
    borderBottomLeftRadius: SIZES.radiusMd - 2,
  },
  segmentLast: {
    borderTopRightRadius: SIZES.radiusMd - 2,
    borderBottomRightRadius: SIZES.radiusMd - 2,
  },
  segmentActive: {
    backgroundColor: COLORS.primary,
    borderRadius: SIZES.radiusMd - 2,
  },
  segmentIcon: {
    fontSize: 14,
    marginRight: 5,
  },
  segmentText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  segmentTextActive: {
    color: COLORS.textWhite,
  },
});

export default FilterTabs;
