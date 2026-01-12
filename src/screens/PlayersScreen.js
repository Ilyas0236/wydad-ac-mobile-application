// ===========================================
// WYDAD AC - PLAYERS SCREEN PROFESSIONAL
// ===========================================

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  Image,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { playersAPI } from '../services/api';
import { COLORS, SIZES, SHADOWS } from '../theme/colors';

const { width } = Dimensions.get('window');

const POSITIONS = {
  goalkeeper: { label: 'Gardiens', icon: '🧤', color: '#FFC107' },
  defender: { label: 'Défenseurs', icon: '🛡️', color: '#2196F3' },
  midfielder: { label: 'Milieux', icon: '⚙️', color: '#4CAF50' },
  forward: { label: 'Attaquants', icon: '⚽', color: '#F44336' },
};

const PlayersScreen = ({ navigation }) => {
  const [players, setPlayers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState(null);

  useEffect(() => {
    loadPlayers();
  }, []);

  const loadPlayers = async () => {
    try {
      const response = await playersAPI.getAll();
      if (response.success) {
        setPlayers(response.data);
      }
    } catch (error) {
      console.error('Erreur chargement joueurs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadPlayers();
    setRefreshing(false);
  };

  const filteredPlayers = selectedPosition
    ? players.filter(p => p.position === selectedPosition)
    : players;

  const renderPlayer = ({ item, index }) => {
    const positionInfo = POSITIONS[item.position] || { label: 'Joueur', icon: '⚽', color: COLORS.primary };
    
    return (
      <TouchableOpacity 
        style={styles.playerCard}
        onPress={() => navigation.navigate('PlayerDetail', { playerId: item.id })}
        activeOpacity={0.9}
      >
        {/* Player Photo/Number */}
        <View style={styles.playerImageContainer}>
          {item.image ? (
            <Image source={{ uri: item.image }} style={styles.playerImage} />
          ) : (
            <LinearGradient
              colors={[COLORS.primary, COLORS.primaryDark]}
              style={styles.playerNumber}
            >
              <Text style={styles.numberText}>{item.number || '#'}</Text>
            </LinearGradient>
          )}
          {/* Position Badge */}
          <View style={[styles.positionBadge, { backgroundColor: positionInfo.color }]}>
            <Text style={styles.positionBadgeText}>{positionInfo.icon}</Text>
          </View>
        </View>
        
        {/* Player Info */}
        <View style={styles.playerInfo}>
          <Text style={styles.playerName}>{item.name}</Text>
          <View style={styles.playerMeta}>
            <Text style={styles.playerPosition}>{positionInfo.label}</Text>
            <Text style={styles.playerDot}>•</Text>
            <Text style={styles.playerNationality}>{item.nationality}</Text>
          </View>
          
          {/* Stats Row */}
          <View style={styles.statsRow}>
            {item.goals > 0 && (
              <View style={styles.statItem}>
                <Text style={styles.statIcon}>⚽</Text>
                <Text style={styles.statValue}>{item.goals}</Text>
              </View>
            )}
            {item.assists > 0 && (
              <View style={styles.statItem}>
                <Text style={styles.statIcon}>🎯</Text>
                <Text style={styles.statValue}>{item.assists}</Text>
              </View>
            )}
            {item.appearances > 0 && (
              <View style={styles.statItem}>
                <Text style={styles.statIcon}>👕</Text>
                <Text style={styles.statValue}>{item.appearances}</Text>
              </View>
            )}
          </View>
        </View>
        
        {/* Arrow */}
        <View style={styles.arrowContainer}>
          <Text style={styles.arrow}>›</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header avec gradient */}
      <LinearGradient
        colors={[COLORS.gradientStart, COLORS.gradientEnd]}
        style={styles.header}
      >
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backBtnText}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>⚽ Effectif WAC</Text>
          <Text style={styles.headerSubtitle}>{filteredPlayers.length} joueurs</Text>
        </View>
        <View style={{ width: 40 }} />
      </LinearGradient>

      {/* Position Filters */}
      <View style={styles.filtersContainer}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={[{ key: null, label: 'Tous', icon: '👥' }, ...Object.entries(POSITIONS).map(([key, val]) => ({ key, ...val }))]}
          keyExtractor={(item) => item.key || 'all'}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.filterBtn,
                selectedPosition === item.key && styles.filterBtnActive
              ]}
              onPress={() => setSelectedPosition(item.key)}
              activeOpacity={0.8}
            >
              {selectedPosition === item.key ? (
                <LinearGradient
                  colors={[COLORS.primary, COLORS.primaryDark]}
                  style={styles.filterBtnGradient}
                >
                  <Text style={styles.filterIcon}>{item.icon}</Text>
                  <Text style={[styles.filterText, styles.filterTextActive]}>
                    {item.label}
                  </Text>
                </LinearGradient>
              ) : (
                <View style={styles.filterBtnInner}>
                  <Text style={styles.filterIcon}>{item.icon}</Text>
                  <Text style={styles.filterText}>{item.label}</Text>
                </View>
              )}
            </TouchableOpacity>
          )}
          contentContainerStyle={styles.filtersList}
        />
      </View>

      {/* Players List */}
      <FlatList
        data={filteredPlayers}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderPlayer}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>⚽</Text>
            <Text style={styles.emptyTitle}>Aucun joueur trouvé</Text>
            <Text style={styles.emptyText}>Aucun joueur dans cette catégorie</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SIZES.screenPadding,
    paddingVertical: 15,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backBtnText: {
    color: COLORS.textWhite,
    fontSize: 22,
  },
  headerCenter: {
    flex: 1,
    marginHorizontal: 15,
  },
  headerTitle: {
    color: COLORS.textWhite,
    fontSize: 20,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    color: COLORS.textWhite,
    fontSize: 12,
    opacity: 0.8,
    marginTop: 2,
  },
  // Filters
  filtersContainer: {
    backgroundColor: COLORS.background,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  filtersList: {
    paddingHorizontal: SIZES.screenPadding,
    paddingVertical: 12,
  },
  filterBtn: {
    marginRight: 10,
    borderRadius: 25,
    overflow: 'hidden',
  },
  filterBtnActive: {},
  filterBtnGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  filterBtnInner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: COLORS.card,
    borderRadius: 25,
    ...SHADOWS.small,
  },
  filterIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  filterText: {
    fontSize: 13,
    color: COLORS.text,
    fontWeight: '600',
  },
  filterTextActive: {
    color: COLORS.textWhite,
  },
  // List
  list: {
    paddingHorizontal: SIZES.screenPadding,
    paddingTop: 15,
    paddingBottom: 20,
  },
  // Player Card
  playerCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
    ...SHADOWS.medium,
  },
  playerImageContainer: {
    position: 'relative',
    marginRight: 15,
  },
  playerImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 3,
    borderColor: COLORS.primary,
  },
  playerNumber: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  numberText: {
    color: COLORS.textWhite,
    fontSize: 22,
    fontWeight: 'bold',
  },
  positionBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.card,
  },
  positionBadgeText: {
    fontSize: 12,
  },
  playerInfo: {
    flex: 1,
  },
  playerName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 4,
  },
  playerMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  playerPosition: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '600',
  },
  playerDot: {
    fontSize: 12,
    color: COLORS.textLight,
    marginHorizontal: 6,
  },
  playerNationality: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    marginRight: 8,
  },
  statIcon: {
    fontSize: 12,
    marginRight: 4,
  },
  statValue: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.text,
  },
  arrowContainer: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  arrow: {
    fontSize: 20,
    color: COLORS.textSecondary,
  },
  // Empty State
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
    fontSize: 60,
    marginBottom: 15,
    opacity: 0.5,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
});

export default PlayersScreen;
