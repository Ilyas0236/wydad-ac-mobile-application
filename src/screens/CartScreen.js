// ===========================================
// WYDAD AC - CART SCREEN (PANIER)
// ===========================================

import React, { useContext, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CartContext } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';
import { ordersAPI } from '../services/api';
import { COLORS, SIZES, SHADOWS } from '../theme/colors';

const CartScreen = ({ navigation }) => {
  const { user } = useContext(AuthContext);
  const { cartItems, updateQuantity, removeItem, clearCart, getTotal } = useContext(CartContext);
  const [isOrdering, setIsOrdering] = useState(false);

  const handleRemoveItem = (itemId) => {
    Alert.alert(
      'Supprimer',
      'Voulez-vous retirer cet article du panier?',
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Supprimer', style: 'destructive', onPress: () => removeItem(itemId) },
      ]
    );
  };

  const handleCheckout = async () => {
    if (!user) {
      Alert.alert(
        'Connexion requise',
        'Veuillez vous connecter pour finaliser votre commande',
        [
          { text: 'Annuler', style: 'cancel' },
          { text: 'Se connecter', onPress: () => navigation.navigate('Login') },
        ]
      );
      return;
    }

    if (cartItems.length === 0) {
      Alert.alert('Panier vide', 'Ajoutez des articles pour passer commande');
      return;
    }

    setIsOrdering(true);
    try {
      const orderData = {
        items: cartItems.map(item => ({
          product_id: item.id,
          quantity: item.quantity,
          size: item.size || null,
        })),
      };

      const response = await ordersAPI.create(orderData);

      if (response.success) {
        clearCart();
        Alert.alert(
          '✅ Commande confirmée!',
          `Commande #${response.data.order_id}\nTotal: ${response.data.total_price} MAD`,
          [
            {
              text: 'Voir mes commandes',
              onPress: () => navigation.navigate('Profile', { screen: 'MyOrders' }),
            },
            { text: 'OK' },
          ]
        );
      } else {
        Alert.alert('Erreur', response.message || 'Impossible de créer la commande');
      }
    } catch (error) {
      Alert.alert('Erreur', 'Une erreur est survenue. Veuillez réessayer.');
    } finally {
      setIsOrdering(false);
    }
  };

  const renderCartItem = ({ item }) => (
    <View style={styles.cartItem}>
      {/* Product Icon */}
      <View style={styles.itemImage}>
        <Text style={styles.itemEmoji}>
          {item.category === 'maillot' ? '👕' :
           item.category === 'vetement' ? '🧥' :
           item.category === 'ballon' ? '⚽' : '🧢'}
        </Text>
      </View>

      {/* Product Info */}
      <View style={styles.itemInfo}>
        <Text style={styles.itemName} numberOfLines={2}>{item.name}</Text>
        {item.size && (
          <Text style={styles.itemSize}>Taille: {item.size}</Text>
        )}
        <Text style={styles.itemPrice}>{item.price} MAD</Text>
      </View>

      {/* Quantity Controls */}
      <View style={styles.quantitySection}>
        <TouchableOpacity
          style={styles.qtyBtn}
          onPress={() => updateQuantity(item.id, item.quantity - 1)}
        >
          <Text style={styles.qtyBtnText}>-</Text>
        </TouchableOpacity>
        <Text style={styles.qtyValue}>{item.quantity}</Text>
        <TouchableOpacity
          style={styles.qtyBtn}
          onPress={() => updateQuantity(item.id, item.quantity + 1)}
        >
          <Text style={styles.qtyBtnText}>+</Text>
        </TouchableOpacity>
      </View>

      {/* Remove Button */}
      <TouchableOpacity
        style={styles.removeBtn}
        onPress={() => handleRemoveItem(item.id)}
      >
        <Text style={styles.removeText}>✕</Text>
      </TouchableOpacity>

      {/* Item Total */}
      <View style={styles.itemTotal}>
        <Text style={styles.itemTotalText}>{item.price * item.quantity} MAD</Text>
      </View>
    </View>
  );

  const total = getTotal();
  const itemsCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mon Panier</Text>
        {cartItems.length > 0 && (
          <TouchableOpacity onPress={() => Alert.alert(
            'Vider le panier',
            'Voulez-vous vraiment vider tout le panier?',
            [
              { text: 'Annuler', style: 'cancel' },
              { text: 'Vider', style: 'destructive', onPress: clearCart },
            ]
          )}>
            <Text style={styles.clearBtn}>Vider</Text>
          </TouchableOpacity>
        )}
      </View>

      {cartItems.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>🛒</Text>
          <Text style={styles.emptyTitle}>Votre panier est vide</Text>
          <Text style={styles.emptySubtitle}>Découvrez notre boutique</Text>
          <TouchableOpacity
            style={styles.shopBtn}
            onPress={() => navigation.navigate('Shop')}
          >
            <Text style={styles.shopBtnText}>🛍️ Aller à la boutique</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          {/* Cart Items */}
          <FlatList
            data={cartItems}
            keyExtractor={(item) => `${item.id}-${item.size}`}
            renderItem={renderCartItem}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
          />

          {/* Summary */}
          <View style={styles.summarySection}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Articles ({itemsCount})</Text>
              <Text style={styles.summaryValue}>{total} MAD</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Livraison</Text>
              <Text style={styles.summaryValue}>Gratuite</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.summaryRow}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>{total} MAD</Text>
            </View>

            <TouchableOpacity
              style={styles.checkoutBtn}
              onPress={handleCheckout}
              disabled={isOrdering}
            >
              {isOrdering ? (
                <ActivityIndicator color={COLORS.textWhite} />
              ) : (
                <Text style={styles.checkoutText}>✓ Confirmer la commande</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.continueBtn}
              onPress={() => navigation.navigate('Shop')}
            >
              <Text style={styles.continueText}>← Continuer mes achats</Text>
            </TouchableOpacity>
          </View>
        </>
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
  clearBtn: {
    color: COLORS.textWhite,
    fontSize: 14,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SIZES.screenPadding,
  },
  emptyIcon: {
    fontSize: 80,
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 30,
  },
  shopBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: SIZES.radiusMd,
    ...SHADOWS.medium,
  },
  shopBtnText: {
    color: COLORS.textWhite,
    fontSize: 16,
    fontWeight: 'bold',
  },
  list: {
    padding: SIZES.screenPadding,
  },
  cartItem: {
    backgroundColor: COLORS.card,
    borderRadius: SIZES.radiusMd,
    padding: 15,
    marginBottom: 15,
    ...SHADOWS.small,
  },
  itemImage: {
    width: 60,
    height: 60,
    backgroundColor: COLORS.background,
    borderRadius: SIZES.radiusSm,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    top: 15,
    left: 15,
  },
  itemEmoji: {
    fontSize: 30,
  },
  itemInfo: {
    marginLeft: 75,
    marginBottom: 15,
    paddingRight: 30,
  },
  itemName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 4,
  },
  itemSize: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  itemPrice: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '600',
  },
  quantitySection: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'absolute',
    bottom: 15,
    left: 90,
  },
  qtyBtn: {
    width: 30,
    height: 30,
    backgroundColor: COLORS.background,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  qtyBtnText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  qtyValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.text,
    marginHorizontal: 12,
  },
  removeBtn: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeText: {
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  itemTotal: {
    position: 'absolute',
    bottom: 15,
    right: 15,
  },
  itemTotalText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  summarySection: {
    backgroundColor: COLORS.card,
    padding: SIZES.screenPadding,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    ...SHADOWS.medium,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  summaryLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  summaryValue: {
    fontSize: 14,
    color: COLORS.text,
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 15,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  totalValue: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  checkoutBtn: {
    backgroundColor: COLORS.primary,
    padding: 18,
    borderRadius: SIZES.radiusMd,
    alignItems: 'center',
    marginTop: 20,
    ...SHADOWS.medium,
  },
  checkoutText: {
    color: COLORS.textWhite,
    fontSize: 16,
    fontWeight: 'bold',
  },
  continueBtn: {
    padding: 15,
    alignItems: 'center',
  },
  continueText: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: '600',
  },
});

export default CartScreen;
