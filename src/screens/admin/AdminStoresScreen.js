// ===========================================
// WYDAD AC - ADMIN STORES SCREEN
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
  Dimensions,
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { SafeAreaView } from 'react-native-safe-area-context';
import { storesAPI } from '../../services/api';
import { COLORS, SIZES, SHADOWS } from '../../theme/colors';
import api from '../../services/api';

const AdminStoresScreen = ({ navigation }) => {
  const [stores, setStores] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingStore, setEditingStore] = useState(null);
  const [saving, setSaving] = useState(false);

  // Form state
  const [form, setForm] = useState({
    name: '',
    address: '',
    city: 'Casablanca',
    phone: '',
    opening_hours: '09:00 - 21:00',
    latitude: '',
    longitude: '',
  });

  useEffect(() => {
    loadStores();
  }, []);

  const loadStores = async () => {
    try {
      const response = await storesAPI.getAll();
      if (response.success) {
        setStores(response.data);
      }
    } catch (error) {
      console.error('Erreur chargement magasins:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadStores();
    setRefreshing(false);
  };

  const resetForm = () => {
    setForm({
      name: '',
      address: '',
      city: 'Casablanca',
      phone: '',
      opening_hours: '09:00 - 21:00',
      latitude: '',
      longitude: '',
    });
    setEditingStore(null);
  };

  const openAddModal = () => {
    resetForm();
    setModalVisible(true);
  };

  const openEditModal = (store) => {
    setEditingStore(store);
    setForm({
      name: store.name,
      address: store.address || '',
      city: store.city || 'Casablanca',
      phone: store.phone || '',
      opening_hours: store.opening_hours || '09:00 - 21:00',
      latitude: store.latitude?.toString() || '',
      longitude: store.longitude?.toString() || '',
    });
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.address || !form.city) {
      Alert.alert('Erreur', 'Nom, adresse et ville sont requis');
      return;
    }

    setSaving(true);
    try {
      const storeData = {
        name: form.name,
        address: form.address,
        city: form.city,
        phone: form.phone,
        opening_hours: form.opening_hours,
        latitude: form.latitude ? parseFloat(form.latitude) : null,
        longitude: form.longitude ? parseFloat(form.longitude) : null,
      };

      let response;
      if (editingStore) {
        response = await api.put(`/stores/${editingStore.id}`, storeData);
      } else {
        response = await api.post('/stores', storeData);
      }

      if (response.success) {
        Alert.alert('Succès', editingStore ? 'Magasin modifié!' : 'Magasin ajouté!');
        setModalVisible(false);
        resetForm();
        loadStores();
      } else {
        Alert.alert('Erreur', response.message);
      }
    } catch (error) {
      Alert.alert('Erreur', error.message || 'Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (store) => {
    Alert.alert(
      'Supprimer',
      `Voulez-vous supprimer "${store.name}"?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await api.delete(`/stores/${store.id}`);
              if (response.success) {
                Alert.alert('Succès', 'Magasin supprimé');
                loadStores();
              }
            } catch (error) {
              Alert.alert('Erreur', error.message);
            }
          },
        },
      ]
    );
  };

  const renderStore = ({ item }) => (
    <View style={styles.storeCard}>
      <View style={styles.storeIcon}>
        <Text style={styles.iconText}>🏪</Text>
      </View>
      <View style={styles.storeInfo}>
        <Text style={styles.storeName}>{item.name}</Text>
        <Text style={styles.storeAddress}>📍 {item.address}</Text>
        <View style={styles.storeDetails}>
          <Text style={styles.storeCity}>{item.city}</Text>
          {item.phone && <Text style={styles.storePhone}>📞 {item.phone}</Text>}
        </View>
        {item.opening_hours && (
          <Text style={styles.storeHours}>🕐 {item.opening_hours}</Text>
        )}
      </View>
      {item.latitude && item.longitude && (
        <View style={styles.mapContainer}>
          <MapView
            style={styles.map}
            initialRegion={{
              latitude: parseFloat(item.latitude),
              longitude: parseFloat(item.longitude),
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            }}
            scrollEnabled={false}
            zoomEnabled={false}
          >
            <Marker
              coordinate={{
                latitude: parseFloat(item.latitude),
                longitude: parseFloat(item.longitude),
              }}
              title={item.name}
            />
          </MapView>
        </View>
      )}
      <View style={styles.storeActions}>
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
        <Text style={styles.headerTitle}>🏪 Gestion Magasins</Text>
        <TouchableOpacity onPress={openAddModal}>
          <Text style={styles.addButton}>+ Ajouter</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={stores}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderStore}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />
        }
        ListEmptyComponent={
          isLoading ? (
            <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 50 }} />
          ) : (
            <Text style={styles.emptyText}>Aucun magasin</Text>
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
                {editingStore ? '✏️ Modifier magasin' : '➕ Ajouter magasin'}
              </Text>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Nom du magasin *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="WAC Store - Morocco Mall"
                  placeholderTextColor={COLORS.textLight}
                  value={form.name}
                  onChangeText={(text) => setForm({ ...form, name: text })}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Adresse *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Adresse complète"
                  placeholderTextColor={COLORS.textLight}
                  value={form.address}
                  onChangeText={(text) => setForm({ ...form, address: text })}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Ville *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Casablanca"
                  placeholderTextColor={COLORS.textLight}
                  value={form.city}
                  onChangeText={(text) => setForm({ ...form, city: text })}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Téléphone</Text>
                <TextInput
                  style={styles.input}
                  placeholder="+212 5XX XXX XXX"
                  placeholderTextColor={COLORS.textLight}
                  value={form.phone}
                  onChangeText={(text) => setForm({ ...form, phone: text })}
                  keyboardType="phone-pad"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Horaires d'ouverture</Text>
                <TextInput
                  style={styles.input}
                  placeholder="09:00 - 21:00"
                  placeholderTextColor={COLORS.textLight}
                  value={form.opening_hours}
                  onChangeText={(text) => setForm({ ...form, opening_hours: text })}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Localisation (Toucher sur la carte)</Text>
                <View style={styles.mapPickerContainer}>
                  <MapView
                    style={styles.mapPicker}
                    initialRegion={{
                      latitude: form.latitude ? parseFloat(form.latitude) : 33.5731,
                      longitude: form.longitude ? parseFloat(form.longitude) : -7.5898,
                      latitudeDelta: 0.0922,
                      longitudeDelta: 0.0421,
                    }}
                    onPress={(e) => {
                      setForm({
                        ...form,
                        latitude: e.nativeEvent.coordinate.latitude.toFixed(6),
                        longitude: e.nativeEvent.coordinate.longitude.toFixed(6),
                      });
                    }}
                  >
                    {form.latitude && form.longitude && (
                      <Marker
                        coordinate={{
                          latitude: parseFloat(form.latitude),
                          longitude: parseFloat(form.longitude),
                        }}
                        draggable
                        onDragEnd={(e) => {
                          setForm({
                            ...form,
                            latitude: e.nativeEvent.coordinate.latitude.toFixed(6),
                            longitude: e.nativeEvent.coordinate.longitude.toFixed(6),
                          });
                        }}
                      />
                    )}
                  </MapView>
                </View>
              </View>

              <View style={styles.rowInputs}>
                <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
                  <Text style={styles.inputLabel}>Latitude</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="33.5731"
                    placeholderTextColor={COLORS.textLight}
                    value={form.latitude}
                    onChangeText={(text) => setForm({ ...form, latitude: text })}
                    keyboardType="numeric"
                  />
                </View>
                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={styles.inputLabel}>Longitude</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="-7.5898"
                    placeholderTextColor={COLORS.textLight}
                    value={form.longitude}
                    onChangeText={(text) => setForm({ ...form, longitude: text })}
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
                    {editingStore ? 'Enregistrer' : 'Ajouter'}
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
  storeCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: COLORS.card,
    borderRadius: SIZES.radiusMd,
    padding: 15,
    marginBottom: 12,
    ...SHADOWS.small,
  },
  storeIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconText: {
    fontSize: 24,
  },
  storeInfo: {
    flex: 1,
    marginLeft: 12,
  },
  storeName: {
    fontSize: 15,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 4,
  },
  storeAddress: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  storeDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  storeCity: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '500',
  },
  storePhone: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  storeHours: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  storeActions: {
    flexDirection: 'column',
    justifyContent: 'center',
  },
  mapContainer: {
    height: 100,
    width: '100%',
    marginTop: 10,
    borderRadius: SIZES.radiusSm,
    overflow: 'hidden',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
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
});

export default AdminStoresScreen;
