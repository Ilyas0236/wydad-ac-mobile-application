// ===========================================
// WYDAD AC - MATCHES SCREEN
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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { matchesAPI } from '../services/api';
import { COLORS, SIZES, SHADOWS } from '../theme/colors';

const MatchesScreen = ({ navigation }) => {
  const [matches, setMatches] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('all'); // all, upcoming, past

  useEffect(() => {
    loadMatches();
  }, []);

  const loadMatches = async () => {
    try {
      const response = await matchesAPI.getAll();
      if (response.success) {
        setMatches(response.data);
      }
    } catch (error) {
      console.error('Erreur chargement matchs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadMatches();
    setRefreshing(false);
  };

  const filteredMatches = matches.filter((match) => {
    if (filter === 'all') return true;
    const matchDate = new Date(match.match_date);
    const now = new Date();
    if (filter === 'upcoming') return matchDate > now;
    if (filter === 'past') return matchDate < now;
    return true;
  });

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const isUpcoming = (dateString) => {
    return new Date(dateString) > new Date();
  };

  const renderMatch = ({ item }) => {
    const upcoming = isUpcoming(item.match_date);
    const homeTeam = item.is_home ? 'WAC' : item.opponent;
    const awayTeam = item.is_home ? item.opponent : 'WAC';
    const homeScore = item.is_home ? item.score_wac : item.score_opponent;
    const awayScore = item.is_home ? item.score_opponent : item.score_wac;

    return (
      <View style={styles.matchCard}>
        {/* Competition Badge */}
        <View style={styles.competitionBadge}>
          <Text style={styles.competitionText}>{item.competition}</Text>
        </View>

        {/* Date & Time */}
        <View style={styles.dateRow}>
          <Text style={styles.dateText}>{formatDate(item.match_date)}</Text>
          <Text style={styles.timeText}>{formatTime(item.match_date)}</Text>
        </View>

        {/* Teams */}
        <View style={styles.teamsContainer}>
          <View style={styles.teamBox}>
            <Image
              source={{ uri: item.is_home ? (item.wac_logo || 'https://upload.wikimedia.org/wikipedia/fr/d/d4/Wydad_Athletic_Club_logo.png') : (item.opponent_logo || 'https://via.placeholder.com/50') }}
              style={styles.teamLogoImg}
            />
            <Text style={styles.teamName} numberOfLines={2}>{homeTeam}</Text>
          </View>

          <View style={styles.scoreBox}>
            {upcoming ? (
              <Text style={styles.vsText}>VS</Text>
            ) : (
              <View style={styles.scoreContainer}>
                <Text style={styles.scoreText}>{homeScore}</Text>
                <Text style={styles.scoreSeparator}>-</Text>
                <Text style={styles.scoreText}>{awayScore}</Text>
              </View>
            )}
            {upcoming && item.available_seats > 0 && (
              <TouchableOpacity
                style={styles.ticketBtn}
                onPress={() => navigation.navigate('Tickets', { screen: 'TicketsList', params: { matchId: item.id } })}
              >
                <Text style={styles.ticketBtnText}>🎟️ Billets</Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.teamBox}>
            <Image
              source={{ uri: item.is_home ? (item.opponent_logo || 'https://via.placeholder.com/50') : (item.wac_logo || 'https://upload.wikimedia.org/wikipedia/fr/d/d4/Wydad_Athletic_Club_logo.png') }}
              style={styles.teamLogoImg}
            />
            <Text style={styles.teamName} numberOfLines={2}>{awayTeam}</Text>
          </View>
        </View>

        {/* Stadium */}
        <View style={styles.stadiumRow}>
          <Text style={styles.stadiumText}>📍 {item.venue}</Text>
        </View>

        {/* Status Badge */}
        <View style={[styles.statusBadge, upcoming ? styles.statusUpcoming : styles.statusPast]}>
          <Text style={styles.statusText}>{upcoming ? 'À venir' : 'Terminé'}</Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Matchs WAC</Text>
        <View style={{ width: 30 }} />
      </View>

      {/* Filters */}
      <View style={styles.filters}>
        <TouchableOpacity
          style={[styles.filterBtn, filter === 'all' && styles.filterBtnActive]}
          onPress={() => setFilter('all')}
        >
          <Text style={[styles.filterText, filter === 'all' && styles.filterTextActive]}>
            Tous
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterBtn, filter === 'upcoming' && styles.filterBtnActive]}
          onPress={() => setFilter('upcoming')}
        >
          <Text style={[styles.filterText, filter === 'upcoming' && styles.filterTextActive]}>
            À venir
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterBtn, filter === 'past' && styles.filterBtnActive]}
          onPress={() => setFilter('past')}
        >
          <Text style={[styles.filterText, filter === 'past' && styles.filterTextActive]}>
            Passés
          </Text>
        </TouchableOpacity>
      </View>

      {/* Matches List */}
      <FlatList
        data={filteredMatches}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderMatch}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />
        }
        ListEmptyComponent={
          <Text style={styles.emptyText}>Aucun match trouvé</Text>
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
    padding: 12,
    alignItems: 'center',
    borderRadius: SIZES.radiusMd,
    marginHorizontal: 5,
  },
  filterBtnActive: {
    backgroundColor: COLORS.primary,
  },
  filterText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  filterTextActive: {
    color: COLORS.textWhite,
    fontWeight: 'bold',
  },
  list: {
    padding: SIZES.screenPadding,
  },
  matchCard: {
    backgroundColor: COLORS.card,
    borderRadius: SIZES.radiusMd,
    padding: 15,
    marginBottom: 15,
    ...SHADOWS.small,
  },
  competitionBadge: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.primary + '20',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    marginBottom: 10,
  },
  competitionText: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: '600',
  },
  dateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  dateText: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  timeText: {
    fontSize: 13,
    color: COLORS.text,
    fontWeight: '600',
  },
  teamsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  teamBox: {
    flex: 1,
    alignItems: 'center',
  },
  teamLogoImg: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.textWhite,
    marginBottom: 8,
    resizeMode: 'contain',
  },
  teamLogoText: {
    color: COLORS.textWhite,
    fontSize: 12,
    fontWeight: 'bold',
  },
  teamName: {
    fontSize: 12,
    color: COLORS.text,
    textAlign: 'center',
    fontWeight: '500',
  },
  scoreBox: {
    flex: 1,
    alignItems: 'center',
  },
  vsText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.textSecondary,
  },
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  scoreText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  scoreSeparator: {
    fontSize: 20,
    color: COLORS.textSecondary,
    marginHorizontal: 8,
  },
  ticketBtn: {
    backgroundColor: COLORS.success,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    marginTop: 10,
  },
  ticketBtnText: {
    color: COLORS.textWhite,
    fontSize: 12,
    fontWeight: 'bold',
  },
  stadiumRow: {
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: 12,
  },
  stadiumText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  statusBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  statusUpcoming: {
    backgroundColor: COLORS.success + '20',
  },
  statusPast: {
    backgroundColor: COLORS.textSecondary + '20',
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.text,
  },
  emptyText: {
    textAlign: 'center',
    color: COLORS.textSecondary,
    marginTop: 50,
    fontSize: 16,
  },
});

export default MatchesScreen;
