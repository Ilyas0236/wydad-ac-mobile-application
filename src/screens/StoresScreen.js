// ===========================================
// WYDAD AC - STORES SCREEN (MAGASINS + MAP)
// ===========================================

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  Linking,
  Platform,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapView, { Marker, Callout, PROVIDER_GOOGLE } from 'react-native-maps';
import { storesAPI } from '../services/api';
import { COLORS, SIZES, SHADOWS } from '../theme/colors';

const StoresScreen = ({ navigation }) => {
  const [stores, setStores] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'map'
  const [selectedStore, setSelectedStore] = useState(null);
  const mapRef = useRef(null);

  // Région par défaut : Casablanca, Maroc
  const [region, setRegion] = useState({
    latitude: 33.5731,
    longitude: -7.5898,
    latitudeDelta: 0.5,
    longitudeDelta: 0.5,
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

  const openMaps = (store) => {
    const scheme = Platform.select({
      ios: 'maps:0,0?q=',
      android: 'geo:0,0?q=',
    });
    const latLng = `${store.latitude},${store.longitude}`;
    const label = encodeURIComponent(store.name);
    const url = Platform.select({
      ios: `${scheme}${label}@${latLng}`,
      android: `${scheme}${latLng}(${label})`,
    });

    Linking.openURL(url);
  };

  const callStore = (phone) => {
    Linking.openURL(`tel:${phone}`);
  };

  const emailStore = (email) => {
    Linking.openURL(`mailto:${email}`);
  };

  const renderStore = ({ item }) => (
    <TouchableOpacity
      style={[styles.storeCard, selectedStore?.id === item.id && styles.storeCardSelected]}
      onPress={() => setSelectedStore(selectedStore?.id === item.id ? null : item)}
    >
      {/* Store Icon */}
      <View style={styles.storeIcon}>
        <Text style={styles.iconText}>🏪</Text>
      </View>

      {/* Store Info */}
      <View style={styles.storeInfo}>
        <Text style={styles.storeName}>{item.name}</Text>
        <Text style={styles.storeAddress}>📍 {item.address}</Text>
        <Text style={styles.storeCity}>{item.city}</Text>
        
        {/* Opening Hours */}
        <View style={styles.hoursContainer}>
          <Text style={styles.hoursIcon}>🕐</Text>
          <Text style={styles.hoursText}>{item.opening_hours || '9h - 21h'}</Text>
        </View>
      </View>

      {/* Type Badge */}
      <View style={styles.typeBadge}>
        <Text style={styles.typeText}>
          {item.type === 'official' ? '⭐ Officiel' : '🏬 Revendeur'}
        </Text>
      </View>

      {/* Expanded Actions */}
      {selectedStore?.id === item.id && (
        <View style={styles.actionsContainer}>
          {item.phone && (
            <TouchableOpacity
              style={styles.actionBtn}
              onPress={() => callStore(item.phone)}
            >
              <Text style={styles.actionIcon}>📞</Text>
              <Text style={styles.actionText}>Appeler</Text>
            </TouchableOpacity>
          )}
          
          {item.email && (
            <TouchableOpacity
              style={styles.actionBtn}
              onPress={() => emailStore(item.email)}
            >
              <Text style={styles.actionIcon}>📧</Text>
              <Text style={styles.actionText}>Email</Text>
            </TouchableOpacity>
          )}
          
          <TouchableOpacity
            style={[styles.actionBtn, styles.actionBtnPrimary]}
            onPress={() => openMaps(item)}
          >
            <Text style={styles.actionIcon}>🗺️</Text>
            <Text style={[styles.actionText, styles.actionTextWhite]}>Itinéraire</Text>
          </TouchableOpacity>
        </View>
      )}
    </TouchableOpacity>
  );

  // Fonction pour centrer sur un magasin
  const focusOnStore = (store) => {
    if (mapRef.current && store.latitude && store.longitude) {
      mapRef.current.animateToRegion({
        latitude: parseFloat(store.latitude),
        longitude: parseFloat(store.longitude),
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      }, 500);
      setSelectedStore(store);
    }
  };

  // Vue Carte avec Google Maps
  const renderMapView = () => (
    <View style={styles.mapContainer}>
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        initialRegion={region}
        showsUserLocation={true}
        showsMyLocationButton={true}
        showsCompass={true}
        toolbarEnabled={true}
      >
        {stores.map((store) => (
          store.latitude && store.longitude && (
            <Marker
              key={store.id}
              coordinate={{
                latitude: parseFloat(store.latitude),
                longitude: parseFloat(store.longitude),
              }}
              title={store.name}
              description={store.address}
              pinColor={store.type === 'official' ? COLORS.primary : COLORS.secondary}
              onPress={() => setSelectedStore(store)}
            >
              <Callout onPress={() => openMaps(store)}>
                <View style={styles.calloutContainer}>
                  <Text style={styles.calloutTitle}>{store.name}</Text>
                  <Text style={styles.calloutAddress}>{store.address}</Text>
                  <Text style={styles.calloutCity}>{store.city}</Text>
                  <Text style={styles.calloutType}>
                    {store.type === 'official' ? 'Magasin Officiel' : 'Revendeur Agréé'}
                  </Text>
                  <Text style={styles.calloutAction}>Appuyer pour itinéraire</Text>
                </View>
              </Callout>
            </Marker>
          )
        ))}
      </MapView>

      {/* Liste rapide des magasins en bas */}
      <View style={styles.mapStoreList}>
        <FlatList
          horizontal
          data={stores}
          keyExtractor={(item) => item.id.toString()}
          showsHorizontalScrollIndicator={false}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.mapStoreCard,
                selectedStore?.id === item.id && styles.mapStoreCardSelected
              ]}
              onPress={() => focusOnStore(item)}
            >
              <Text style={styles.mapStoreName} numberOfLines={1}>{item.name}</Text>
              <Text style={styles.mapStoreCity}>{item.city}</Text>
              <View style={styles.mapStoreBadge}>
                <Text style={styles.mapStoreBadgeText}>
                  {item.type === 'official' ? 'Officiel' : 'Revendeur'}
                </Text>
              </View>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* Bouton pour afficher tous les magasins */}
      <TouchableOpacity
        style={styles.fitAllButton}
        onPress={() => {
          if (mapRef.current && stores.length > 0) {
            const coordinates = stores
              .filter(s => s.latitude && s.longitude)
              .map(s => ({
                latitude: parseFloat(s.latitude),
                longitude: parseFloat(s.longitude),
              }));
            if (coordinates.length > 0) {
              mapRef.current.fitToCoordinates(coordinates, {
                edgePadding: { top: 50, right: 50, bottom: 150, left: 50 },
                animated: true,
              });
            }
          }
        }}
      >
        <Text style={styles.fitAllButtonText}>Voir tous</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Magasins WAC</Text>
        <View style={{ width: 30 }} />
      </View>

      {/* View Toggle */}
      <View style={styles.toggleContainer}>
        <TouchableOpacity
          style={[styles.toggleBtn, viewMode === 'list' && styles.toggleBtnActive]}
          onPress={() => setViewMode('list')}
        >
          <Text style={[styles.toggleText, viewMode === 'list' && styles.toggleTextActive]}>
            📋 Liste
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.toggleBtn, viewMode === 'map' && styles.toggleBtnActive]}
          onPress={() => setViewMode('map')}
        >
          <Text style={[styles.toggleText, viewMode === 'map' && styles.toggleTextActive]}>
            🗺️ Carte
          </Text>
        </TouchableOpacity>
      </View>

      {viewMode === 'map' ? (
        renderMapView()
      ) : (
        <FlatList
          data={stores}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderStore}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />
          }
          ListHeaderComponent={
            <Text style={styles.storeCount}>
              {stores.length} magasins disponibles
            </Text>
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>🏪</Text>
              <Text style={styles.emptyText}>Aucun magasin trouvé</Text>
            </View>
          }
        />
      )}
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
  toggleContainer: {
    flexDirection: 'row',
    padding: SIZES.screenPadding,
    backgroundColor: COLORS.card,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  toggleBtn: {
    flex: 1,
    padding: 12,
    alignItems: 'center',
    borderRadius: SIZES.radiusMd,
    marginHorizontal: 5,
  },
  toggleBtnActive: {
    backgroundColor: COLORS.primary,
  },
  toggleText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  toggleTextActive: {
    color: COLORS.textWhite,
  },
  list: {
    padding: SIZES.screenPadding,
  },
  storeCount: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 15,
  },
  storeCard: {
    backgroundColor: COLORS.card,
    borderRadius: SIZES.radiusMd,
    padding: 15,
    marginBottom: 15,
    borderWidth: 2,
    borderColor: 'transparent',
    ...SHADOWS.small,
  },
  storeCardSelected: {
    borderColor: COLORS.primary,
  },
  storeIcon: {
    position: 'absolute',
    top: 15,
    left: 15,
    width: 50,
    height: 50,
    backgroundColor: COLORS.primary + '20',
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconText: {
    fontSize: 24,
  },
  storeInfo: {
    marginLeft: 65,
    paddingRight: 60,
  },
  storeName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 5,
  },
  storeAddress: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginBottom: 3,
  },
  storeCity: {
    fontSize: 12,
    color: COLORS.textLight,
    marginBottom: 8,
  },
  hoursContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  hoursIcon: {
    fontSize: 12,
    marginRight: 5,
  },
  hoursText: {
    fontSize: 12,
    color: COLORS.success,
    fontWeight: '500',
  },
  typeBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: COLORS.background,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  typeText: {
    fontSize: 10,
    color: COLORS.text,
    fontWeight: '600',
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  actionBtn: {
    alignItems: 'center',
    padding: 10,
    borderRadius: SIZES.radiusMd,
    backgroundColor: COLORS.background,
    minWidth: 80,
  },
  actionBtnPrimary: {
    backgroundColor: COLORS.primary,
  },
  actionIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  actionText: {
    fontSize: 12,
    color: COLORS.text,
    fontWeight: '500',
  },
  actionTextWhite: {
    color: COLORS.textWhite,
  },
  mapContainer: {
    flex: 1,
  },
  map: {
    flex: 1,
    width: Dimensions.get('window').width,
  },
  calloutContainer: {
    padding: 10,
    minWidth: 200,
  },
  calloutTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 4,
  },
  calloutAddress: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  calloutCity: {
    fontSize: 11,
    color: COLORS.textLight,
    marginBottom: 4,
  },
  calloutType: {
    fontSize: 11,
    color: COLORS.primary,
    fontWeight: '600',
  },
  calloutAction: {
    fontSize: 10,
    color: COLORS.success,
    marginTop: 6,
    fontStyle: 'italic',
  },
  mapStoreList: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(255,255,255,0.95)',
    paddingVertical: 10,
    paddingHorizontal: 5,
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    ...SHADOWS.medium,
  },
  mapStoreCard: {
    backgroundColor: COLORS.card,
    borderRadius: SIZES.radiusMd,
    padding: 12,
    marginHorizontal: 5,
    minWidth: 140,
    borderWidth: 2,
    borderColor: 'transparent',
    ...SHADOWS.small,
  },
  mapStoreCardSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary + '10',
  },
  mapStoreName: {
    fontSize: 13,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 2,
  },
  mapStoreCity: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  mapStoreBadge: {
    backgroundColor: COLORS.primary + '20',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  mapStoreBadgeText: {
    fontSize: 9,
    color: COLORS.primary,
    fontWeight: '600',
  },
  fitAllButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    ...SHADOWS.small,
  },
  fitAllButtonText: {
    color: COLORS.textWhite,
    fontSize: 12,
    fontWeight: '600',
  },
  mapPlaceholder: {
    flex: 1,
    backgroundColor: COLORS.card,
    borderRadius: SIZES.radiusMd,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
    ...SHADOWS.small,
  },
  mapIcon: {
    fontSize: 80,
    marginBottom: 20,
  },
  mapText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 5,
  },
  mapSubtext: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 30,
  },
  citiesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 20,
  },
  cityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary + '20',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    margin: 5,
  },
  cityText: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '600',
    marginRight: 5,
  },
  cityCount: {
    fontSize: 11,
    color: COLORS.textWhite,
    fontWeight: 'bold',
    backgroundColor: COLORS.primary,
    width: 20,
    height: 20,
    borderRadius: 10,
    textAlign: 'center',
    lineHeight: 20,
  },
  mapNote: {
    fontSize: 12,
    color: COLORS.textLight,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 50,
  },
  emptyIcon: {
    fontSize: 50,
    marginBottom: 15,
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.textSecondary,
  },
});

export default StoresScreen;
