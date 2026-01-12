// ===========================================
// WYDAD AC - ADMIN PLAYERS SCREEN
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
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { playersAPI, uploadAPI } from '../../services/api';
import { COLORS, SIZES, SHADOWS } from '../../theme/colors';
import api from '../../services/api';
import { useImagePicker } from '../../hooks';

const POSITIONS = [
  { key: 'goalkeeper', label: '🧤 Gardien', emoji: '🧤' },
  { key: 'defender', label: '🛡️ Défenseur', emoji: '🛡️' },
  { key: 'midfielder', label: '⚽ Milieu', emoji: '⚽' },
  { key: 'forward', label: '⚡ Attaquant', emoji: '⚡' },
];

const AdminPlayersScreen = ({ navigation }) => {
  const [players, setPlayers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState(null);
  const [saving, setSaving] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [filterPosition, setFilterPosition] = useState('all');
  const [uploading, setUploading] = useState(false);
  const [localImageUri, setLocalImageUri] = useState(null);
  
  // Hook pour sélection d'images
  const { showImagePickerOptions, pickImageFromGallery, takePhoto } = useImagePicker();

  // Form state
  const [form, setForm] = useState({
    name: '',
    number: '',
    position: 'midfielder',
    nationality: 'Maroc',
    height: '',
    weight: '',
    image: '',
  });

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

  const resetForm = () => {
    setForm({
      name: '',
      number: '',
      position: 'midfielder',
      nationality: 'Maroc',
      height: '',
      weight: '',
      image: '',
    });
    setEditingPlayer(null);
    setImageError(false);
    setLocalImageUri(null);
  };

  const openAddModal = () => {
    resetForm();
    setModalVisible(true);
  };

  const openEditModal = (player) => {
    setEditingPlayer(player);
    setForm({
      name: player.name,
      number: player.number.toString(),
      position: player.position,
      nationality: player.nationality,
      height: player.height?.toString() || '',
      weight: player.weight?.toString() || '',
      image: player.image || '',
    });
    setImageError(false);
    setLocalImageUri(null);
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.number || !form.position) {
      Alert.alert('Erreur', 'Nom, numéro et position sont requis');
      return;
    }

    setSaving(true);
    try {
      let finalImageUrl = form.image;
      
      // Si une nouvelle image a été sélectionnée depuis la galerie, l'uploader
      if (localImageUri) {
        setUploading(true);
        try {
          const uploadResult = await uploadAPI.uploadImage(
            { uri: localImageUri },
            'players'
          );
          if (uploadResult.success && uploadResult.data) {
            finalImageUrl = uploadAPI.getImageUrl(uploadResult.data.url);
          }
        } catch (uploadError) {
          console.error('Erreur upload:', uploadError);
          Alert.alert('Attention', 'Photo non uploadée, mais le joueur sera créé sans photo');
        } finally {
          setUploading(false);
        }
      }
      
      const playerData = {
        name: form.name,
        number: parseInt(form.number),
        position: form.position,
        nationality: form.nationality,
        height: form.height ? parseInt(form.height) : null,
        weight: form.weight ? parseInt(form.weight) : null,
        image: finalImageUrl || null,
      };

      let response;
      if (editingPlayer) {
        response = await api.put(`/players/${editingPlayer.id}`, playerData);
      } else {
        response = await api.post('/players', playerData);
      }

      if (response.success) {
        Alert.alert('Succès', editingPlayer ? 'Joueur modifié!' : 'Joueur ajouté!');
        setModalVisible(false);
        resetForm();
        loadPlayers();
      } else {
        Alert.alert('Erreur', response.message);
      }
    } catch (error) {
      Alert.alert('Erreur', error.message || 'Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (player) => {
    Alert.alert(
      'Supprimer',
      `Voulez-vous supprimer ${player.name}?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await api.delete(`/players/${player.id}`);
              if (response.success) {
                Alert.alert('Succès', 'Joueur supprimé');
                loadPlayers();
              }
            } catch (error) {
              Alert.alert('Erreur', error.message);
            }
          },
        },
      ]
    );
  };

  const getPositionLabel = (position) => {
    const pos = POSITIONS.find(p => p.key === position);
    return pos?.label || position;
  };

  const getPositionEmoji = (position) => {
    const pos = POSITIONS.find(p => p.key === position);
    return pos?.emoji || '⚽';
  };

  const filteredPlayers = filterPosition === 'all'
    ? players
    : players.filter(p => p.position === filterPosition);

  const sortedPlayers = [...filteredPlayers].sort((a, b) => {
    const posOrder = { goalkeeper: 1, defender: 2, midfielder: 3, forward: 4 };
    return (posOrder[a.position] || 5) - (posOrder[b.position] || 5);
  });

  const renderPlayer = ({ item }) => (
    <View style={styles.playerCard}>
      <View style={styles.playerImageContainer}>
        {item.image ? (
          <Image source={{ uri: item.image }} style={styles.playerImage} />
        ) : (
          <View style={styles.playerNumber}>
            <Text style={styles.numberText}>{item.number}</Text>
          </View>
        )}
        {item.image && (
          <View style={styles.numberBadge}>
            <Text style={styles.numberBadgeText}>{item.number}</Text>
          </View>
        )}
      </View>
      <View style={styles.playerInfo}>
        <Text style={styles.playerName}>{item.name}</Text>
        <Text style={styles.playerPosition}>
          {getPositionEmoji(item.position)} {getPositionLabel(item.position).replace(/^[^\s]+\s/, '')} • {item.nationality}
        </Text>
        {(item.height || item.weight) && (
          <Text style={styles.physicalInfo}>
            {item.height && `${item.height}cm`}{item.height && item.weight && ' | '}{item.weight && `${item.weight}kg`}
          </Text>
        )}
      </View>
      <View style={styles.playerActions}>
        <TouchableOpacity style={styles.editBtn} onPress={() => openEditModal(item)}>
          <Text style={styles.actionIcon}>✏️</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDelete(item)}>
          <Text style={styles.actionIcon}>🗑️</Text>
        </TouchableOpacity>
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
        <Text style={styles.headerTitle}>⚽ Gestion Joueurs</Text>
        <TouchableOpacity onPress={openAddModal}>
          <Text style={styles.addButton}>+ Ajouter</Text>
        </TouchableOpacity>
      </View>

      {/* Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{players.length}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
        {POSITIONS.map(pos => (
          <View key={pos.key} style={styles.statItem}>
            <Text style={styles.statNumber}>
              {players.filter(p => p.position === pos.key).length}
            </Text>
            <Text style={styles.statLabel}>{pos.emoji}</Text>
          </View>
        ))}
      </View>

      {/* Filters */}
      <View style={styles.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <TouchableOpacity
            style={[styles.filterBtn, filterPosition === 'all' && styles.filterBtnActive]}
            onPress={() => setFilterPosition('all')}
          >
            <Text style={[styles.filterText, filterPosition === 'all' && styles.filterTextActive]}>
              Tous ({players.length})
            </Text>
          </TouchableOpacity>
          {POSITIONS.map(pos => (
            <TouchableOpacity
              key={pos.key}
              style={[styles.filterBtn, filterPosition === pos.key && styles.filterBtnActive]}
              onPress={() => setFilterPosition(pos.key)}
            >
              <Text style={[styles.filterText, filterPosition === pos.key && styles.filterTextActive]}>
                {pos.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <FlatList
        data={sortedPlayers}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderPlayer}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />
        }
        ListEmptyComponent={
          isLoading ? (
            <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 50 }} />
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>⚽</Text>
              <Text style={styles.emptyText}>Aucun joueur dans cette catégorie</Text>
            </View>
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
                {editingPlayer ? '✏️ Modifier joueur' : '➕ Ajouter joueur'}
              </Text>

              {/* Photo Preview */}
              <View style={styles.photoSection}>
                <TouchableOpacity 
                  style={styles.photoPreview}
                  onPress={async () => {
                    const selectedImage = await showImagePickerOptions({ aspect: [1, 1], quality: 0.8 });
                    if (selectedImage) {
                      setLocalImageUri(selectedImage.uri);
                      setImageError(false);
                    }
                  }}
                >
                  {(localImageUri || form.image) && !imageError ? (
                    <Image 
                      source={{ uri: localImageUri || form.image }} 
                      style={styles.previewImage}
                      onError={() => setImageError(true)}
                    />
                  ) : (
                    <View style={styles.noPhotoPreview}>
                      <Text style={styles.noPhotoIcon}>👤</Text>
                      <Text style={styles.noPhotoText}>Touchez pour ajouter</Text>
                    </View>
                  )}
                  {uploading && (
                    <View style={styles.uploadOverlay}>
                      <ActivityIndicator size="large" color={COLORS.textWhite} />
                      <Text style={styles.uploadText}>Upload...</Text>
                    </View>
                  )}
                </TouchableOpacity>
                
                {/* Boutons de sélection de photo */}
                <View style={styles.photoButtonsRow}>
                  <TouchableOpacity 
                    style={styles.photoButton}
                    onPress={async () => {
                      const selectedImage = await pickImageFromGallery({ aspect: [1, 1], quality: 0.8 });
                      if (selectedImage) {
                        setLocalImageUri(selectedImage.uri);
                        setImageError(false);
                      }
                    }}
                  >
                    <Text style={styles.photoButtonIcon}>🖼️</Text>
                    <Text style={styles.photoButtonText}>Galerie</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={styles.photoButton}
                    onPress={async () => {
                      const selectedImage = await takePhoto({ aspect: [1, 1], quality: 0.8 });
                      if (selectedImage) {
                        setLocalImageUri(selectedImage.uri);
                        setImageError(false);
                      }
                    }}
                  >
                    <Text style={styles.photoButtonIcon}>📷</Text>
                    <Text style={styles.photoButtonText}>Caméra</Text>
                  </TouchableOpacity>
                  
                  {(localImageUri || form.image) && (
                    <TouchableOpacity 
                      style={[styles.photoButton, styles.removePhotoButton]}
                      onPress={() => {
                        setLocalImageUri(null);
                        setForm({ ...form, image: '' });
                        setImageError(false);
                      }}
                    >
                      <Text style={styles.photoButtonIcon}>🗑️</Text>
                      <Text style={styles.photoButtonText}>Supprimer</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Ou URL Photo externe</Text>
                <TextInput
                  style={styles.input}
                  placeholder="https://exemple.com/photo.jpg"
                  placeholderTextColor={COLORS.textLight}
                  value={form.image}
                  onChangeText={(text) => {
                    setForm({ ...form, image: text });
                    setLocalImageUri(null);
                    setImageError(false);
                  }}
                />
                <Text style={styles.inputHint}>💡 Ou collez un lien externe vers la photo</Text>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Nom complet *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Nom du joueur"
                  placeholderTextColor={COLORS.textLight}
                  value={form.name}
                  onChangeText={(text) => setForm({ ...form, name: text })}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Numéro *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Numéro de maillot"
                  placeholderTextColor={COLORS.textLight}
                  value={form.number}
                  onChangeText={(text) => setForm({ ...form, number: text })}
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Position *</Text>
                <View style={styles.positionsRow}>
                  {POSITIONS.map((pos) => (
                    <TouchableOpacity
                      key={pos.key}
                      style={[
                        styles.positionBtn,
                        form.position === pos.key && styles.positionBtnActive,
                      ]}
                      onPress={() => setForm({ ...form, position: pos.key })}
                    >
                      <Text
                        style={[
                          styles.positionText,
                          form.position === pos.key && styles.positionTextActive,
                        ]}
                      >
                        {pos.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Nationalité</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Pays"
                  placeholderTextColor={COLORS.textLight}
                  value={form.nationality}
                  onChangeText={(text) => setForm({ ...form, nationality: text })}
                />
              </View>

              <View style={styles.rowInputs}>
                <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
                  <Text style={styles.inputLabel}>Taille (cm)</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="180"
                    placeholderTextColor={COLORS.textLight}
                    value={form.height}
                    onChangeText={(text) => setForm({ ...form, height: text })}
                    keyboardType="numeric"
                  />
                </View>
                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={styles.inputLabel}>Poids (kg)</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="75"
                    placeholderTextColor={COLORS.textLight}
                    value={form.weight}
                    onChangeText={(text) => setForm({ ...form, weight: text })}
                    keyboardType="numeric"
                  />
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
                    {editingPlayer ? 'Enregistrer' : 'Ajouter'}
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
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.card,
    padding: 15,
    justifyContent: 'space-around',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  filterContainer: {
    backgroundColor: COLORS.card,
    paddingVertical: 10,
    paddingHorizontal: 5,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  filterBtn: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.background,
    marginHorizontal: 5,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  filterBtnActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filterText: {
    fontSize: 12,
    color: COLORS.text,
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
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: SIZES.radiusMd,
    padding: 12,
    marginBottom: 10,
    ...SHADOWS.small,
  },
  playerImageContainer: {
    position: 'relative',
  },
  playerImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.background,
  },
  numberBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: COLORS.primary,
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.card,
  },
  numberBadgeText: {
    color: COLORS.textWhite,
    fontSize: 10,
    fontWeight: 'bold',
  },
  playerNumber: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  numberText: {
    color: COLORS.textWhite,
    fontSize: 18,
    fontWeight: 'bold',
  },
  playerInfo: {
    flex: 1,
    marginLeft: 12,
  },
  playerName: {
    fontSize: 15,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  playerPosition: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  physicalInfo: {
    fontSize: 11,
    color: COLORS.textLight,
    marginTop: 2,
  },
  playerActions: {
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
  emptyContainer: {
    alignItems: 'center',
    marginTop: 50,
  },
  emptyIcon: {
    fontSize: 60,
    marginBottom: 10,
  },
  emptyText: {
    textAlign: 'center',
    color: COLORS.textSecondary,
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
    maxHeight: '95%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 20,
  },
  photoSection: {
    alignItems: 'center',
    marginBottom: 15,
  },
  photoPreview: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: COLORS.primary,
  },
  previewImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  noPhotoPreview: {
    alignItems: 'center',
  },
  noPhotoIcon: {
    fontSize: 30,
    marginBottom: 2,
  },
  noPhotoText: {
    fontSize: 10,
    color: COLORS.textSecondary,
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
  inputHint: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 5,
  },
  rowInputs: {
    flexDirection: 'row',
  },
  positionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  positionBtn: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  positionBtnActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  positionText: {
    fontSize: 13,
    color: COLORS.text,
  },
  positionTextActive: {
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
  // Styles pour les boutons de photo
  photoButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
    gap: 10,
  },
  photoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: SIZES.radiusSm,
    gap: 5,
  },
  removePhotoButton: {
    backgroundColor: COLORS.error || '#dc3545',
  },
  photoButtonIcon: {
    fontSize: 16,
  },
  photoButtonText: {
    color: COLORS.textWhite,
    fontSize: 12,
    fontWeight: '600',
  },
  uploadOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 50,
  },
  uploadText: {
    color: COLORS.textWhite,
    marginTop: 10,
    fontSize: 14,
  },
});

export default AdminPlayersScreen;
