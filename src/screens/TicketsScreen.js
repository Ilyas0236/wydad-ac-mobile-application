// ===========================================
// WYDAD AC - TICKETS SCREEN
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
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { matchesAPI, ticketsAPI } from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { COLORS, SIZES, SHADOWS } from '../theme/colors';

const TICKET_CATEGORIES = {
  tribune: { label: 'Tribune', price: 50, icon: '🎫' },
  gradins: { label: 'Gradins', price: 100, icon: '🏟️' },
  vip: { label: 'VIP', price: 300, icon: '⭐' },
};

const TicketsScreen = ({ navigation }) => {
  const { user } = useContext(AuthContext);
  const [matches, setMatches] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [purchasing, setPurchasing] = useState(false);

  useEffect(() => {
    loadUpcomingMatches();
  }, []);

  const loadUpcomingMatches = async () => {
    try {
      const response = await matchesAPI.getUpcoming();
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
    await loadUpcomingMatches();
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

  const handlePurchase = async () => {
    if (!user) {
      Alert.alert('Connexion requise', 'Veuillez vous connecter pour acheter des billets', [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Se connecter', onPress: () => navigation.navigate('Login') },
      ]);
      return;
    }

    if (!selectedMatch || !selectedCategory) {
      Alert.alert('Erreur', 'Veuillez sélectionner un match et une catégorie');
      return;
    }

    setPurchasing(true);
    try {
      const response = await ticketsAPI.purchase({
        match_id: selectedMatch.id,
        category: selectedCategory,
        quantity: quantity,
      });

      if (response.success) {
        Alert.alert(
          '✅ Achat réussi!',
          `Vos ${quantity} billet(s) ont été achetés.\nTotal: ${response.data.total_price} MAD`,
          [
            {
              text: 'Voir mes billets',
              onPress: () => navigation.navigate('Profile', { screen: 'MyTickets' }),
            },
            { text: 'OK' },
          ]
        );
        setSelectedMatch(null);
        setSelectedCategory(null);
        setQuantity(1);
      } else {
        Alert.alert('Erreur', response.message || 'Erreur lors de l\'achat');
      }
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de finaliser l\'achat');
    } finally {
      setPurchasing(false);
    }
  };

  const renderMatch = ({ item }) => (
    <TouchableOpacity
      style={[styles.matchCard, selectedMatch?.id === item.id && styles.matchCardSelected]}
      onPress={() => setSelectedMatch(item)}
    >
      <View style={styles.matchHeader}>
        <Text style={styles.competitionText}>{item.competition}</Text>
        <Text style={styles.ticketsLeft}>
          {item.tickets_available} places
        </Text>
      </View>

      <View style={styles.matchTeams}>
        <Text style={styles.teamName}>{item.home_team}</Text>
        <Text style={styles.vsText}>VS</Text>
        <Text style={styles.teamName}>{item.away_team}</Text>
      </View>

      <View style={styles.matchInfo}>
        <Text style={styles.dateText}>📅 {formatDate(item.date)}</Text>
        <Text style={styles.timeText}>🕐 {formatTime(item.date)}</Text>
      </View>

      <Text style={styles.stadiumText}>📍 {item.stadium}</Text>

      {selectedMatch?.id === item.id && (
        <View style={styles.selectedBadge}>
          <Text style={styles.selectedText}>✓ Sélectionné</Text>
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
        <Text style={styles.headerTitle}>Billetterie</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Profile', { screen: 'MyTickets' })}>
          <Text style={styles.myTicketsBtn}>Mes billets</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={matches}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderMatch}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />
        }
        ListHeaderComponent={
          <Text style={styles.sectionTitle}>Matchs à venir</Text>
        }
        ListEmptyComponent={
          <Text style={styles.emptyText}>Aucun match à venir</Text>
        }
        ListFooterComponent={
          selectedMatch && (
            <View style={styles.purchaseSection}>
              <Text style={styles.sectionTitle}>Sélectionnez votre place</Text>

              {/* Categories */}
              <View style={styles.categories}>
                {Object.entries(TICKET_CATEGORIES).map(([key, value]) => (
                  <TouchableOpacity
                    key={key}
                    style={[
                      styles.categoryCard,
                      selectedCategory === key && styles.categoryCardSelected,
                    ]}
                    onPress={() => setSelectedCategory(key)}
                  >
                    <Text style={styles.categoryIcon}>{value.icon}</Text>
                    <Text style={styles.categoryLabel}>{value.label}</Text>
                    <Text style={styles.categoryPrice}>{value.price} MAD</Text>
                    {selectedCategory === key && (
                      <View style={styles.checkMark}>
                        <Text style={styles.checkMarkText}>✓</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                ))}
              </View>

              {/* Quantity */}
              {selectedCategory && (
                <>
                  <View style={styles.quantitySection}>
                    <Text style={styles.quantityLabel}>Quantité:</Text>
                    <View style={styles.quantityControls}>
                      <TouchableOpacity
                        style={styles.qtyBtn}
                        onPress={() => setQuantity(Math.max(1, quantity - 1))}
                      >
                        <Text style={styles.qtyBtnText}>-</Text>
                      </TouchableOpacity>
                      <Text style={styles.qtyValue}>{quantity}</Text>
                      <TouchableOpacity
                        style={styles.qtyBtn}
                        onPress={() => setQuantity(Math.min(10, quantity + 1))}
                      >
                        <Text style={styles.qtyBtnText}>+</Text>
                      </TouchableOpacity>
                    </View>
                  </View>

                  {/* Total & Purchase */}
                  <View style={styles.totalSection}>
                    <Text style={styles.totalLabel}>Total:</Text>
                    <Text style={styles.totalPrice}>
                      {TICKET_CATEGORIES[selectedCategory].price * quantity} MAD
                    </Text>
                  </View>

                  <TouchableOpacity
                    style={styles.purchaseBtn}
                    onPress={handlePurchase}
                    disabled={purchasing}
                  >
                    {purchasing ? (
                      <ActivityIndicator color={COLORS.textWhite} />
                    ) : (
                      <Text style={styles.purchaseBtnText}>🎟️ Acheter mes billets</Text>
                    )}
                  </TouchableOpacity>
                </>
              )}
            </View>
          )
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
  myTicketsBtn: {
    color: COLORS.textWhite,
    fontSize: 12,
    fontWeight: '600',
  },
  list: {
    padding: SIZES.screenPadding,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 15,
    marginTop: 10,
  },
  matchCard: {
    backgroundColor: COLORS.card,
    borderRadius: SIZES.radiusMd,
    padding: 15,
    marginBottom: 15,
    borderWidth: 2,
    borderColor: 'transparent',
    ...SHADOWS.small,
  },
  matchCardSelected: {
    borderColor: COLORS.primary,
  },
  matchHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  competitionText: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: '600',
  },
  ticketsLeft: {
    color: COLORS.success,
    fontSize: 12,
    fontWeight: '600',
  },
  matchTeams: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  teamName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
    flex: 1,
    textAlign: 'center',
  },
  vsText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginHorizontal: 10,
  },
  matchInfo: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
    marginBottom: 8,
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
  stadiumText: {
    fontSize: 12,
    color: COLORS.textLight,
    textAlign: 'center',
  },
  selectedBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  selectedText: {
    color: COLORS.textWhite,
    fontSize: 10,
    fontWeight: 'bold',
  },
  purchaseSection: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  categories: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  categoryCard: {
    flex: 1,
    backgroundColor: COLORS.card,
    borderRadius: SIZES.radiusMd,
    padding: 15,
    alignItems: 'center',
    marginHorizontal: 5,
    borderWidth: 2,
    borderColor: 'transparent',
    ...SHADOWS.small,
  },
  categoryCardSelected: {
    borderColor: COLORS.primary,
  },
  categoryIcon: {
    fontSize: 24,
    marginBottom: 5,
  },
  categoryLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  categoryPrice: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '600',
    marginTop: 5,
  },
  checkMark: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: COLORS.primary,
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkMarkText: {
    color: COLORS.textWhite,
    fontSize: 10,
    fontWeight: 'bold',
  },
  quantitySection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
    backgroundColor: COLORS.card,
    padding: 15,
    borderRadius: SIZES.radiusMd,
  },
  quantityLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  qtyBtn: {
    width: 40,
    height: 40,
    backgroundColor: COLORS.primary,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  qtyBtnText: {
    color: COLORS.textWhite,
    fontSize: 20,
    fontWeight: 'bold',
  },
  qtyValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
    marginHorizontal: 20,
  },
  totalSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 15,
    padding: 15,
    backgroundColor: COLORS.card,
    borderRadius: SIZES.radiusMd,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  totalPrice: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  purchaseBtn: {
    backgroundColor: COLORS.primary,
    padding: 18,
    borderRadius: SIZES.radiusMd,
    alignItems: 'center',
    marginTop: 20,
    ...SHADOWS.medium,
  },
  purchaseBtnText: {
    color: COLORS.textWhite,
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptyText: {
    textAlign: 'center',
    color: COLORS.textSecondary,
    marginTop: 50,
  },
});

export default TicketsScreen;
