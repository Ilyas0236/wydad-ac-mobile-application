// ===========================================
// WYDAD AC - PROFILE SCREEN
// ===========================================

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Image,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { ticketsAPI, ordersAPI, uploadAPI } from '../services/api';
import { COLORS, SIZES, SHADOWS } from '../theme/colors';
import { useImagePicker } from '../hooks';

const ProfileScreen = ({ navigation }) => {
  const { user, logout, updateProfile, isLoading: authLoading } = useAuth();
  const [myTickets, setMyTickets] = useState([]);
  const [myOrders, setMyOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  // Hook pour sélection d'images
  const { showImagePickerOptions } = useImagePicker();

  // Rafraîchir les données à chaque fois que l'écran reçoit le focus
  useFocusEffect(
    useCallback(() => {
      if (user) {
        loadUserData();
      }
    }, [user])
  );

  const loadUserData = async () => {
    setIsLoading(true);
    try {
      const [ticketsRes, ordersRes] = await Promise.all([
        ticketsAPI.getMine(),
        ordersAPI.getMine(),
      ]);

      if (ticketsRes.success) setMyTickets(ticketsRes.data);
      if (ordersRes.success) setMyOrders(ordersRes.data);
    } catch (error) {
      console.error('Erreur chargement données:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Déconnexion',
      'Voulez-vous vraiment vous déconnecter?',
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Déconnexion', style: 'destructive', onPress: logout },
      ]
    );
  };

  // Fonction pour changer la photo de profil
  const handleChangeAvatar = async () => {
    const selectedImage = await showImagePickerOptions({
      aspect: [1, 1],
      quality: 0.8,
      allowsEditing: true,
    });

    if (selectedImage) {
      setUploadingAvatar(true);
      try {
        // Upload l'image
        const uploadResult = await uploadAPI.uploadImage(
          { uri: selectedImage.uri },
          'profiles'
        );

        if (uploadResult.success && uploadResult.data) {
          const avatarUrl = uploadAPI.getImageUrl(uploadResult.data.url);

          // Mettre à jour le profil avec la nouvelle URL
          const updateResult = await updateProfile({ avatar: avatarUrl });

          if (updateResult.success) {
            Alert.alert('Succès', 'Photo de profil mise à jour!');
          } else {
            Alert.alert('Erreur', updateResult.message || 'Erreur lors de la mise à jour');
          }
        }
      } catch (error) {
        console.error('Erreur changement avatar:', error);
        Alert.alert('Erreur', error.message || 'Impossible de changer la photo');
      } finally {
        setUploadingAvatar(false);
      }
    }
  };

  // Not logged in view
  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Mon Profil</Text>
        </View>

        <View style={styles.notLoggedContainer}>
          <Text style={styles.notLoggedIcon}>👤</Text>
          <Text style={styles.notLoggedTitle}>Connectez-vous</Text>
          <Text style={styles.notLoggedSubtitle}>
            Accédez à vos billets, commandes et informations personnelles
          </Text>

          <TouchableOpacity
            style={styles.loginBtn}
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={styles.loginBtnText}>Se connecter</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.registerBtn}
            onPress={() => navigation.navigate('Register')}
          >
            <Text style={styles.registerBtnText}>Créer un compte</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Mon Profil</Text>
        <TouchableOpacity onPress={handleLogout}>
          <Text style={styles.logoutBtn}>Déconnexion</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* User Card */}
        <View style={styles.userCard}>
          <TouchableOpacity
            style={styles.avatarContainer}
            onPress={handleChangeAvatar}
            disabled={uploadingAvatar}
          >
            {user.avatar ? (
              <Image source={{ uri: user.avatar }} style={styles.avatarImage} />
            ) : (
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {user.name?.charAt(0) || 'U'}
                </Text>
              </View>
            )}
            {uploadingAvatar ? (
              <View style={styles.avatarOverlay}>
                <ActivityIndicator color={COLORS.textWhite} />
              </View>
            ) : (
              <View style={styles.avatarEditBadge}>
                <Text style={styles.avatarEditIcon}>📷</Text>
              </View>
            )}
          </TouchableOpacity>
          <Text style={styles.userName}>
            {user.name || 'Utilisateur'}
          </Text>
          <Text style={styles.userEmail}>{user.email}</Text>

          {/* Member Badge */}
          <View style={styles.memberBadge}>
            <Text style={styles.memberText}>🏆 Membre WAC</Text>
          </View>
        </View>

        {/* Quick Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{myTickets.length}</Text>
            <Text style={styles.statLabel}>Billets</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{myOrders.length}</Text>
            <Text style={styles.statLabel}>Commandes</Text>
          </View>
        </View>

        {/* Menu Options */}
        <View style={styles.menuSection}>
          <Text style={styles.sectionTitle}>Mon compte</Text>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate('MyTickets')}
          >
            <Text style={styles.menuIcon}>🎟️</Text>
            <View style={styles.menuInfo}>
              <Text style={styles.menuTitle}>Mes billets</Text>
              <Text style={styles.menuSubtitle}>{myTickets.length} billet(s) achetés</Text>
            </View>
            <Text style={styles.menuArrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate('MyOrders')}
          >
            <Text style={styles.menuIcon}>📦</Text>
            <View style={styles.menuInfo}>
              <Text style={styles.menuTitle}>Mes commandes</Text>
              <Text style={styles.menuSubtitle}>{myOrders.length} commande(s)</Text>
            </View>
            <Text style={styles.menuArrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate('EditProfile')}
          >
            <Text style={styles.menuIcon}>✏️</Text>
            <View style={styles.menuInfo}>
              <Text style={styles.menuTitle}>Modifier mon profil</Text>
              <Text style={styles.menuSubtitle}>Informations personnelles</Text>
            </View>
            <Text style={styles.menuArrow}>›</Text>
          </TouchableOpacity>
        </View>

        {/* Support Section */}
        <View style={styles.menuSection}>
          <Text style={styles.sectionTitle}>Support</Text>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate('Complaints')}
          >
            <Text style={styles.menuIcon}>❓</Text>
            <View style={styles.menuInfo}>
              <Text style={styles.menuTitle}>Mes Réclamations</Text>
              <Text style={styles.menuSubtitle}>Questions / Problèmes</Text>
            </View>
            <Text style={styles.menuArrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => Linking.openURL('tel:+212522000000')}
          >
            <Text style={styles.menuIcon}>📞</Text>
            <View style={styles.menuInfo}>
              <Text style={styles.menuTitle}>Nous contacter</Text>
              <Text style={styles.menuSubtitle}>+212 522 00 00 00</Text>
            </View>
            <Text style={styles.menuArrow}>›</Text>
          </TouchableOpacity>
        </View>

        {/* App Info */}
        <View style={styles.appInfo}>
          <Text style={styles.appName}>Wydad AC Official App</Text>
          <Text style={styles.appVersion}>Version 1.0.0</Text>
          <Text style={styles.copyright}>© 2024 Wydad Athletic Club</Text>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SIZES.screenPadding,
    backgroundColor: COLORS.primary,
  },
  headerTitle: {
    color: COLORS.textWhite,
    fontSize: 18,
    fontWeight: 'bold',
  },
  logoutBtn: {
    color: COLORS.textWhite,
    fontSize: 14,
  },
  notLoggedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SIZES.screenPadding,
  },
  notLoggedIcon: {
    fontSize: 80,
    marginBottom: 20,
  },
  notLoggedTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 10,
  },
  notLoggedSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: 30,
    paddingHorizontal: 20,
  },
  loginBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: 15,
    paddingHorizontal: 50,
    borderRadius: SIZES.radiusMd,
    marginBottom: 15,
    ...SHADOWS.medium,
  },
  loginBtnText: {
    color: COLORS.textWhite,
    fontSize: 16,
    fontWeight: 'bold',
  },
  registerBtn: {
    paddingVertical: 15,
    paddingHorizontal: 50,
  },
  registerBtnText: {
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  userCard: {
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    paddingVertical: 30,
    paddingBottom: 40,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 15,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.card,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.medium,
  },
  avatarImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    ...SHADOWS.medium,
  },
  avatarText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  avatarOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarEditBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: COLORS.card,
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.primary,
    ...SHADOWS.small,
  },
  avatarEditIcon: {
    fontSize: 14,
  },
  userName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.textWhite,
    marginBottom: 5,
  },
  userEmail: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 15,
  },
  memberBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 15,
    paddingVertical: 6,
    borderRadius: 15,
  },
  memberText: {
    color: COLORS.textWhite,
    fontSize: 12,
    fontWeight: '600',
  },
  statsRow: {
    flexDirection: 'row',
    padding: SIZES.screenPadding,
    marginTop: -20,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.card,
    borderRadius: SIZES.radiusMd,
    padding: 20,
    alignItems: 'center',
    marginHorizontal: 5,
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
  menuSection: {
    padding: SIZES.screenPadding,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 15,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: SIZES.radiusMd,
    padding: 15,
    marginBottom: 10,
    ...SHADOWS.small,
  },
  menuIcon: {
    fontSize: 24,
    marginRight: 15,
  },
  menuInfo: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text,
  },
  menuSubtitle: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  menuArrow: {
    fontSize: 24,
    color: COLORS.textLight,
  },
  appInfo: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  appName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  appVersion: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 5,
  },
  copyright: {
    fontSize: 11,
    color: COLORS.textLight,
    marginTop: 5,
  },
  adminMenuItem: {
    borderWidth: 1,
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary + '10',
  },
});

export default ProfileScreen;
