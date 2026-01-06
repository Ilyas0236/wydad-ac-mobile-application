// ===========================================
// WYDAD AC - HOME SCREEN
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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { newsAPI, matchesAPI, playersAPI } from '../services/api';
import { COLORS, SIZES, SHADOWS } from '../theme/colors';

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
        newsAPI.getFeatured(),
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
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Bonjour,</Text>
          <Text style={styles.userName}>{user?.name || 'Supporter'} 🔴⚪</Text>
        </View>
        <View style={styles.logo}>
          <Text style={styles.logoText}>WAC</Text>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />
        }
      >
        {/* Next Match Card */}
        {nextMatch && (
          <TouchableOpacity 
            style={styles.matchCard}
            onPress={() => navigation.navigate('Matches')}
          >
            <Text style={styles.matchLabel}>PROCHAIN MATCH</Text>
            <View style={styles.matchTeams}>
              <Text style={styles.teamName}>{nextMatch.home_team}</Text>
              <Text style={styles.vs}>VS</Text>
              <Text style={styles.teamName}>{nextMatch.away_team}</Text>
            </View>
            <Text style={styles.matchInfo}>
              📅 {formatDate(nextMatch.match_date)} • 🏟️ {nextMatch.stadium}
            </Text>
            <TouchableOpacity style={styles.ticketButton}>
              <Text style={styles.ticketButtonText}>🎟️ Réserver des tickets</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        )}

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity 
            style={styles.actionCard}
            onPress={() => navigation.navigate('Players')}
          >
            <Text style={styles.actionIcon}>⚽</Text>
            <Text style={styles.actionText}>Joueurs</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionCard}
            onPress={() => navigation.navigate('Matches')}
          >
            <Text style={styles.actionIcon}>🏟️</Text>
            <Text style={styles.actionText}>Matchs</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionCard}
            onPress={() => navigation.getParent()?.navigate('Shop')}
          >
            <Text style={styles.actionIcon}>🛒</Text>
            <Text style={styles.actionText}>Boutique</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionCard}
            onPress={() => navigation.getParent()?.navigate('Stores')}
          >
            <Text style={styles.actionIcon}>📍</Text>
            <Text style={styles.actionText}>Magasins</Text>
          </TouchableOpacity>
        </View>

        {/* News Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📰 Actualités</Text>
          
          {news.length > 0 ? (
            news.map((item) => (
              <TouchableOpacity 
                key={item.id} 
                style={styles.newsCard}
                onPress={() => navigation.navigate('NewsDetail', { newsId: item.id })}
              >
                <View style={styles.newsContent}>
                  <Text style={styles.newsCategory}>{item.category?.toUpperCase()}</Text>
                  <Text style={styles.newsTitle} numberOfLines={2}>{item.title}</Text>
                  <Text style={styles.newsSummary} numberOfLines={2}>{item.summary}</Text>
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <Text style={styles.emptyText}>Aucune actualité disponible</Text>
          )}
        </View>

        {/* Footer Spacing */}
        <View style={{ height: 20 }} />
      </ScrollView>
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
  greeting: {
    fontSize: 14,
    color: COLORS.textWhite,
    opacity: 0.8,
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.textWhite,
  },
  logo: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.textWhite,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  matchCard: {
    margin: SIZES.screenPadding,
    backgroundColor: COLORS.primary,
    borderRadius: SIZES.radiusLg,
    padding: SIZES.lg,
    ...SHADOWS.medium,
  },
  matchLabel: {
    color: COLORS.textWhite,
    opacity: 0.8,
    fontSize: 12,
    marginBottom: 10,
  },
  matchTeams: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  teamName: {
    color: COLORS.textWhite,
    fontSize: 18,
    fontWeight: 'bold',
  },
  vs: {
    color: COLORS.textWhite,
    fontSize: 14,
    marginHorizontal: 15,
    opacity: 0.8,
  },
  matchInfo: {
    color: COLORS.textWhite,
    textAlign: 'center',
    fontSize: 12,
    opacity: 0.9,
  },
  ticketButton: {
    backgroundColor: COLORS.textWhite,
    borderRadius: SIZES.radiusMd,
    padding: 12,
    marginTop: 15,
    alignItems: 'center',
  },
  ticketButtonText: {
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  quickActions: {
    flexDirection: 'row',
    paddingHorizontal: SIZES.screenPadding,
    marginBottom: 20,
  },
  actionCard: {
    flex: 1,
    backgroundColor: COLORS.card,
    borderRadius: SIZES.radiusMd,
    padding: 15,
    marginHorizontal: 4,
    alignItems: 'center',
    ...SHADOWS.small,
  },
  actionIcon: {
    fontSize: 24,
    marginBottom: 5,
  },
  actionText: {
    fontSize: 11,
    color: COLORS.textSecondary,
  },
  section: {
    paddingHorizontal: SIZES.screenPadding,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 15,
  },
  newsCard: {
    backgroundColor: COLORS.card,
    borderRadius: SIZES.radiusMd,
    marginBottom: 12,
    overflow: 'hidden',
    ...SHADOWS.small,
  },
  newsContent: {
    padding: 15,
  },
  newsCategory: {
    fontSize: 10,
    color: COLORS.primary,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  newsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 5,
  },
  newsSummary: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  emptyText: {
    textAlign: 'center',
    color: COLORS.textSecondary,
    padding: 20,
  },
});

export default HomeScreen;
