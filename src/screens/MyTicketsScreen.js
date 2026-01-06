// ===========================================
// WYDAD AC - MY TICKETS SCREEN
// ===========================================

import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AuthContext } from '../context/AuthContext';
import { ticketsAPI } from '../services/api';
import { COLORS, SIZES, SHADOWS } from '../theme/colors';

const MyTicketsScreen = ({ navigation }) => {
  const { user } = useContext(AuthContext);
  const [tickets, setTickets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (user) {
      loadMyTickets();
    }
  }, [user]);

  const loadMyTickets = async () => {
    try {
      const response = await ticketsAPI.getMine();
      if (response.success) {
        setTickets(response.data);
      }
    } catch (error) {
      console.error('Erreur chargement billets:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadMyTickets();
    setRefreshing(false);
  };

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

  const handleDownloadTicket = async (ticketId) => {
    try {
      // In a real app, this would download the PDF
      Alert.alert(
        'Téléchargement',
        'Le téléchargement du billet PDF sera disponible dans une prochaine version.',
        [{ text: 'OK' }]
      );
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de télécharger le billet');
    }
  };

  const getCategoryInfo = (category) => {
    const categories = {
      tribune: { label: 'Tribune', icon: '🎫', color: COLORS.success },
      gradins: { label: 'Gradins', icon: '🏟️', color: COLORS.primary },
      vip: { label: 'VIP', icon: '⭐', color: '#FFD700' },
    };
    return categories[category] || categories.tribune;
  };

  const renderTicket = ({ item }) => {
    const upcoming = isUpcoming(item.match_date);
    const categoryInfo = getCategoryInfo(item.category);

    return (
      <View style={[styles.ticketCard, !upcoming && styles.pastTicket]}>
        {/* Status Badge */}
        <View style={[styles.statusBadge, upcoming ? styles.upcomingBadge : styles.pastBadge]}>
          <Text style={styles.statusText}>
            {upcoming ? '🎟️ Valide' : '✓ Utilisé'}
          </Text>
        </View>

        {/* Ticket Header */}
        <View style={styles.ticketHeader}>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryIcon}>{categoryInfo.icon}</Text>
            <Text style={styles.categoryLabel}>{categoryInfo.label}</Text>
          </View>
          <Text style={styles.ticketPrice}>{item.price} MAD</Text>
        </View>

        {/* Match Info */}
        <View style={styles.matchInfo}>
          <Text style={styles.matchTeams}>
            {item.home_team} vs {item.away_team}
          </Text>
          <Text style={styles.competition}>{item.competition}</Text>
        </View>

        {/* Date & Location */}
        <View style={styles.detailsRow}>
          <View style={styles.detailItem}>
            <Text style={styles.detailIcon}>📅</Text>
            <Text style={styles.detailText}>{formatDate(item.match_date)}</Text>
          </View>
          <View style={styles.detailItem}>
            <Text style={styles.detailIcon}>🕐</Text>
            <Text style={styles.detailText}>{formatTime(item.match_date)}</Text>
          </View>
        </View>

        <View style={styles.stadiumRow}>
          <Text style={styles.detailIcon}>📍</Text>
          <Text style={styles.stadiumText}>{item.stadium}</Text>
        </View>

        {/* Ticket Reference */}
        <View style={styles.referenceRow}>
          <Text style={styles.referenceLabel}>Référence:</Text>
          <Text style={styles.referenceValue}>#{item.id.toString().padStart(6, '0')}</Text>
        </View>

        {/* Actions */}
        {upcoming && (
          <View style={styles.actionsRow}>
            <TouchableOpacity
              style={styles.actionBtn}
              onPress={() => handleDownloadTicket(item.id)}
            >
              <Text style={styles.actionIcon}>📥</Text>
              <Text style={styles.actionText}>Télécharger</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionBtn, styles.qrBtn]}
            >
              <Text style={styles.actionIcon}>🔲</Text>
              <Text style={styles.actionText}>QR Code</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backButton}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Mes Billets</Text>
          <View style={{ width: 30 }} />
        </View>

        <View style={styles.notLoggedContainer}>
          <Text style={styles.notLoggedIcon}>🎟️</Text>
          <Text style={styles.notLoggedText}>Connectez-vous pour voir vos billets</Text>
          <TouchableOpacity
            style={styles.loginBtn}
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={styles.loginBtnText}>Se connecter</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mes Billets</Text>
        <View style={{ width: 30 }} />
      </View>

      <FlatList
        data={tickets}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderTicket}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />
        }
        ListHeaderComponent={
          tickets.length > 0 && (
            <Text style={styles.ticketCount}>
              {tickets.length} billet(s)
            </Text>
          )
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>🎟️</Text>
            <Text style={styles.emptyTitle}>Aucun billet</Text>
            <Text style={styles.emptySubtitle}>Réservez vos places pour les prochains matchs</Text>
            <TouchableOpacity
              style={styles.buyBtn}
              onPress={() => navigation.navigate('Tickets')}
            >
              <Text style={styles.buyBtnText}>Acheter des billets</Text>
            </TouchableOpacity>
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
  list: {
    padding: SIZES.screenPadding,
  },
  ticketCount: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 15,
  },
  ticketCard: {
    backgroundColor: COLORS.card,
    borderRadius: SIZES.radiusMd,
    padding: 20,
    marginBottom: 15,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
    ...SHADOWS.small,
  },
  pastTicket: {
    opacity: 0.7,
    borderLeftColor: COLORS.textSecondary,
  },
  statusBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  upcomingBadge: {
    backgroundColor: COLORS.success + '20',
  },
  pastBadge: {
    backgroundColor: COLORS.textSecondary + '20',
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.text,
  },
  ticketHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  categoryIcon: {
    fontSize: 16,
    marginRight: 5,
  },
  categoryLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.text,
  },
  ticketPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  matchInfo: {
    marginBottom: 15,
  },
  matchTeams: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 5,
  },
  competition: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailIcon: {
    fontSize: 14,
    marginRight: 8,
  },
  detailText: {
    fontSize: 13,
    color: COLORS.text,
  },
  stadiumRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  stadiumText: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  referenceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    marginBottom: 15,
  },
  referenceLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  referenceValue: {
    fontSize: 12,
    fontWeight: 'bold',
    color: COLORS.text,
    fontFamily: 'monospace',
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: SIZES.radiusSm,
    backgroundColor: COLORS.background,
  },
  qrBtn: {
    backgroundColor: COLORS.primary,
  },
  actionIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  actionText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 50,
  },
  emptyIcon: {
    fontSize: 60,
    marginBottom: 15,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 5,
  },
  emptySubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 20,
    textAlign: 'center',
  },
  buyBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: SIZES.radiusMd,
  },
  buyBtnText: {
    color: COLORS.textWhite,
    fontWeight: 'bold',
  },
  notLoggedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SIZES.screenPadding,
  },
  notLoggedIcon: {
    fontSize: 60,
    marginBottom: 15,
  },
  notLoggedText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginBottom: 20,
  },
  loginBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: SIZES.radiusMd,
  },
  loginBtnText: {
    color: COLORS.textWhite,
    fontWeight: 'bold',
  },
});

export default MyTicketsScreen;
