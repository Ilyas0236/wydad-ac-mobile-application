// ===========================================
// WYDAD AC - TICKETS SCREEN
// ===========================================

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  Alert,
  ActivityIndicator,
  Modal,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { matchesAPI, ticketsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { COLORS, SIZES, SHADOWS } from '../theme/colors';

// Sections du stade (correspondant au backend)
const STADIUM_SECTIONS = [
  { key: 'virage_nord', label: 'Virage Nord (Winners)', price_multiplier: 1.0, icon: '🔴' },
  { key: 'virage_sud', label: 'Virage Sud', price_multiplier: 1.0, icon: '⚪' },
  { key: 'pelouse', label: 'Pelouse', price_multiplier: 1.5, icon: '⛳' },
  { key: 'tribune', label: 'Tribune Latérale', price_multiplier: 2.5, icon: '🎫' },
  { key: 'tribune_honneur', label: 'Tribune d\'Honneur', price_multiplier: 5.0, icon: '🏟️' },
];

const TicketsScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [matches, setMatches] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [selectedSection, setSelectedSection] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [purchasing, setPurchasing] = useState(false);

  // Modal choix méthode de paiement
  const [showPaymentMethodModal, setShowPaymentMethodModal] = useState(false);

  // Modal de paiement carte
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [pendingTicket, setPendingTicket] = useState(null);
  const [cardNumber, setCardNumber] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCVV, setCardCVV] = useState('');
  const [paying, setPaying] = useState(false);

  // Sections dynamiques
  const [dynamicSections, setDynamicSections] = useState([]);
  const [loadingSections, setLoadingSections] = useState(false);

  // Initial load
  useEffect(() => {
    loadUpcomingMatches();
  }, []);

  // Charger les sections quand un match est sélectionné
  useEffect(() => {
    if (selectedMatch) {
      loadMatchSections(selectedMatch.id);
    } else {
      setDynamicSections([]);
    }
  }, [selectedMatch]);

  const loadMatchSections = async (matchId) => {
    setLoadingSections(true);
    try {
      const response = await matchesAPI.getSections(matchId);
      if (response.success && response.data.length > 0) {
        // Mapper les données du backend avec les labels/icones du frontend
        const mergedSections = STADIUM_SECTIONS.map(staticSection => {
          const dynamic = response.data.find(d => d.category_key === staticSection.key);
          if (dynamic) {
            return {
              ...staticSection,
              price: dynamic.price, // Utiliser le prix du backend
              capacity: dynamic.capacity,
              // available: dynamic.capacity - dynamic.sold // Si on gérait le sold par section
            };
          }
          return {
            ...staticSection,
            price: Math.round(selectedMatch.ticket_price * staticSection.price_multiplier), // Fallback
          };
        });
        setDynamicSections(mergedSections);
      } else {
        // Fallback si pas de config backend
        const fallbackSections = STADIUM_SECTIONS.map(s => ({
          ...s,
          price: Math.round(selectedMatch.ticket_price * s.price_multiplier)
        }));
        setDynamicSections(fallbackSections);
      }
    } catch (error) {
      console.error('Erreur chargement sections:', error);
      // Fallback en cas d'erreur
      const fallbackSections = STADIUM_SECTIONS.map(s => ({
        ...s,
        price: Math.round(selectedMatch.ticket_price * s.price_multiplier)
      }));
      setDynamicSections(fallbackSections);
    } finally {
      setLoadingSections(false);
    }
  };

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
    if (selectedMatch) loadMatchSections(selectedMatch.id);
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

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const calculatePrice = () => {
    if (!selectedMatch || !selectedSection) return 0;
    const section = dynamicSections.find(s => s.key === selectedSection);
    return section ? section.price * quantity : 0;
  };

  const handleReserve = async () => {
    if (!user) {
      Alert.alert('Connexion requise', 'Veuillez vous connecter pour acheter des billets', [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Se connecter', onPress: () => navigation.navigate('Login') },
      ]);
      return;
    }

    if (!selectedMatch || !selectedSection) {
      Alert.alert('Erreur', 'Veuillez sélectionner un match et une section');
      return;
    }

    setPurchasing(true);
    try {
      const response = await ticketsAPI.purchase({
        match_id: selectedMatch.id,
        seat_section: selectedSection,
        quantity: quantity,
      });

      if (response.success) {
        // Ticket réservé, afficher choix de méthode de paiement
        setPendingTicket(response.data);
        setShowPaymentMethodModal(true);
      } else {
        Alert.alert('Erreur', response.message || 'Erreur lors de la réservation');
      }
    } catch (error) {
      Alert.alert('Erreur', error.message || 'Impossible de réserver');
    } finally {
      setPurchasing(false);
    }
  };

  // Paiement par carte
  const handleCardPayment = async () => {
    if (!cardNumber || cardNumber.length < 16) {
      Alert.alert('Erreur', 'Veuillez entrer un numéro de carte valide (16 chiffres)');
      return;
    }
    if (!cardHolder) {
      Alert.alert('Erreur', 'Veuillez entrer le nom du titulaire');
      return;
    }
    if (!cardExpiry || cardExpiry.length < 4) {
      Alert.alert('Erreur', 'Veuillez entrer une date d\'expiration valide (MM/AA)');
      return;
    }
    if (!cardCVV || cardCVV.length < 3) {
      Alert.alert('Erreur', 'Veuillez entrer un CVV valide (3 chiffres)');
      return;
    }

    setPaying(true);
    // Simuler un délai de traitement
    await new Promise(resolve => setTimeout(resolve, 1500));

    try {
      const response = await ticketsAPI.pay(pendingTicket.id, {
        payment_method: 'card',
        card_number: cardNumber,
        card_holder: cardHolder,
        card_expiry: cardExpiry,
        card_cvv: cardCVV,
      });

      if (response.success) {
        setShowPaymentModal(false);
        Alert.alert(
          '✅ Paiement réussi!',
          `Vos ${quantity} billet(s) ont été payés.\nRéférence: #${pendingTicket.id.toString().padStart(6, '0')}\n\n🎟️ Présentez votre QR Code à l'entrée du stade.`,
          [
            {
              text: 'Voir mes billets',
              onPress: () => navigation.navigate('MyTickets'),
            },
            { text: 'OK' },
          ]
        );
        resetPaymentForm();
        loadUpcomingMatches();
      } else {
        Alert.alert('Erreur', response.message || 'Erreur de paiement');
      }
    } catch (error) {
      Alert.alert('Erreur', error.message || 'Paiement échoué');
    } finally {
      setPaying(false);
    }
  };

  // Paiement mobile money (simulation)
  const handleMobilePayment = async () => {
    setPaying(true);
    // Simuler un délai de traitement
    await new Promise(resolve => setTimeout(resolve, 2000));

    try {
      const response = await ticketsAPI.pay(pendingTicket.id, {
        payment_method: 'mobile_money',
      });

      if (response.success) {
        setShowPaymentMethodModal(false);
        Alert.alert(
          '✅ Paiement réussi!',
          `Vos ${quantity} billet(s) ont été payés par Mobile Money.\nRéférence: #${pendingTicket.id.toString().padStart(6, '0')}\n\n🎟️ Présentez votre QR Code à l'entrée du stade.`,
          [
            {
              text: 'Voir mes billets',
              onPress: () => navigation.navigate('MyTickets'),
            },
            { text: 'OK' },
          ]
        );
        resetPaymentForm();
        loadUpcomingMatches();
      } else {
        Alert.alert('Erreur', response.message || 'Erreur de paiement');
      }
    } catch (error) {
      Alert.alert('Erreur', error.message || 'Paiement échoué');
    } finally {
      setPaying(false);
    }
  };

  // Reset du formulaire
  const resetPaymentForm = () => {
    setSelectedMatch(null);
    setSelectedSection(null);
    setQuantity(1);
    setPendingTicket(null);
    setCardNumber('');
    setCardHolder('');
    setCardExpiry('');
    setCardCVV('');
  };

  // Annuler la réservation
  const handleCancelReservation = async () => {
    if (pendingTicket) {
      try {
        await ticketsAPI.cancel(pendingTicket.id);
      } catch (e) {
        console.log('Erreur annulation:', e);
      }
    }
    setShowPaymentModal(false);
    setShowPaymentMethodModal(false);
    resetPaymentForm();
    loadUpcomingMatches();
  };

  // Formater la date d'expiration
  const formatExpiry = (text) => {
    const cleaned = text.replace(/\D/g, '');
    if (cleaned.length >= 2) {
      return cleaned.slice(0, 2) + '/' + cleaned.slice(2, 4);
    }
    return cleaned;
  };

  const renderMatch = ({ item }) => {
    const homeTeam = item.is_home ? 'WAC' : item.opponent;
    const awayTeam = item.is_home ? item.opponent : 'WAC';

    return (
      <TouchableOpacity
        style={[styles.matchCard, selectedMatch?.id === item.id && styles.matchCardSelected]}
        onPress={() => {
          setSelectedMatch(item);
          setSelectedSection(null);
        }}
      >
        <View style={styles.matchHeader}>
          <Text style={styles.competitionText}>{item.competition}</Text>
          <Text style={[styles.ticketsLeft, item.available_seats < 100 && { color: COLORS.warning }]}>
            {item.available_seats} places
          </Text>
        </View>

        <View style={styles.matchTeams}>
          <Text style={styles.teamName}>{homeTeam}</Text>
          <Text style={styles.vsText}>VS</Text>
          <Text style={styles.teamName}>{awayTeam}</Text>
        </View>

        <View style={styles.matchInfo}>
          <Text style={styles.dateText}>📅 {formatDate(item.match_date)}</Text>
          <Text style={styles.timeText}>🕐 {formatTime(item.match_date)}</Text>
        </View>

        <Text style={styles.stadiumText}>📍 {item.venue}</Text>
        <Text style={styles.basePriceText}>À partir de {item.ticket_price} MAD</Text>

        {selectedMatch?.id === item.id && (
          <View style={styles.selectedBadge}>
            <Text style={styles.selectedText}>✓ Sélectionné</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>🎟️ Billetterie</Text>
        <TouchableOpacity onPress={() => navigation.navigate('MyTickets')}>
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
          isLoading ? (
            <ActivityIndicator size="large" color={COLORS.primary} />
          ) : (
            <Text style={styles.emptyText}>Aucun match à venir</Text>
          )
        }
        ListFooterComponent={
          selectedMatch && (
            <View style={styles.purchaseSection}>
              <Text style={styles.sectionTitle}>Choisir une tribune</Text>

              {/* Sections du stade */}
              <View style={styles.sectionsContainer}>
                {loadingSections ? (
                  <ActivityIndicator color={COLORS.primary} style={{ margin: 20, width: '100%' }} />
                ) : (
                  dynamicSections.map((section) => (
                    <TouchableOpacity
                      key={section.key}
                      style={[
                        styles.sectionCard,
                        selectedSection === section.key && styles.sectionCardSelected,
                      ]}
                      onPress={() => setSelectedSection(section.key)}
                    >
                      <Text style={styles.sectionIcon}>{section.icon}</Text>
                      <Text style={styles.sectionLabel}>{section.label}</Text>
                      <Text style={styles.sectionPrice}>{section.price} MAD</Text>
                      {selectedSection === section.key && (
                        <View style={styles.checkMark}>
                          <Text style={styles.checkMarkText}>✓</Text>
                        </View>
                      )}
                    </TouchableOpacity>
                  ))
                )}
              </View>

              {/* Quantity */}
              {selectedSection && (
                <>
                  <View style={styles.quantitySection}>
                    <Text style={styles.quantityLabel}>Nombre de billets:</Text>
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

                  {/* Total */}
                  <View style={styles.totalSection}>
                    <Text style={styles.totalLabel}>Total à payer:</Text>
                    <Text style={styles.totalPrice}>{calculatePrice()} MAD</Text>
                  </View>

                  <TouchableOpacity
                    style={[styles.purchaseBtn, purchasing && styles.purchaseBtnDisabled]}
                    onPress={handleReserve}
                    disabled={purchasing}
                  >
                    {purchasing ? (
                      <ActivityIndicator color={COLORS.textWhite} />
                    ) : (
                      <Text style={styles.purchaseBtnText}>🎟️ Réserver et Payer</Text>
                    )}
                  </TouchableOpacity>
                </>
              )}
            </View>
          )
        }
      />

      {/* Modal Paiement */}
      <Modal
        visible={showPaymentModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowPaymentModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>💳 Paiement par Carte</Text>
            <Text style={styles.modalSubtitle}>
              Total: {pendingTicket?.total_amount} MAD
            </Text>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Numéro de carte</Text>
              <TextInput
                style={styles.input}
                placeholder="1234 5678 9012 3456"
                placeholderTextColor={COLORS.textLight}
                value={cardNumber}
                onChangeText={(text) => setCardNumber(text.replace(/\D/g, '').slice(0, 16))}
                keyboardType="numeric"
                maxLength={16}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Nom du titulaire</Text>
              <TextInput
                style={styles.input}
                placeholder="NOM PRÉNOM"
                placeholderTextColor={COLORS.textLight}
                value={cardHolder}
                onChangeText={setCardHolder}
                autoCapitalize="characters"
              />
            </View>

            <View style={styles.rowInputs}>
              <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
                <Text style={styles.inputLabel}>Expiration</Text>
                <TextInput
                  style={styles.input}
                  placeholder="MM/AA"
                  placeholderTextColor={COLORS.textLight}
                  value={cardExpiry}
                  onChangeText={(text) => setCardExpiry(formatExpiry(text))}
                  keyboardType="numeric"
                  maxLength={5}
                />
              </View>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.inputLabel}>CVV</Text>
                <TextInput
                  style={styles.input}
                  placeholder="123"
                  placeholderTextColor={COLORS.textLight}
                  value={cardCVV}
                  onChangeText={(text) => setCardCVV(text.replace(/\D/g, '').slice(0, 3))}
                  keyboardType="numeric"
                  maxLength={3}
                  secureTextEntry
                />
              </View>
            </View>

            <View style={styles.modalNote}>
              <Text style={styles.noteText}>🔒 Paiement simulé - Aucune transaction réelle</Text>
            </View>

            <TouchableOpacity
              style={[styles.payBtn, paying && styles.payBtnDisabled]}
              onPress={handleCardPayment}
              disabled={paying}
            >
              {paying ? (
                <ActivityIndicator color={COLORS.textWhite} />
              ) : (
                <Text style={styles.payBtnText}>💳 Payer {pendingTicket?.total_amount} MAD</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={handleCancelReservation}
            >
              <Text style={styles.cancelBtnText}>Annuler la réservation</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal Choix Méthode de Paiement */}
      <Modal
        visible={showPaymentMethodModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowPaymentMethodModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>💰 Méthode de Paiement</Text>
            <Text style={styles.modalSubtitle}>
              Réservation: {quantity} billet(s) - {pendingTicket?.total_amount} MAD
            </Text>

            <View style={styles.paymentOptions}>
              {/* Paiement par carte */}
              <TouchableOpacity
                style={styles.paymentOption}
                onPress={() => {
                  setShowPaymentMethodModal(false);
                  setShowPaymentModal(true);
                }}
                disabled={paying}
              >
                <View style={styles.paymentOptionIcon}>
                  <Text style={styles.paymentEmoji}>💳</Text>
                </View>
                <View style={styles.paymentOptionInfo}>
                  <Text style={styles.paymentOptionTitle}>Carte bancaire</Text>
                  <Text style={styles.paymentOptionDesc}>Visa, Mastercard, CMI</Text>
                </View>
                <Text style={styles.paymentArrow}>→</Text>
              </TouchableOpacity>

              {/* Paiement Mobile Money */}
              <TouchableOpacity
                style={styles.paymentOption}
                onPress={handleMobilePayment}
                disabled={paying}
              >
                <View style={styles.paymentOptionIcon}>
                  <Text style={styles.paymentEmoji}>📱</Text>
                </View>
                <View style={styles.paymentOptionInfo}>
                  <Text style={styles.paymentOptionTitle}>Mobile Money</Text>
                  <Text style={styles.paymentOptionDesc}>Orange Money, Inwi Money</Text>
                </View>
                {paying ? (
                  <ActivityIndicator color={COLORS.primary} />
                ) : (
                  <Text style={styles.paymentArrow}>→</Text>
                )}
              </TouchableOpacity>
            </View>

            <View style={styles.securityNote}>
              <Text style={styles.securityIcon}>🔐</Text>
              <Text style={styles.securityText}>
                Vos données de paiement sont sécurisées et cryptées
              </Text>
            </View>

            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={handleCancelReservation}
              disabled={paying}
            >
              <Text style={styles.cancelBtnText}>Annuler la réservation</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  basePriceText: {
    fontSize: 12,
    color: COLORS.primary,
    textAlign: 'center',
    marginTop: 5,
    fontWeight: '600',
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
  sectionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  sectionCard: {
    width: '48%',
    backgroundColor: COLORS.card,
    borderRadius: SIZES.radiusMd,
    padding: 12,
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 2,
    borderColor: 'transparent',
    ...SHADOWS.small,
  },
  sectionCardSelected: {
    borderColor: COLORS.primary,
  },
  sectionIcon: {
    fontSize: 24,
    marginBottom: 5,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: COLORS.text,
    textAlign: 'center',
  },
  sectionPrice: {
    fontSize: 14,
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
  purchaseBtnDisabled: {
    opacity: 0.6,
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
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.card,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 5,
  },
  modalSubtitle: {
    fontSize: 16,
    color: COLORS.primary,
    textAlign: 'center',
    marginBottom: 20,
    fontWeight: '600',
  },
  inputGroup: {
    marginBottom: 15,
  },
  inputLabel: {
    fontSize: 14,
    color: COLORS.text,
    marginBottom: 5,
    fontWeight: '600',
  },
  input: {
    backgroundColor: COLORS.background,
    borderRadius: SIZES.radiusMd,
    padding: 15,
    fontSize: 16,
    color: COLORS.text,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  rowInputs: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalNote: {
    backgroundColor: COLORS.background,
    padding: 10,
    borderRadius: SIZES.radiusMd,
    marginVertical: 15,
  },
  noteText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  payBtn: {
    backgroundColor: COLORS.success,
    padding: 18,
    borderRadius: SIZES.radiusMd,
    alignItems: 'center',
    ...SHADOWS.medium,
  },
  payBtnDisabled: {
    opacity: 0.6,
  },
  payBtnText: {
    color: COLORS.textWhite,
    fontSize: 16,
    fontWeight: 'bold',
  },
  cancelBtn: {
    padding: 15,
    alignItems: 'center',
    marginTop: 10,
  },
  cancelBtnText: {
    color: COLORS.error,
    fontSize: 14,
    fontWeight: '500',
  },
  // Payment method styles
  paymentOptions: {
    marginVertical: 15,
  },
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderRadius: SIZES.radiusMd,
    padding: 15,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  paymentOptionIcon: {
    width: 50,
    height: 50,
    backgroundColor: COLORS.card,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  paymentEmoji: {
    fontSize: 24,
  },
  paymentOptionInfo: {
    flex: 1,
  },
  paymentOptionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  paymentOptionDesc: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  paymentArrow: {
    fontSize: 20,
    color: COLORS.primary,
  },
  securityNote: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.background,
    padding: 12,
    borderRadius: SIZES.radiusMd,
    marginBottom: 15,
  },
  securityIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  securityText: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
});

export default TicketsScreen;
