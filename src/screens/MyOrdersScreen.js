// ===========================================
// WYDAD AC - MY ORDERS SCREEN
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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { ordersAPI } from '../services/api';
import { COLORS, SIZES, SHADOWS } from '../theme/colors';

const MyOrdersScreen = ({ navigation }) => {
  const { user, isAuthenticated } = useAuth();
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [cancellingOrder, setCancellingOrder] = useState(null);

  useEffect(() => {
    if (user && isAuthenticated) {
      loadMyOrders();
    } else {
      // Réinitialiser les commandes si pas authentifié
      setOrders([]);
      setIsLoading(false);
    }
  }, [user, isAuthenticated]);

  const loadMyOrders = async () => {
    try {
      const response = await ordersAPI.getMine();
      if (response.success) {
        setOrders(response.data);
      }
    } catch (error) {
      console.error('Erreur chargement commandes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadMyOrders();
    setRefreshing(false);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  // Annuler une commande
  const handleCancelOrder = (order) => {
    Alert.alert(
      'Annuler la commande',
      `Voulez-vous vraiment annuler la commande #${order.id.toString().padStart(6, '0')}?\n\nCette action est irréversible.`,
      [
        { text: 'Non', style: 'cancel' },
        { 
          text: 'Oui, annuler', 
          style: 'destructive',
          onPress: async () => {
            setCancellingOrder(order.id);
            try {
              const response = await ordersAPI.cancel(order.id);
              if (response.success) {
                Alert.alert('✓ Commande annulée', 'Votre commande a été annulée avec succès.');
                loadMyOrders();
              } else {
                Alert.alert('Erreur', response.message || 'Impossible d\'annuler la commande');
              }
            } catch (error) {
              Alert.alert('Erreur', error.message || 'Une erreur est survenue');
            } finally {
              setCancellingOrder(null);
            }
          }
        },
      ]
    );
  };

  // Re-commander les mêmes produits
  const handleReorder = (order) => {
    Alert.alert(
      'Commander à nouveau',
      'Cette fonctionnalité sera disponible prochainement.',
      [{ text: 'OK' }]
    );
  };

  // Rendu d'une étape de suivi
  const renderTrackingStep = (stepStatus, label, currentStatus) => {
    const statusOrder = ['pending', 'confirmed', 'paid', 'shipped', 'delivered'];
    const currentIndex = statusOrder.indexOf(currentStatus);
    const stepIndex = statusOrder.indexOf(stepStatus);
    
    // Si la commande est annulée
    if (currentStatus === 'cancelled') {
      return (
        <View key={stepStatus} style={styles.trackingStep}>
          <View style={[styles.trackingDot, styles.trackingDotInactive]} />
          <Text style={[styles.trackingLabel, styles.trackingLabelInactive]}>{label}</Text>
        </View>
      );
    }
    
    const isCompleted = stepIndex <= currentIndex;
    const isCurrent = stepIndex === currentIndex;
    
    return (
      <View key={stepStatus} style={styles.trackingStep}>
        <View style={[
          styles.trackingDot, 
          isCompleted ? styles.trackingDotCompleted : styles.trackingDotInactive,
          isCurrent && styles.trackingDotCurrent
        ]} />
        <Text style={[
          styles.trackingLabel,
          isCompleted ? styles.trackingLabelCompleted : styles.trackingLabelInactive
        ]}>{label}</Text>
      </View>
    );
  };

  const getStatusInfo = (status) => {
    const statuses = {
      pending: { label: 'En attente de paiement', icon: '⏳', color: COLORS.warning },
      confirmed: { label: 'Confirmée', icon: '✓', color: COLORS.primary },
      paid: { label: 'Payée', icon: '💳', color: COLORS.success },
      shipped: { label: 'Expédiée', icon: '📦', color: COLORS.info },
      delivered: { label: 'Livrée', icon: '✅', color: COLORS.success },
      cancelled: { label: 'Annulée', icon: '✗', color: COLORS.error },
    };
    return statuses[status] || statuses.pending;
  };

  const getPaymentMethodInfo = (method) => {
    const methods = {
      card: { label: 'Carte bancaire', icon: '💳' },
      cod: { label: 'Paiement à la livraison', icon: '💵' },
      cash_on_delivery: { label: 'Paiement à la livraison', icon: '💵' },
    };
    return methods[method] || { label: method || 'Non spécifié', icon: '💰' };
  };

  const renderOrderItem = (item, index) => (
    <View key={index} style={styles.orderItem}>
      <View style={styles.itemIcon}>
        <Text style={styles.itemEmoji}>
          {item.category === 'maillots' ? '👕' :
           item.category === 'vetements' ? '🧥' :
           item.category === 'equipement' ? '⚽' : '🧢'}
        </Text>
      </View>
      <View style={styles.itemInfo}>
        <Text style={styles.itemName} numberOfLines={1}>{item.product_name}</Text>
        {item.size && <Text style={styles.itemSize}>Taille: {item.size}</Text>}
        <Text style={styles.itemQty}>x{item.quantity}</Text>
      </View>
      <Text style={styles.itemPrice}>{item.price * item.quantity} MAD</Text>
    </View>
  );

  const renderOrder = ({ item }) => {
    const statusInfo = getStatusInfo(item.status);
    const paymentInfo = getPaymentMethodInfo(item.payment_method);
    const isExpanded = expandedOrder === item.id;

    return (
      <TouchableOpacity
        style={styles.orderCard}
        onPress={() => setExpandedOrder(isExpanded ? null : item.id)}
        activeOpacity={0.7}
      >
        {/* Order Header */}
        <View style={styles.orderHeader}>
          <View>
            <Text style={styles.orderNumber}>Commande #{item.id.toString().padStart(6, '0')}</Text>
            <Text style={styles.orderDate}>{formatDate(item.created_at)}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: statusInfo.color + '20' }]}>
            <Text style={[styles.statusText, { color: statusInfo.color }]}>
              {statusInfo.icon} {statusInfo.label}
            </Text>
          </View>
        </View>

        {/* Payment Method Badge */}
        <View style={styles.paymentBadge}>
          <Text style={styles.paymentText}>
            {paymentInfo.icon} {paymentInfo.label}
          </Text>
        </View>

        {/* Order Summary */}
        <View style={styles.orderSummary}>
          <Text style={styles.itemsCount}>
            {item.items?.length || 0} article(s)
          </Text>
          <Text style={styles.orderTotal}>{item.total_amount} MAD</Text>
        </View>

        {/* Expanded Details */}
        {isExpanded && item.items && (
          <View style={styles.expandedSection}>
            <View style={styles.divider} />
            <Text style={styles.sectionTitle}>Articles commandés</Text>
            {item.items.map((orderItem, index) => renderOrderItem(orderItem, index))}
            
            {/* Delivery Info */}
            <View style={styles.divider} />
            <View style={styles.deliveryInfo}>
              <Text style={styles.deliveryTitle}>Livraison</Text>
              <Text style={styles.deliveryText}>
                📍 {item.shipping_address || 'Retrait en magasin'}
              </Text>
              {item.shipping_city && (
                <Text style={styles.deliveryText}>
                  🏙️ {item.shipping_city}
                </Text>
              )}
              {item.shipping_phone && (
                <Text style={styles.deliveryText}>
                  📞 {item.shipping_phone}
                </Text>
              )}
            </View>

            {/* Suivi de commande */}
            <View style={styles.divider} />
            <View style={styles.trackingSection}>
              <Text style={styles.trackingTitle}>📦 Suivi de commande</Text>
              <View style={styles.trackingSteps}>
                {renderTrackingStep('pending', 'En attente', item.status)}
                {renderTrackingStep('confirmed', 'Confirmée', item.status)}
                {renderTrackingStep('paid', 'Payée', item.status)}
                {renderTrackingStep('shipped', 'Expédiée', item.status)}
                {renderTrackingStep('delivered', 'Livrée', item.status)}
              </View>
            </View>

            {/* Actions */}
            <View style={styles.actionsRow}>
              {/* Bouton Annuler - visible pour pending et confirmed */}
              {['pending', 'confirmed'].includes(item.status) && (
                <TouchableOpacity 
                  style={styles.cancelOrderBtn}
                  onPress={() => handleCancelOrder(item)}
                  disabled={cancellingOrder === item.id}
                >
                  {cancellingOrder === item.id ? (
                    <ActivityIndicator size="small" color={COLORS.error} />
                  ) : (
                    <>
                      <Text style={styles.cancelOrderIcon}>✗</Text>
                      <Text style={styles.cancelOrderText}>Annuler</Text>
                    </>
                  )}
                </TouchableOpacity>
              )}

              {/* Bouton Re-commander - visible pour delivered */}
              {item.status === 'delivered' && (
                <TouchableOpacity 
                  style={styles.reorderBtn}
                  onPress={() => handleReorder(item)}
                >
                  <Text style={styles.reorderIcon}>🔄</Text>
                  <Text style={styles.reorderText}>Commander à nouveau</Text>
                </TouchableOpacity>
              )}

              {/* Bouton Contacter - toujours visible */}
              <TouchableOpacity style={styles.contactBtn}>
                <Text style={styles.contactIcon}>💬</Text>
                <Text style={styles.contactText}>Support</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Expand Indicator */}
        <View style={styles.expandIndicator}>
          <Text style={styles.expandIcon}>{isExpanded ? '▲' : '▼'}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backButton}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Mes Commandes</Text>
          <View style={{ width: 30 }} />
        </View>

        <View style={styles.notLoggedContainer}>
          <Text style={styles.notLoggedIcon}>📦</Text>
          <Text style={styles.notLoggedText}>Connectez-vous pour voir vos commandes</Text>
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
        <Text style={styles.headerTitle}>Mes Commandes</Text>
        <View style={{ width: 30 }} />
      </View>

      <FlatList
        data={orders}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderOrder}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />
        }
        ListHeaderComponent={
          orders.length > 0 && (
            <Text style={styles.orderCount}>
              {orders.length} commande(s)
            </Text>
          )
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>📦</Text>
            <Text style={styles.emptyTitle}>Aucune commande</Text>
            <Text style={styles.emptySubtitle}>Découvrez notre boutique officielle</Text>
            <TouchableOpacity
              style={styles.shopBtn}
              onPress={() => navigation.navigate('Shop')}
            >
              <Text style={styles.shopBtnText}>🛍️ Aller à la boutique</Text>
            </TouchableOpacity>
          </View>
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
  list: {
    padding: SIZES.screenPadding,
  },
  orderCount: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 15,
  },
  orderCard: {
    backgroundColor: COLORS.card,
    borderRadius: SIZES.radiusMd,
    padding: 15,
    marginBottom: 15,
    ...SHADOWS.small,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  orderNumber: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  orderDate: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  paymentBadge: {
    backgroundColor: COLORS.background,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    alignSelf: 'flex-start',
    marginBottom: 10,
  },
  paymentText: {
    fontSize: 11,
    color: COLORS.textSecondary,
  },
  orderSummary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemsCount: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  orderTotal: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  expandedSection: {
    marginTop: 10,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 15,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 10,
  },
  orderItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  itemIcon: {
    width: 40,
    height: 40,
    backgroundColor: COLORS.background,
    borderRadius: SIZES.radiusSm,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  itemEmoji: {
    fontSize: 20,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 13,
    fontWeight: '500',
    color: COLORS.text,
  },
  itemSize: {
    fontSize: 11,
    color: COLORS.textSecondary,
  },
  itemQty: {
    fontSize: 11,
    color: COLORS.textLight,
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  deliveryInfo: {
    backgroundColor: COLORS.background,
    padding: 12,
    borderRadius: SIZES.radiusSm,
  },
  deliveryTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 5,
  },
  deliveryText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 3,
  },
  // Tracking section
  trackingSection: {
    marginTop: 10,
  },
  trackingTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 12,
  },
  trackingSteps: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  trackingStep: {
    alignItems: 'center',
    flex: 1,
  },
  trackingDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    marginBottom: 5,
  },
  trackingDotCompleted: {
    backgroundColor: COLORS.success,
  },
  trackingDotInactive: {
    backgroundColor: COLORS.border,
  },
  trackingDotCurrent: {
    borderWidth: 3,
    borderColor: COLORS.primary,
  },
  trackingLabel: {
    fontSize: 9,
    textAlign: 'center',
  },
  trackingLabelCompleted: {
    color: COLORS.success,
    fontWeight: '600',
  },
  trackingLabelInactive: {
    color: COLORS.textLight,
  },
  // Actions row
  actionsRow: {
    flexDirection: 'row',
    marginTop: 15,
    gap: 10,
  },
  cancelOrderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.error + '15',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: SIZES.radiusSm,
  },
  cancelOrderIcon: {
    fontSize: 14,
    color: COLORS.error,
    marginRight: 5,
  },
  cancelOrderText: {
    color: COLORS.error,
    fontWeight: '600',
    fontSize: 13,
  },
  reorderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary + '15',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: SIZES.radiusSm,
    flex: 1,
  },
  reorderIcon: {
    fontSize: 14,
    marginRight: 5,
  },
  reorderText: {
    color: COLORS.primary,
    fontWeight: '600',
    fontSize: 13,
  },
  contactBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.info + '15',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: SIZES.radiusSm,
  },
  contactIcon: {
    fontSize: 14,
    marginRight: 5,
  },
  contactText: {
    color: COLORS.info || '#3498db',
    fontWeight: '600',
    fontSize: 13,
  },
  expandIndicator: {
    alignItems: 'center',
    marginTop: 10,
  },
  expandIcon: {
    fontSize: 12,
    color: COLORS.textLight,
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
  shopBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: SIZES.radiusMd,
  },
  shopBtnText: {
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
});

export default MyOrdersScreen;
