// ===========================================
// WYDAD AC - PROFILE SCREEN
// ===========================================

import React, { useContext, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AuthContext } from '../context/AuthContext';
import { ticketsAPI, ordersAPI } from '../services/api';
import { COLORS, SIZES, SHADOWS } from '../theme/colors';

const ProfileScreen = ({ navigation }) => {
  const { user, logout, isLoading: authLoading } = useContext(AuthContext);
  const [myTickets, setMyTickets] = useState([]);
  const [myOrders, setMyOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user) {
      loadUserData();
    }
  }, [user]);

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
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user.first_name?.charAt(0)}{user.last_name?.charAt(0)}
            </Text>
          </View>
          <Text style={styles.userName}>
            {user.first_name} {user.last_name}
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

          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuIcon}>❓</Text>
            <View style={styles.menuInfo}>
              <Text style={styles.menuTitle}>FAQ</Text>
              <Text style={styles.menuSubtitle}>Questions fréquentes</Text>
            </View>
            <Text style={styles.menuArrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuIcon}>📞</Text>
            <View style={styles.menuInfo}>
              <Text style={styles.menuTitle}>Nous contacter</Text>
              <Text style={styles.menuSubtitle}>support@wac.ma</Text>
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
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.card,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
    ...SHADOWS.medium,
  },
  avatarText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.primary,
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
});

export default ProfileScreen;
