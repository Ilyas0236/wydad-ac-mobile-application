// ===========================================
// WYDAD AC - PLAYER DETAIL SCREEN
// ===========================================

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { playersAPI } from '../services/api';
import { COLORS, SIZES, SHADOWS } from '../theme/colors';

const POSITIONS = {
  goalkeeper: { label: 'Gardien', icon: '🧤' },
  defender: { label: 'Défenseur', icon: '🛡️' },
  midfielder: { label: 'Milieu', icon: '⚙️' },
  forward: { label: 'Attaquant', icon: '⚽' },
};

const PlayerDetailScreen = ({ route, navigation }) => {
  const { playerId } = route.params;
  const [player, setPlayer] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadPlayer();
  }, []);

  const loadPlayer = async () => {
    try {
      const response = await playersAPI.getOne(playerId);
      if (response.success) {
        setPlayer(response.data);
      }
    } catch (error) {
      console.error('Erreur chargement joueur:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (!player) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Joueur non trouvé</Text>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backBtnText}>Retour</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Fiche Joueur</Text>
        <View style={{ width: 30 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Player Hero */}
        <View style={styles.heroSection}>
          {player.image ? (
            <Image source={{ uri: player.image }} style={styles.playerImage} />
          ) : (
            <View style={styles.numberBadge}>
              <Text style={styles.numberBadgeText}>{player.number}</Text>
            </View>
          )}
          <Text style={styles.playerName}>{player.name}</Text>
          <Text style={styles.positionText}>
            {POSITIONS[player.position]?.icon} {POSITIONS[player.position]?.label}
          </Text>
        </View>

        {/* Player Info */}
        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>Informations</Text>
          
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>🌍 Nationalité</Text>
              <Text style={styles.infoValue}>{player.nationality}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>📅 Date de naissance</Text>
              <Text style={styles.infoValue}>{player.birth_date || 'Non disponible'}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>📏 Taille</Text>
              <Text style={styles.infoValue}>{player.height ? `${player.height} cm` : 'Non disponible'}</Text>
            </View>
          </View>
        </View>

        {/* Statistics */}
        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>Statistiques</Text>
          
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{player.matches || 0}</Text>
              <Text style={styles.statLabel}>Matchs</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{player.goals || 0}</Text>
              <Text style={styles.statLabel}>Buts</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{player.assists || 0}</Text>
              <Text style={styles.statLabel}>Passes D.</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{player.yellow_cards || 0}</Text>
              <Text style={styles.statLabel}>Cartons J.</Text>
            </View>
          </View>
        </View>

        {/* Biography */}
        {player.biography && (
          <View style={styles.bioSection}>
            <Text style={styles.sectionTitle}>Biographie</Text>
            <View style={styles.bioCard}>
              <Text style={styles.bioText}>{player.biography}</Text>
            </View>
          </View>
        )}

        <View style={{ height: 30 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  errorText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginBottom: 20,
  },
  backBtn: {
    backgroundColor: COLORS.primary,
    padding: 15,
    borderRadius: SIZES.radiusMd,
  },
  backBtnText: {
    color: COLORS.textWhite,
    fontWeight: 'bold',
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
  heroSection: {
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    paddingVertical: 30,
    paddingBottom: 40,
  },
  playerImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 15,
    borderWidth: 3,
    borderColor: COLORS.card,
  },
  numberBadge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.card,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
    ...SHADOWS.medium,
  },
  numberBadgeText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  playerName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.textWhite,
    textAlign: 'center',
  },
  positionText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 5,
  },
  infoSection: {
    padding: SIZES.screenPadding,
    marginTop: -20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 15,
  },
  infoCard: {
    backgroundColor: COLORS.card,
    borderRadius: SIZES.radiusMd,
    padding: 15,
    ...SHADOWS.small,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  infoLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  statsSection: {
    padding: SIZES.screenPadding,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    width: '48%',
    backgroundColor: COLORS.card,
    borderRadius: SIZES.radiusMd,
    padding: 20,
    alignItems: 'center',
    marginBottom: 10,
    ...SHADOWS.small,
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  statLabel: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 5,
  },
  bioSection: {
    padding: SIZES.screenPadding,
  },
  bioCard: {
    backgroundColor: COLORS.card,
    borderRadius: SIZES.radiusMd,
    padding: 15,
    ...SHADOWS.small,
  },
  bioText: {
    fontSize: 14,
    color: COLORS.text,
    lineHeight: 22,
  },
});

export default PlayerDetailScreen;
