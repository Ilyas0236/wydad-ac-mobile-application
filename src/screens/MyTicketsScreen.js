// ===========================================
// WYDAD AC - MY TICKETS SCREEN
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
  Modal,
  Linking,
  Share,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import QRCode from 'react-native-qrcode-svg';
import { useAuth } from '../context/AuthContext';
import { ticketsAPI } from '../services/api';
import { COLORS, SIZES, SHADOWS } from '../theme/colors';

const MyTicketsScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [qrModalVisible, setQrModalVisible] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);

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

  const [downloading, setDownloading] = useState(false);

  const handleDownloadTicket = async (ticketId) => {
    setDownloading(true);
    try {
      const pdfUrl = await ticketsAPI.downloadPDF(ticketId);
      
      // Ouvrir le PDF dans le navigateur
      const supported = await Linking.canOpenURL(pdfUrl);
      if (supported) {
        await Linking.openURL(pdfUrl);
      } else {
        Alert.alert(
          'Téléchargement',
          'Voulez-vous ouvrir le billet PDF dans votre navigateur?',
          [
            { text: 'Annuler', style: 'cancel' },
            { text: 'Ouvrir', onPress: () => Linking.openURL(pdfUrl) },
          ]
        );
      }
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de télécharger le billet');
    } finally {
      setDownloading(false);
    }
  };

  const handleShareTicket = async (ticket) => {
    try {
      const matchDate = formatDate(ticket.match_date);
      const message = `🏟️ Mon billet WAC\n\n⚽ WAC vs ${ticket.opponent}\n📅 ${matchDate}\n🏠 ${ticket.venue}\n🎫 Section: ${getSectionInfo(ticket.seat_section).label}\n💺 Siège: ${ticket.seat_number}\n\n#WydadAthleticClub #DimaWydad 🔴⚪`;
      
      await Share.share({
        message,
        title: 'Mon billet WAC',
      });
    } catch (error) {
      console.log('Erreur partage:', error);
    }
  };

  const handleShowQRCode = (ticket) => {
    setSelectedTicket(ticket);
    setQrModalVisible(true);
  };

  const getSectionInfo = (section) => {
    const sections = {
      virage_nord: { label: 'Virage Nord (Winners)', icon: '🔴', color: COLORS.primary },
      virage_sud: { label: 'Virage Sud', icon: '⚪', color: COLORS.textSecondary },
      lateral_est: { label: 'Latéral Est', icon: '🎫', color: COLORS.success },
      lateral_ouest: { label: 'Latéral Ouest', icon: '🎫', color: COLORS.success },
      tribune_honneur: { label: 'Tribune d\'Honneur', icon: '🏟️', color: COLORS.primary },
      tribune_presidentielle: { label: 'Tribune VIP', icon: '⭐', color: '#FFD700' },
    };
    return sections[section] || { label: section, icon: '🎫', color: COLORS.success };
  };

  // Générer les données du QR Code
  const generateQRData = (ticket) => {
    return JSON.stringify({
      ticketId: ticket.id,
      ref: `WAC-${ticket.id.toString().padStart(6, '0')}`,
      matchId: ticket.match_id,
      opponent: ticket.opponent,
      date: ticket.match_date,
      section: ticket.seat_section,
      seat: ticket.seat_number,
      quantity: ticket.quantity,
      userId: user?.id,
      status: ticket.status,
    });
  };

  const renderTicket = ({ item }) => {
    const upcoming = isUpcoming(item.match_date);
    const sectionInfo = getSectionInfo(item.seat_section);

    return (
      <View style={[styles.ticketCard, !upcoming && styles.pastTicket]}>
        {/* Status Badge */}
        <View style={[styles.statusBadge, upcoming ? styles.upcomingBadge : styles.pastBadge]}>
          <Text style={styles.statusText}>
            {item.status === 'paid' ? '✅ Payé' : item.status === 'pending' ? '⏳ En attente' : '✓ Utilisé'}
          </Text>
        </View>

        {/* Ticket Header */}
        <View style={styles.ticketHeader}>
          <View style={styles.sectionBadge}>
            <Text style={styles.sectionIcon}>{sectionInfo.icon}</Text>
            <Text style={styles.sectionLabel}>{sectionInfo.label}</Text>
          </View>
          <Text style={styles.ticketPrice}>{item.total_amount} MAD</Text>
        </View>

        {/* Match Info */}
        <View style={styles.matchInfo}>
          <Text style={styles.matchTeams}>
            {item.is_home ? 'WAC' : item.opponent} vs {item.is_home ? item.opponent : 'WAC'}
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
          <Text style={styles.stadiumText}>{item.venue}</Text>
        </View>

        {/* Ticket details */}
        <View style={styles.quantityRow}>
          <Text style={styles.quantityLabel}>Quantité: {item.quantity} place(s)</Text>
          <Text style={styles.seatNumber}>Siège: {item.seat_number}</Text>
        </View>

        {/* Ticket Reference */}
        <View style={styles.referenceRow}>
          <Text style={styles.referenceLabel}>Référence:</Text>
          <Text style={styles.referenceValue}>#{item.id.toString().padStart(6, '0')}</Text>
        </View>

        {/* Actions */}
        {upcoming && item.status === 'paid' && (
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
              onPress={() => handleShowQRCode(item)}
            >
              <Text style={[styles.actionIcon, { color: COLORS.textWhite }]}>🔲</Text>
              <Text style={[styles.actionText, { color: COLORS.textWhite }]}>QR Code</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionBtn, styles.shareBtn]}
              onPress={() => handleShareTicket(item)}
            >
              <Text style={styles.actionIcon}>📤</Text>
              <Text style={styles.actionText}>Partager</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  // QR Code Modal
  const renderQRModal = () => {
    if (!selectedTicket) return null;

    const sectionInfo = getSectionInfo(selectedTicket.seat_section);

    return (
      <Modal
        visible={qrModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setQrModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>🎟️ Votre Billet</Text>
              <TouchableOpacity onPress={() => setQrModalVisible(false)}>
                <Text style={styles.closeBtn}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* Match Info */}
            <View style={styles.qrMatchInfo}>
              <Text style={styles.qrMatchTeams}>
                {selectedTicket.is_home ? 'WAC' : selectedTicket.opponent} vs {selectedTicket.is_home ? selectedTicket.opponent : 'WAC'}
              </Text>
              <Text style={styles.qrCompetition}>{selectedTicket.competition}</Text>
              <Text style={styles.qrDate}>
                {formatDate(selectedTicket.match_date)} • {formatTime(selectedTicket.match_date)}
              </Text>
            </View>

            {/* QR Code */}
            <View style={styles.qrContainer}>
              <View style={styles.qrWrapper}>
                <QRCode
                  value={generateQRData(selectedTicket)}
                  size={200}
                  color={COLORS.text}
                  backgroundColor={COLORS.textWhite}
                />
              </View>
              <Text style={styles.qrRef}>WAC-{selectedTicket.id.toString().padStart(6, '0')}</Text>
            </View>

            {/* Ticket Details */}
            <View style={styles.qrDetails}>
              <View style={styles.qrDetailRow}>
                <Text style={styles.qrDetailLabel}>Section:</Text>
                <Text style={styles.qrDetailValue}>{sectionInfo.icon} {sectionInfo.label}</Text>
              </View>
              <View style={styles.qrDetailRow}>
                <Text style={styles.qrDetailLabel}>Siège:</Text>
                <Text style={styles.qrDetailValue}>{selectedTicket.seat_number}</Text>
              </View>
              <View style={styles.qrDetailRow}>
                <Text style={styles.qrDetailLabel}>Places:</Text>
                <Text style={styles.qrDetailValue}>{selectedTicket.quantity}</Text>
              </View>
              <View style={styles.qrDetailRow}>
                <Text style={styles.qrDetailLabel}>Stade:</Text>
                <Text style={styles.qrDetailValue}>{selectedTicket.venue}</Text>
              </View>
            </View>

            {/* Instructions */}
            <View style={styles.qrInstructions}>
              <Text style={styles.qrInstructionIcon}>💡</Text>
              <Text style={styles.qrInstructionText}>
                Présentez ce QR code à l'entrée du stade. Gardez votre téléphone chargé!
              </Text>
            </View>
          </View>
        </View>
      </Modal>
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

      {/* QR Code Modal */}
      {renderQRModal()}
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
  sectionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  sectionIcon: {
    fontSize: 16,
    marginRight: 5,
  },
  sectionLabel: {
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
  quantityRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: COLORS.background,
    borderRadius: SIZES.radiusSm,
  },
  quantityLabel: {
    fontSize: 13,
    color: COLORS.text,
    fontWeight: '500',
  },
  seatNumber: {
    fontSize: 13,
    color: COLORS.primary,
    fontWeight: '600',
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
  shareBtn: {
    backgroundColor: COLORS.info || '#3498db',
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
  // QR Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: COLORS.card,
    borderRadius: SIZES.radiusLg,
    padding: 20,
    width: '90%',
    maxWidth: 400,
    ...SHADOWS.large,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  closeBtn: {
    fontSize: 24,
    color: COLORS.textSecondary,
    padding: 5,
  },
  qrMatchInfo: {
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  qrMatchTeams: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 5,
  },
  qrCompetition: {
    fontSize: 13,
    color: COLORS.primary,
    marginBottom: 5,
  },
  qrDate: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  qrContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  qrWrapper: {
    backgroundColor: COLORS.textWhite,
    padding: 15,
    borderRadius: SIZES.radiusMd,
    ...SHADOWS.small,
  },
  qrRef: {
    marginTop: 10,
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.primary,
    fontFamily: 'monospace',
    letterSpacing: 2,
  },
  qrDetails: {
    backgroundColor: COLORS.background,
    borderRadius: SIZES.radiusMd,
    padding: 15,
    marginBottom: 15,
  },
  qrDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  qrDetailLabel: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  qrDetailValue: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text,
  },
  qrInstructions: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary + '15',
    padding: 12,
    borderRadius: SIZES.radiusSm,
  },
  qrInstructionIcon: {
    fontSize: 20,
    marginRight: 10,
  },
  qrInstructionText: {
    flex: 1,
    fontSize: 12,
    color: COLORS.text,
    lineHeight: 18,
  },
});

export default MyTicketsScreen;
