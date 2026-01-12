// ===========================================
// WYDAD AC - ADMIN MATCHES SCREEN
// ===========================================

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { matchesAPI, uploadAPI } from '../../services/api';
import { COLORS, SIZES, SHADOWS } from '../../theme/colors';
import api from '../../services/api';
import { useImagePicker } from '../../hooks';
import { Image } from 'react-native';

const COMPETITIONS = [
  'Botola Pro',
  'Coupe du Trône',
  'Ligue des Champions CAF',
  'Coupe de la CAF',
  'Supercoupe d\'Afrique',
  'Match Amical',
];

const AdminMatchesScreen = ({ navigation }) => {
  const [matches, setMatches] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingMatch, setEditingMatch] = useState(null);
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingWacLogo, setUploadingWacLogo] = useState(false);
  const { showImagePickerOptions } = useImagePicker();

  // Form state
  const [form, setForm] = useState({
    opponent: '',
    opponent_logo: '',
    wac_logo: '',
    competition: 'Botola Pro',
    match_date: '',
    match_time: '20:00',
    venue: 'Stade Mohammed V',
    is_home: true,
    ticket_price: '100',
    available_tickets: '10000',
  });

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

  const resetForm = () => {
    setForm({
      opponent: '',
      opponent_logo: '',
      wac_logo: '',
      competition: 'Botola Pro',
      match_date: '',
      match_time: '20:00',
      venue: 'Stade Mohammed V',
      is_home: true,
      ticket_price: '100',
      available_tickets: '10000',
    });
    setEditingMatch(null);
  };

  const openAddModal = () => {
    resetForm();
    setModalVisible(true);
  };

  const openEditModal = (match) => {
    setEditingMatch(match);
    setForm({
      opponent: match.opponent,
      opponent_logo: match.opponent_logo || '',
      wac_logo: match.wac_logo || '',
      competition: match.competition,
      match_date: match.match_date.split('T')[0],
      match_time: match.match_time || '20:00',
      venue: match.venue,
      is_home: match.is_home === 1,
      ticket_price: match.ticket_price?.toString() || '100',
      available_tickets: match.available_tickets?.toString() || '10000',
    });
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!form.opponent || !form.match_date || !form.competition) {
      Alert.alert('Erreur', 'Adversaire, date et compétition sont requis');
      return;
    }

    setSaving(true);
    try {
      const matchData = {
        opponent: form.opponent,
        opponent_logo: form.opponent_logo,
        wac_logo: form.wac_logo,
        competition: form.competition,
        match_date: form.match_date,
        match_time: form.match_time,
        venue: form.venue,
        is_home: form.is_home ? 1 : 0,
        ticket_price: 50, // Valeur par défaut, configurée ensuite dans "Billetterie"
        available_tickets: 45000, // Capacité par défaut
      };

      let response;
      if (editingMatch) {
        response = await api.put(`/matches/${editingMatch.id}`, matchData);
      } else {
        response = await api.post('/matches', matchData);
      }

      if (response.success) {
        Alert.alert('Succès', editingMatch ? 'Match modifié!' : 'Match ajouté!');
        setModalVisible(false);
        resetForm();
        loadMatches();
      } else {
        Alert.alert('Erreur', response.message);
      }
    } catch (error) {
      Alert.alert('Erreur', error.message || 'Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  const handlePickLogo = async (type = 'opponent') => {
    try {
      const result = await showImagePickerOptions({
        allowsEditing: true,
        aspect: [1, 1],
      });

      if (result) {
        if (type === 'opponent') setUploadingLogo(true);
        else setUploadingWacLogo(true);

        const uploadRes = await uploadAPI.uploadImage({ uri: result.uri }, 'matches');

        if (uploadRes.success && uploadRes.data) {
          const logoUrl = uploadAPI.getImageUrl(uploadRes.data.url);
          setForm(prev => ({
            ...prev,
            [type === 'opponent' ? 'opponent_logo' : 'wac_logo']: logoUrl
          }));
        }

        if (type === 'opponent') setUploadingLogo(false);
        else setUploadingWacLogo(false);
      }
    } catch (error) {
      console.error('Erreur upload logo:', error);
      setUploadingLogo(false);
      setUploadingWacLogo(false);
      Alert.alert('Erreur', 'Impossible d\'uploader le logo');
    }
  };


  const handleDelete = (match) => {
    Alert.alert(
      'Supprimer',
      `Voulez-vous supprimer ce match contre ${match.opponent}?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await api.delete(`/matches/${match.id}`);
              if (response.success) {
                Alert.alert('Succès', 'Match supprimé');
                loadMatches();
              }
            } catch (error) {
              Alert.alert('Erreur', error.message);
            }
          },
        },
      ]
    );
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const renderMatch = ({ item }) => (
    <View style={styles.matchCard}>
      <View style={styles.matchHeader}>
        <Text style={styles.competition}>{item.competition}</Text>
        <Text style={styles.date}>{formatDate(item.match_date)}</Text>
      </View>
      <View style={styles.matchTeams}>
        <View style={styles.teamContainer}>
          <Image
            source={{ uri: item.is_home ? (item.wac_logo || 'https://upload.wikimedia.org/wikipedia/fr/d/d4/Wydad_Athletic_Club_logo.png') : (item.opponent_logo || 'https://via.placeholder.com/50') }}
            style={styles.teamLogo}
          />
          <Text style={styles.teamName}>{item.is_home ? 'WAC' : item.opponent}</Text>
        </View>
        <Text style={styles.vs}>VS</Text>
        <View style={styles.teamContainer}>
          <Image
            source={{ uri: item.is_home ? (item.opponent_logo || 'https://via.placeholder.com/50') : (item.wac_logo || 'https://upload.wikimedia.org/wikipedia/fr/d/d4/Wydad_Athletic_Club_logo.png') }}
            style={styles.teamLogo}
          />
          <Text style={styles.teamName}>{item.is_home ? item.opponent : 'WAC'}</Text>
        </View>
      </View>
      <View style={styles.matchFooter}>
        <Text style={styles.venue}>📍 {item.venue}</Text>
        <View style={styles.matchActions}>
          <TouchableOpacity style={styles.editBtn} onPress={() => openEditModal(item)}>
            <Text style={styles.actionIcon}>✏️</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDelete(item)}>
            <Text style={styles.actionIcon}>🗑️</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>🏟️ Gestion Matchs</Text>
        <TouchableOpacity onPress={openAddModal}>
          <Text style={styles.addButton}>+ Ajouter</Text>
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
        ListEmptyComponent={
          isLoading ? (
            <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 50 }} />
          ) : (
            <Text style={styles.emptyText}>Aucun match programmé</Text>
          )
        }
      />

      {/* Modal Add/Edit */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.modalTitle}>
                {editingMatch ? '✏️ Modifier match' : '➕ Ajouter match'}
              </Text>

              <View style={styles.rowInputs}>
                <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
                  <Text style={styles.inputLabel}>Logo WAC</Text>
                  <TouchableOpacity
                    style={styles.logoUploadBtn}
                    onPress={() => handlePickLogo('wac')}
                    disabled={uploadingWacLogo}
                  >
                    {form.wac_logo ? (
                      <Image source={{ uri: form.wac_logo }} style={styles.uploadedLogo} />
                    ) : (
                      <View style={styles.placeholderLogo}>
                        <Text style={styles.placeholderLogoText}>W</Text>
                      </View>
                    )}
                    {uploadingWacLogo && (
                      <View style={styles.loaderOverlay}>
                        <ActivityIndicator color={COLORS.primary} />
                      </View>
                    )}
                  </TouchableOpacity>
                </View>

                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={styles.inputLabel}>Logo Adversaire</Text>
                  <TouchableOpacity
                    style={styles.logoUploadBtn}
                    onPress={() => handlePickLogo('opponent')}
                    disabled={uploadingLogo}
                  >
                    {form.opponent_logo ? (
                      <Image source={{ uri: form.opponent_logo }} style={styles.uploadedLogo} />
                    ) : (
                      <View style={styles.placeholderLogo}>
                        <Text style={styles.placeholderLogoText}>+</Text>
                      </View>
                    )}
                    {uploadingLogo && (
                      <View style={styles.loaderOverlay}>
                        <ActivityIndicator color={COLORS.primary} />
                      </View>
                    )}
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Adversaire *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Nom de l'équipe adverse"
                  placeholderTextColor={COLORS.textLight}
                  value={form.opponent}
                  onChangeText={(text) => setForm({ ...form, opponent: text })}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Compétition *</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.competitionsScroll}>
                  {COMPETITIONS.map((comp) => (
                    <TouchableOpacity
                      key={comp}
                      style={[
                        styles.competitionBtn,
                        form.competition === comp && styles.competitionBtnActive,
                      ]}
                      onPress={() => setForm({ ...form, competition: comp })}
                    >
                      <Text
                        style={[
                          styles.competitionText,
                          form.competition === comp && styles.competitionTextActive,
                        ]}
                      >
                        {comp}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              <View style={styles.rowInputs}>
                <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
                  <Text style={styles.inputLabel}>Date *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="AAAA-MM-JJ"
                    placeholderTextColor={COLORS.textLight}
                    value={form.match_date}
                    onChangeText={(text) => setForm({ ...form, match_date: text })}
                  />
                </View>
                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={styles.inputLabel}>Heure</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="20:00"
                    placeholderTextColor={COLORS.textLight}
                    value={form.match_time}
                    onChangeText={(text) => setForm({ ...form, match_time: text })}
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Stade</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Lieu du match"
                  placeholderTextColor={COLORS.textLight}
                  value={form.venue}
                  onChangeText={(text) => setForm({ ...form, venue: text })}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Domicile/Extérieur</Text>
                <View style={styles.homeAwayRow}>
                  <TouchableOpacity
                    style={[styles.homeAwayBtn, form.is_home && styles.homeAwayBtnActive]}
                    onPress={() => setForm({ ...form, is_home: true })}
                  >
                    <Text style={[styles.homeAwayText, form.is_home && styles.homeAwayTextActive]}>
                      🏠 Domicile
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.homeAwayBtn, !form.is_home && styles.homeAwayBtnActive]}
                    onPress={() => setForm({ ...form, is_home: false })}
                  >
                    <Text style={[styles.homeAwayText, !form.is_home && styles.homeAwayTextActive]}>
                      ✈️ Extérieur
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>



              <TouchableOpacity
                style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
                onPress={handleSave}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator color={COLORS.textWhite} />
                ) : (
                  <Text style={styles.saveBtnText}>
                    {editingMatch ? 'Enregistrer' : 'Ajouter'}
                  </Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => {
                  setModalVisible(false);
                  resetForm();
                }}
              >
                <Text style={styles.cancelBtnText}>Annuler</Text>
              </TouchableOpacity>
            </ScrollView>
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
    fontSize: 16,
    fontWeight: 'bold',
  },
  addButton: {
    color: COLORS.textWhite,
    fontSize: 14,
    fontWeight: '600',
  },
  list: {
    padding: SIZES.screenPadding,
  },
  matchCard: {
    backgroundColor: COLORS.card,
    borderRadius: SIZES.radiusMd,
    padding: 15,
    marginBottom: 12,
    ...SHADOWS.small,
  },
  matchHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  competition: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '600',
  },
  date: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  matchTeams: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 10,
  },
  teamContainer: {
    alignItems: 'center',
    flex: 1,
  },
  teamLogo: {
    width: 40,
    height: 40,
    marginBottom: 5,
    resizeMode: 'contain',
  },
  teamName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.text,
    textAlign: 'center',
  },
  vs: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginHorizontal: 10,
  },
  matchFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: 10,
  },
  venue: {
    fontSize: 12,
    color: COLORS.textSecondary,
    flex: 1,
  },
  matchActions: {
    flexDirection: 'row',
  },
  editBtn: {
    padding: 8,
  },
  deleteBtn: {
    padding: 8,
  },
  actionIcon: {
    fontSize: 18,
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
    maxHeight: '90%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 20,
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
  },
  competitionsScroll: {
    flexDirection: 'row',
  },
  competitionBtn: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginRight: 8,
  },
  competitionBtnActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  competitionText: {
    fontSize: 12,
    color: COLORS.text,
  },
  competitionTextActive: {
    color: COLORS.textWhite,
    fontWeight: 'bold',
  },
  homeAwayRow: {
    flexDirection: 'row',
    gap: 10,
  },
  homeAwayBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: SIZES.radiusMd,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
  },
  homeAwayBtnActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  homeAwayText: {
    fontSize: 14,
    color: COLORS.text,
  },
  homeAwayTextActive: {
    color: COLORS.textWhite,
    fontWeight: 'bold',
  },
  saveBtn: {
    backgroundColor: COLORS.primary,
    padding: 18,
    borderRadius: SIZES.radiusMd,
    alignItems: 'center',
    marginTop: 10,
    ...SHADOWS.medium,
  },
  saveBtnDisabled: {
    opacity: 0.6,
  },
  saveBtnText: {
    color: COLORS.textWhite,
    fontSize: 16,
    fontWeight: 'bold',
  },
  cancelBtn: {
    padding: 15,
    alignItems: 'center',
  },
  cancelBtnText: {
    color: COLORS.textSecondary,
    fontSize: 14,
  },
  logoUploadBtn: {
    alignSelf: 'center',
    marginBottom: 10,
  },
  uploadedLogo: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  placeholderLogo: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
    borderStyle: 'dashed',
  },
  placeholderLogoText: {
    fontSize: 30,
    color: COLORS.textLight,
  },
  loaderOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 40,
  },
});

export default AdminMatchesScreen;
