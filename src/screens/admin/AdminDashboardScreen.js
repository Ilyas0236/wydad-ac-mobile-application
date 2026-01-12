// ===========================================
// WYDAD AC - ADMIN DASHBOARD SCREEN PRO
// ===========================================

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { COLORS, SIZES, SHADOWS } from '../../theme/colors';

const { width } = Dimensions.get('window');

const AdminDashboardScreen = ({ navigation }) => {
  const { user, logout } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // Statistiques
  const [stats, setStats] = useState({
    users: { total: 0, active: 0, new: 0 },
    orders: { total: 0, pending: 0, confirmed: 0, paid: 0, shipped: 0, delivered: 0, cancelled: 0, revenue: 0 },
    tickets: { total: 0, pending: 0, paid: 0 },
    products: { total: 0, lowStock: 0 },
    players: { total: 0 },
    matches: { total: 0, upcoming: 0 },
    news: { total: 0 },
  });
  
  // Derniers utilisateurs
  const [recentUsers, setRecentUsers] = useState([]);
  // Dernières commandes
  const [recentOrders, setRecentOrders] = useState([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      // Charger les statistiques depuis l'API admin
      const [statsRes, usersRes, ordersRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/users?limit=5'),
        api.get('/admin/orders?limit=5'),
      ]);

      if (statsRes.success) {
        setStats(statsRes.data);
      }
      if (usersRes.success) {
        setRecentUsers(usersRes.data || []);
      }
      if (ordersRes.success) {
        setRecentOrders(ordersRes.data || []);
      }
    } catch (error) {
      console.error('Erreur chargement dashboard:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
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

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-MA', {
      style: 'decimal',
      minimumFractionDigits: 0,
    }).format(amount || 0) + ' MAD';
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: COLORS.statusPending,
      confirmed: COLORS.statusConfirmed,
      paid: COLORS.statusPaid,
      shipped: COLORS.statusShipped,
      delivered: COLORS.statusDelivered,
      cancelled: COLORS.statusCancelled,
    };
    return colors[status] || COLORS.textSecondary;
  };

  const getStatusLabel = (status) => {
    const labels = {
      pending: 'En attente',
      confirmed: 'Confirmée',
      paid: 'Payée',
      shipped: 'Expédiée',
      delivered: 'Livrée',
      cancelled: 'Annulée',
    };
    return labels[status] || status;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Composant carte statistique
  const StatCard = ({ icon, label, value, subValue, color, onPress }) => (
    <TouchableOpacity 
      style={[styles.statCard, { borderLeftColor: color }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.statIconContainer, { backgroundColor: color + '15' }]}>
        <Text style={styles.statIcon}>{icon}</Text>
      </View>
      <View style={styles.statContent}>
        <Text style={styles.statValue}>{value}</Text>
        <Text style={styles.statLabel}>{label}</Text>
        {subValue && <Text style={styles.statSubValue}>{subValue}</Text>}
      </View>
    </TouchableOpacity>
  );

  // Composant barre de progression des commandes
  const OrderStatusBar = ({ status, count, total, color }) => {
    const percentage = total > 0 ? (count / total) * 100 : 0;
    return (
      <View style={styles.orderStatusItem}>
        <View style={styles.orderStatusHeader}>
          <View style={[styles.orderStatusDot, { backgroundColor: color }]} />
          <Text style={styles.orderStatusLabel}>{getStatusLabel(status)}</Text>
          <Text style={styles.orderStatusCount}>{count}</Text>
        </View>
        <View style={styles.orderStatusBarBg}>
          <View style={[styles.orderStatusBarFill, { width: `${percentage}%`, backgroundColor: color }]} />
        </View>
      </View>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Chargement...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header avec gradient */}
      <LinearGradient
        colors={[COLORS.gradientStart, COLORS.gradientEnd]}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.headerGreeting}>Bonjour,</Text>
            <Text style={styles.headerName}>{user?.name || user?.username || 'Admin'}</Text>
          </View>
          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
            <Text style={styles.logoutIcon}>🚪</Text>
          </TouchableOpacity>
        </View>
        
        {/* Revenue Card */}
        <View style={styles.revenueCard}>
          <View style={styles.revenueInfo}>
            <Text style={styles.revenueLabel}>Chiffre d'affaires total</Text>
            <Text style={styles.revenueAmount}>{formatCurrency(stats.orders?.revenue)}</Text>
          </View>
          <View style={styles.revenueBadge}>
            <Text style={styles.revenueBadgeText}>💰</Text>
          </View>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />
        }
      >
        {/* Section Statistiques principales */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📊 Vue d'ensemble</Text>
          <View style={styles.statsGrid}>
            <StatCard
              icon="👥"
              label="Utilisateurs"
              value={stats.users?.total || 0}
              subValue={`+${stats.users?.new || 0} ce mois`}
              color={COLORS.info}
            />
            <StatCard
              icon="📦"
              label="Commandes"
              value={stats.orders?.total || 0}
              subValue={`${stats.orders?.pending || 0} en attente`}
              color={COLORS.warning}
            />
            <StatCard
              icon="🎟️"
              label="Tickets"
              value={stats.tickets?.total || 0}
              subValue={`${stats.tickets?.paid || 0} payés`}
              color={COLORS.success}
            />
            <StatCard
              icon="🛍️"
              label="Produits"
              value={stats.products?.total || 0}
              subValue={`${stats.products?.lowStock || 0} stock bas`}
              color={COLORS.primary}
            />
          </View>
        </View>

        {/* Section État des commandes */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🛒 État des commandes</Text>
          <View style={styles.ordersCard}>
            <View style={styles.ordersHeader}>
              <Text style={styles.ordersTotal}>{stats.orders?.total || 0}</Text>
              <Text style={styles.ordersTotalLabel}>commandes totales</Text>
            </View>
            <View style={styles.orderStatusList}>
              <OrderStatusBar status="pending" count={stats.orders?.pending || 0} total={stats.orders?.total || 1} color={COLORS.statusPending} />
              <OrderStatusBar status="confirmed" count={stats.orders?.confirmed || 0} total={stats.orders?.total || 1} color={COLORS.statusConfirmed} />
              <OrderStatusBar status="paid" count={stats.orders?.paid || 0} total={stats.orders?.total || 1} color={COLORS.statusPaid} />
              <OrderStatusBar status="shipped" count={stats.orders?.shipped || 0} total={stats.orders?.total || 1} color={COLORS.statusShipped} />
              <OrderStatusBar status="delivered" count={stats.orders?.delivered || 0} total={stats.orders?.total || 1} color={COLORS.statusDelivered} />
              <OrderStatusBar status="cancelled" count={stats.orders?.cancelled || 0} total={stats.orders?.total || 1} color={COLORS.statusCancelled} />
            </View>
          </View>
        </View>

        {/* Section Derniers utilisateurs */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>👤 Derniers utilisateurs</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllBtn}>Voir tout →</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.usersCard}>
            {recentUsers.length > 0 ? (
              recentUsers.map((user, index) => (
                <View key={user.id || index} style={[styles.userItem, index < recentUsers.length - 1 && styles.userItemBorder]}>
                  <View style={styles.userAvatar}>
                    <Text style={styles.userAvatarText}>
                      {user.name?.charAt(0).toUpperCase() || '?'}
                    </Text>
                  </View>
                  <View style={styles.userInfo}>
                    <Text style={styles.userName}>{user.name || 'Utilisateur'}</Text>
                    <Text style={styles.userEmail}>{user.email}</Text>
                  </View>
                  <View style={styles.userMeta}>
                    <Text style={styles.userDate}>{formatDate(user.created_at)}</Text>
                    <View style={[styles.userStatus, { backgroundColor: user.is_active !== false ? COLORS.successLight : COLORS.errorLight }]}>
                      <Text style={[styles.userStatusText, { color: user.is_active !== false ? COLORS.success : COLORS.error }]}>
                        {user.is_active !== false ? 'Actif' : 'Inactif'}
                      </Text>
                    </View>
                  </View>
                </View>
              ))
            ) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyIcon}>👥</Text>
                <Text style={styles.emptyText}>Aucun utilisateur récent</Text>
              </View>
            )}
          </View>
        </View>

        {/* Section Dernières commandes */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>📦 Dernières commandes</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllBtn}>Voir tout →</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.ordersListCard}>
            {recentOrders.length > 0 ? (
              recentOrders.map((order, index) => (
                <View key={order.id || index} style={[styles.orderItem, index < recentOrders.length - 1 && styles.orderItemBorder]}>
                  <View style={styles.orderLeft}>
                    <Text style={styles.orderNumber}>#{order.order_number || order.id}</Text>
                    <Text style={styles.orderUser}>{order.user_name || 'Client'}</Text>
                  </View>
                  <View style={styles.orderCenter}>
                    <Text style={styles.orderAmount}>{formatCurrency(order.total_amount)}</Text>
                    <Text style={styles.orderDate}>{formatDate(order.created_at)}</Text>
                  </View>
                  <View style={[styles.orderStatusBadge, { backgroundColor: getStatusColor(order.status) + '20' }]}>
                    <Text style={[styles.orderStatusText, { color: getStatusColor(order.status) }]}>
                      {getStatusLabel(order.status)}
                    </Text>
                  </View>
                </View>
              ))
            ) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyIcon}>📦</Text>
                <Text style={styles.emptyText}>Aucune commande récente</Text>
              </View>
            )}
          </View>
        </View>

        {/* Actions rapides */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>⚡ Actions rapides</Text>
          <View style={styles.quickActions}>
            <TouchableOpacity style={styles.quickActionBtn} onPress={() => navigation.navigate('AdminProducts')}>
              <View style={[styles.quickActionIcon, { backgroundColor: COLORS.primary + '15' }]}>
                <Text style={styles.quickActionEmoji}>➕</Text>
              </View>
              <Text style={styles.quickActionLabel}>Nouveau produit</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickActionBtn} onPress={() => navigation.navigate('AdminNews')}>
              <View style={[styles.quickActionIcon, { backgroundColor: COLORS.info + '15' }]}>
                <Text style={styles.quickActionEmoji}>📰</Text>
              </View>
              <Text style={styles.quickActionLabel}>Publier news</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickActionBtn} onPress={() => navigation.navigate('AdminMatches')}>
              <View style={[styles.quickActionIcon, { backgroundColor: COLORS.success + '15' }]}>
                <Text style={styles.quickActionEmoji}>🏟️</Text>
              </View>
              <Text style={styles.quickActionLabel}>Ajouter match</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickActionBtn} onPress={() => navigation.navigate('AdminPlayers')}>
              <View style={[styles.quickActionIcon, { backgroundColor: COLORS.warning + '15' }]}>
                <Text style={styles.quickActionEmoji}>⚽</Text>
              </View>
              <Text style={styles.quickActionLabel}>Gérer joueurs</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  loadingText: {
    marginTop: 12,
    color: COLORS.textSecondary,
    fontSize: 14,
  },
  // Header
  header: {
    paddingTop: 10,
    paddingBottom: 80,
    paddingHorizontal: SIZES.screenPadding,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerGreeting: {
    fontSize: 14,
    color: COLORS.textWhite,
    opacity: 0.8,
  },
  headerName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.textWhite,
  },
  logoutBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoutIcon: {
    fontSize: 20,
  },
  // Revenue Card
  revenueCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: SIZES.radiusLg,
    padding: 20,
    marginTop: 20,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  revenueInfo: {
    flex: 1,
  },
  revenueLabel: {
    fontSize: 12,
    color: COLORS.textWhite,
    opacity: 0.8,
    marginBottom: 4,
  },
  revenueAmount: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.textWhite,
  },
  revenueBadge: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  revenueBadgeText: {
    fontSize: 24,
  },
  // ScrollView
  scrollView: {
    flex: 1,
    marginTop: -50,
  },
  // Section
  section: {
    paddingHorizontal: SIZES.screenPadding,
    marginTop: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 15,
  },
  seeAllBtn: {
    fontSize: 13,
    color: COLORS.primary,
    fontWeight: '600',
    marginBottom: 15,
  },
  // Stats Grid
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    width: (width - 48) / 2,
    backgroundColor: COLORS.card,
    borderRadius: SIZES.radiusMd,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderLeftWidth: 4,
    ...SHADOWS.medium,
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  statIcon: {
    fontSize: 22,
  },
  statContent: {
    flex: 1,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  statSubValue: {
    fontSize: 10,
    color: COLORS.textLight,
    marginTop: 2,
  },
  // Orders Card
  ordersCard: {
    backgroundColor: COLORS.card,
    borderRadius: SIZES.radiusMd,
    padding: 20,
    ...SHADOWS.medium,
  },
  ordersHeader: {
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  ordersTotal: {
    fontSize: 42,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  ordersTotalLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  orderStatusList: {
    gap: 12,
  },
  orderStatusItem: {
    marginBottom: 8,
  },
  orderStatusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  orderStatusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  orderStatusLabel: {
    flex: 1,
    fontSize: 13,
    color: COLORS.text,
  },
  orderStatusCount: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  orderStatusBarBg: {
    height: 6,
    backgroundColor: COLORS.borderLight,
    borderRadius: 3,
  },
  orderStatusBarFill: {
    height: 6,
    borderRadius: 3,
  },
  // Users Card
  usersCard: {
    backgroundColor: COLORS.card,
    borderRadius: SIZES.radiusMd,
    padding: 16,
    ...SHADOWS.medium,
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  userItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  userAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  userAvatarText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.textWhite,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text,
  },
  userEmail: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  userMeta: {
    alignItems: 'flex-end',
  },
  userDate: {
    fontSize: 10,
    color: COLORS.textLight,
    marginBottom: 4,
  },
  userStatus: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  userStatusText: {
    fontSize: 10,
    fontWeight: '600',
  },
  // Orders List Card
  ordersListCard: {
    backgroundColor: COLORS.card,
    borderRadius: SIZES.radiusMd,
    padding: 16,
    ...SHADOWS.medium,
  },
  orderItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  orderItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  orderLeft: {
    flex: 1,
  },
  orderNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  orderUser: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  orderCenter: {
    alignItems: 'flex-end',
    marginRight: 12,
  },
  orderAmount: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
  },
  orderDate: {
    fontSize: 10,
    color: COLORS.textLight,
    marginTop: 2,
  },
  orderStatusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  orderStatusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  // Empty State
  emptyState: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  emptyIcon: {
    fontSize: 40,
    marginBottom: 10,
  },
  emptyText: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  // Quick Actions
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  quickActionBtn: {
    alignItems: 'center',
    width: (width - 64) / 4,
  },
  quickActionIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  quickActionEmoji: {
    fontSize: 24,
  },
  quickActionLabel: {
    fontSize: 11,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
});

export default AdminDashboardScreen;
