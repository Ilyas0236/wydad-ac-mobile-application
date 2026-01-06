// ===========================================
// WYDAD AC - PLAYERS SCREEN
// ===========================================

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { playersAPI } from '../services/api';
import { COLORS, SIZES, SHADOWS } from '../theme/colors';

const POSITIONS = {
  goalkeeper: { label: 'Gardiens', icon: '🧤' },
  defender: { label: 'Défenseurs', icon: '🛡️' },
  midfielder: { label: 'Milieux', icon: '⚙️' },
  forward: { label: 'Attaquants', icon: '⚽' },
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

  const renderPlayer = ({ item }) => (
    <TouchableOpacity 
      style={styles.playerCard}
      onPress={() => navigation.navigate('PlayerDetail', { playerId: item.id })}
    >
      <View style={styles.playerNumber}>
        <Text style={styles.numberText}>{item.number}</Text>
      </View>
      <View style={styles.playerInfo}>
        <Text style={styles.playerName}>{item.name}</Text>
        <Text style={styles.playerPosition}>
          {POSITIONS[item.position]?.icon} {POSITIONS[item.position]?.label}
        </Text>
        <Text style={styles.playerNationality}>🌍 {item.nationality}</Text>
      </View>
      {item.goals > 0 && (
        <View style={styles.statsContainer}>
          <Text style={styles.statsText}>⚽ {item.goals}</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Effectif WAC</Text>
        <View style={{ width: 30 }} />
      </View>

      {/* Filters */}
      <View style={styles.filters}>
        <TouchableOpacity
          style={[styles.filterBtn, !selectedPosition && styles.filterBtnActive]}
          onPress={() => setSelectedPosition(null)}
        >
          <Text style={[styles.filterText, !selectedPosition && styles.filterTextActive]}>
            Tous
          </Text>
        </TouchableOpacity>
        {Object.entries(POSITIONS).map(([key, value]) => (
          <TouchableOpacity
            key={key}
            style={[styles.filterBtn, selectedPosition === key && styles.filterBtnActive]}
            onPress={() => setSelectedPosition(key)}
          >
            <Text style={[styles.filterText, selectedPosition === key && styles.filterTextActive]}>
              {value.icon}
            </Text>
          </TouchableOpacity>
        ))}
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
          <Text style={styles.emptyText}>Aucun joueur trouvé</Text>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SIZES.screenPadding,
    backgroundColor: COLORS.primary,
  },
  backButton: {
    color: COLORS.textWhite,
    fontSize: 24,
  },
  headerTitle: {
    color: COLORS.textWhite,
    fontSize: 18,
    fontWeight: 'bold',
  },
  filters: {
    flexDirection: 'row',
    padding: SIZES.sm,
    backgroundColor: COLORS.card,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  filterBtn: {
    flex: 1,
    padding: 10,
    alignItems: 'center',
    borderRadius: SIZES.radiusMd,
    marginHorizontal: 2,
  },
  filterBtnActive: {
    backgroundColor: COLORS.primary,
  },
  filterText: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  filterTextActive: {
    color: COLORS.textWhite,
    fontWeight: 'bold',
  },
  list: {
    padding: SIZES.screenPadding,
  },
  playerCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.card,
    borderRadius: SIZES.radiusMd,
    padding: 15,
    marginBottom: 10,
    alignItems: 'center',
    ...SHADOWS.small,
  },
  playerNumber: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  numberText: {
    color: COLORS.textWhite,
    fontSize: 18,
    fontWeight: 'bold',
  },
  playerInfo: {
    flex: 1,
  },
  playerName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  playerPosition: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  playerNationality: {
    fontSize: 12,
    color: COLORS.textLight,
    marginTop: 2,
  },
  statsContainer: {
    backgroundColor: COLORS.background,
    padding: 8,
    borderRadius: SIZES.radiusMd,
  },
  statsText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  emptyText: {
    textAlign: 'center',
    color: COLORS.textSecondary,
    marginTop: 50,
  },
});

export default PlayersScreen;
