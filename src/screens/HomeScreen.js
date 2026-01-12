// ===========================================
// WYDAD AC - HOME SCREEN PROFESSIONAL
// ===========================================

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  Image,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../context/AuthContext';
import { newsAPI, matchesAPI, playersAPI } from '../services/api';
import { COLORS, SIZES, SHADOWS } from '../theme/colors';

const { width } = Dimensions.get('window');

const HomeScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [news, setNews] = useState([]);
  const [nextMatch, setNextMatch] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [newsRes, matchesRes] = await Promise.all([
        newsAPI.getAll({ limit: 10 }),
        matchesAPI.getUpcoming(),
      ]);

      if (newsRes.success) setNews(newsRes.data);
      if (matchesRes.success && matchesRes.data.length > 0) {
        setNextMatch(matchesRes.data[0]);
      }
    } catch (error) {
      console.error('Erreur chargement données:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    });
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getDaysUntilMatch = (dateString) => {
    const matchDate = new Date(dateString);
    const today = new Date();
    const diffTime = matchDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header avec gradient */}
      <LinearGradient
        colors={[COLORS.gradientStart, COLORS.gradientEnd]}
        style={styles.header}
      >
        <View style={styles.headerTop}>
          <View style={styles.headerLeft}>
            <Text style={styles.greeting}>Bienvenue,</Text>
            <Text style={styles.userName}>{user?.name || 'Supporter WAC'}</Text>
          </View>
          <View style={styles.headerRight}>
            <Image
              source={require('../../assets/logo.png')}
              style={styles.logo}
            />
          </View>
        </View>

        {/* Slogan */}
        <View style={styles.sloganContainer}>
          <Text style={styles.slogan}>🔴⚪ DIMA WYDAD 🔴⚪</Text>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />
        }
      >
        {/* Next Match Card - Premium Design */}
        {nextMatch && (
          <TouchableOpacity
            style={styles.matchCardContainer}
            onPress={() => navigation.navigate('Matches')}
            activeOpacity={0.9}
          >
            <LinearGradient
              colors={[COLORS.primaryDark, COLORS.primary]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.matchCard}
            >
              {/* Match countdown */}
              <View style={styles.matchCountdown}>
                <View style={styles.countdownBadge}>
                  <Text style={styles.countdownNumber}>{getDaysUntilMatch(nextMatch.match_date)}</Text>
                  <Text style={styles.countdownLabel}>JOURS</Text>
                </View>
              </View>

              <Text style={styles.matchLabel}>⚡ PROCHAIN MATCH</Text>

              <View style={styles.matchTeams}>
                <View style={styles.teamContainer}>
                  <Image
                    source={{ uri: nextMatch.is_home ? (nextMatch.wac_logo || 'https://upload.wikimedia.org/wikipedia/fr/d/d4/Wydad_Athletic_Club_logo.png') : (nextMatch.opponent_logo || 'https://via.placeholder.com/60') }}
                    style={styles.teamLogoImg}
                  />
                  <Text style={styles.teamName}>
                    {nextMatch.is_home ? 'WYDAD AC' : nextMatch.opponent}
                  </Text>
                </View>

                <View style={styles.vsContainer}>
                  <Text style={styles.vs}>VS</Text>
                </View>

                <View style={styles.teamContainer}>
                  <Image
                    source={{ uri: nextMatch.is_home ? (nextMatch.opponent_logo || 'https://via.placeholder.com/60') : (nextMatch.wac_logo || 'https://upload.wikimedia.org/wikipedia/fr/d/d4/Wydad_Athletic_Club_logo.png') }}
                    style={styles.teamLogoImg}
                  />
                  <Text style={styles.teamName}>
                    {nextMatch.is_home ? nextMatch.opponent : 'WYDAD AC'}
                  </Text>
                </View>
              </View>

              <View style={styles.matchDetails}>
                <View style={styles.matchDetailItem}>
                  <Text style={styles.matchDetailIcon}>📅</Text>
                  <Text style={styles.matchDetailText}>{formatDate(nextMatch.match_date)}</Text>
                </View>
                <View style={styles.matchDetailItem}>
                  <Text style={styles.matchDetailIcon}>⏰</Text>
                  <Text style={styles.matchDetailText}>{formatTime(nextMatch.match_date)}</Text>
                </View>
                <View style={styles.matchDetailItem}>
                  <Text style={styles.matchDetailIcon}>🏟️</Text>
                  <Text style={styles.matchDetailText}>{nextMatch.venue}</Text>
                </View>
              </View>

              <TouchableOpacity
                style={styles.ticketButton}
                onPress={() => navigation.navigate('Tickets', { match: nextMatch })}
              >
                <Text style={styles.ticketButtonText}>🎟️ RÉSERVER MES TICKETS</Text>
              </TouchableOpacity>
            </LinearGradient>
          </TouchableOpacity>
        )}

        {/* Quick Actions - Modern Grid */}
        <View style={styles.quickActionsSection}>
          <Text style={styles.sectionTitle}>🎯 Accès rapide</Text>
          <View style={styles.quickActionsGrid}>
            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => navigation.navigate('Players')}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={[COLORS.primary, COLORS.primaryDark]}
                style={styles.actionCardGradient}
              >
                <Text style={styles.actionIcon}>⚽</Text>
              </LinearGradient>
              <Text style={styles.actionText}>Effectif</Text>
              <Text style={styles.actionSubtext}>Joueurs WAC</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => navigation.navigate('Matches')}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#4CAF50', '#388E3C']}
                style={styles.actionCardGradient}
              >
                <Text style={styles.actionIcon}>🏟️</Text>
              </LinearGradient>
              <Text style={styles.actionText}>Calendrier</Text>
              <Text style={styles.actionSubtext}>Tous les matchs</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => navigation.getParent()?.navigate('Shop')}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#FF9800', '#F57C00']}
                style={styles.actionCardGradient}
              >
                <Text style={styles.actionIcon}>🛍️</Text>
              </LinearGradient>
              <Text style={styles.actionText}>Boutique</Text>
              <Text style={styles.actionSubtext}>Maillots & +</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => navigation.getParent()?.navigate('Stores')}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#2196F3', '#1976D2']}
                style={styles.actionCardGradient}
              >
                <Text style={styles.actionIcon}>📍</Text>
              </LinearGradient>
              <Text style={styles.actionText}>Magasins</Text>
              <Text style={styles.actionSubtext}>Près de vous</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* News Section - Modern Cards */}
        <View style={styles.newsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>📰 Actualités</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllBtn}>Voir tout →</Text>
            </TouchableOpacity>
          </View>

          {news.length > 0 ? (
            news.map((item, index) => (
              <TouchableOpacity
                key={item.id}
                style={[styles.newsCard, index === 0 && styles.featuredNews]}
                onPress={() => navigation.navigate('NewsDetail', { newsId: item.id })}
                activeOpacity={0.9}
              >
                {item.image ? (
                  <Image
                    source={{ uri: item.image }}
                    style={index === 0 ? styles.featuredNewsImage : styles.newsImage}
                  />
                ) : (
                  <View style={[index === 0 ? styles.featuredNewsImage : styles.newsImage, styles.newsImagePlaceholder]}>
                    <Text style={styles.newsImagePlaceholderText}>📰</Text>
                  </View>
                )}

                {index === 0 ? (
                  <LinearGradient
                    colors={['transparent', 'rgba(0,0,0,0.8)']}
                    style={styles.featuredNewsOverlay}
                  >
                    <View style={styles.newsCategoryBadge}>
                      <Text style={styles.newsCategoryText}>
                        {item.category?.toUpperCase() || 'NEWS'}
                      </Text>
                    </View>
                    <Text style={styles.featuredNewsTitle}>{item.title}</Text>
                    <Text style={styles.featuredNewsSummary} numberOfLines={2}>
                      {item.summary}
                    </Text>
                  </LinearGradient>
                ) : (
                  <View style={styles.newsContent}>
                    <View style={styles.newsCategoryBadgeSmall}>
                      <Text style={styles.newsCategoryTextSmall}>
                        {item.category?.toUpperCase() || 'NEWS'}
                      </Text>
                    </View>
                    <Text style={styles.newsTitle} numberOfLines={2}>{item.title}</Text>
                    <Text style={styles.newsSummary} numberOfLines={2}>{item.summary}</Text>
                  </View>
                )}
              </TouchableOpacity>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>📰</Text>
              <Text style={styles.emptyText}>Aucune actualité disponible</Text>
            </View>
          )}
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>🔴⚪ Wydad Athletic Club 🔴⚪</Text>
          <Text style={styles.footerSubtext}>Champions du Maroc</Text>
        </View>

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
  // Header
  header: {
    paddingTop: 10,
    paddingBottom: 20,
    paddingHorizontal: SIZES.screenPadding,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flex: 1,
  },
  headerRight: {
    marginLeft: 15,
  },
  greeting: {
    fontSize: 14,
    color: COLORS.textWhite,
    opacity: 0.8,
  },
  userName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.textWhite,
  },
  logo: {
    width: 55,
    height: 55,
    borderRadius: 27.5,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  sloganContainer: {
    marginTop: 15,
    alignItems: 'center',
  },
  slogan: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.textWhite,
    letterSpacing: 2,
  },
  scrollView: {
    flex: 1,
  },
  // Match Card
  matchCardContainer: {
    padding: SIZES.screenPadding,
    marginTop: -5,
  },
  matchCard: {
    borderRadius: 20,
    padding: 20,
    ...SHADOWS.large,
    position: 'relative',
    overflow: 'hidden',
  },
  matchCountdown: {
    position: 'absolute',
    top: 15,
    right: 15,
  },
  countdownBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    alignItems: 'center',
  },
  countdownNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.textWhite,
  },
  countdownLabel: {
    fontSize: 8,
    color: COLORS.textWhite,
    opacity: 0.8,
  },
  matchLabel: {
    color: COLORS.textWhite,
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 15,
    letterSpacing: 1,
  },
  matchTeams: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginVertical: 15,
  },
  teamContainer: {
    alignItems: 'center',
    flex: 1,
  },
  teamLogoImg: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.textWhite,
    marginBottom: 8,
    resizeMode: 'contain',
  },
  teamLogoText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  teamName: {
    color: COLORS.textWhite,
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  vsContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  vs: {
    color: COLORS.textWhite,
    fontSize: 14,
    fontWeight: 'bold',
  },
  matchDetails: {
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: 12,
    padding: 12,
    marginTop: 10,
  },
  matchDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  matchDetailIcon: {
    fontSize: 14,
    marginRight: 8,
  },
  matchDetailText: {
    color: COLORS.textWhite,
    fontSize: 13,
    opacity: 0.9,
  },
  ticketButton: {
    backgroundColor: COLORS.textWhite,
    borderRadius: 12,
    paddingVertical: 14,
    marginTop: 15,
    alignItems: 'center',
    ...SHADOWS.medium,
  },
  ticketButtonText: {
    color: COLORS.primary,
    fontWeight: 'bold',
    fontSize: 14,
    letterSpacing: 0.5,
  },
  // Quick Actions
  quickActionsSection: {
    paddingHorizontal: SIZES.screenPadding,
    marginTop: 5,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionCard: {
    width: (width - 48) / 4,
    alignItems: 'center',
    marginBottom: 15,
  },
  actionCardGradient: {
    width: 52,
    height: 52,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    ...SHADOWS.small,
  },
  actionIcon: {
    fontSize: 24,
  },
  actionText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.text,
  },
  actionSubtext: {
    fontSize: 9,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  // Section
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 15,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  seeAllBtn: {
    fontSize: 13,
    color: COLORS.primary,
    fontWeight: '600',
    marginBottom: 15,
  },
  // News
  newsSection: {
    paddingHorizontal: SIZES.screenPadding,
    marginTop: 10,
  },
  newsCard: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    marginBottom: 12,
    overflow: 'hidden',
    ...SHADOWS.medium,
  },
  featuredNews: {
    marginBottom: 15,
  },
  featuredNewsImage: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  newsImage: {
    width: '100%',
    height: 120,
    resizeMode: 'cover',
  },
  newsImagePlaceholder: {
    backgroundColor: COLORS.borderLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  newsImagePlaceholderText: {
    fontSize: 40,
    opacity: 0.5,
  },
  featuredNewsOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
  },
  newsCategoryBadge: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  newsCategoryText: {
    color: COLORS.textWhite,
    fontSize: 10,
    fontWeight: 'bold',
  },
  newsCategoryBadgeSmall: {
    backgroundColor: COLORS.primary + '15',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  newsCategoryTextSmall: {
    color: COLORS.primary,
    fontSize: 9,
    fontWeight: 'bold',
  },
  featuredNewsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.textWhite,
    marginBottom: 6,
  },
  featuredNewsSummary: {
    fontSize: 13,
    color: COLORS.textWhite,
    opacity: 0.9,
    lineHeight: 18,
  },
  newsContent: {
    padding: 14,
  },
  newsTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 6,
  },
  newsSummary: {
    fontSize: 12,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  // Empty State
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
    backgroundColor: COLORS.card,
    borderRadius: 16,
  },
  emptyIcon: {
    fontSize: 50,
    marginBottom: 10,
    opacity: 0.5,
  },
  emptyText: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  // Footer
  footer: {
    alignItems: 'center',
    paddingVertical: 25,
    marginTop: 15,
  },
  footerText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  footerSubtext: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
});

export default HomeScreen;
