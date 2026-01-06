// ===========================================
// WYDAD AC - PRODUCT DETAIL SCREEN
// ===========================================

import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { productsAPI } from '../services/api';
import { CartContext } from '../context/CartContext';
import { COLORS, SIZES, SHADOWS } from '../theme/colors';

const SIZES_OPTIONS = ['S', 'M', 'L', 'XL', 'XXL'];

const ProductDetailScreen = ({ route, navigation }) => {
  const { productId } = route.params;
  const { addItem, cartItems } = useContext(CartContext);
  const [product, setProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState('M');
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    loadProduct();
  }, []);

  const loadProduct = async () => {
    try {
      const response = await productsAPI.getOne(productId);
      if (response.success) {
        setProduct(response.data);
      }
    } catch (error) {
      console.error('Erreur chargement produit:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const cartItemsCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const handleAddToCart = () => {
    if (product.stock < quantity) {
      Alert.alert('Stock insuffisant', `Seulement ${product.stock} article(s) disponible(s)`);
      return;
    }

    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      size: selectedSize,
      category: product.category,
    }, quantity);

    Alert.alert(
      '✅ Ajouté au panier!',
      `${quantity}x ${product.name} (Taille: ${selectedSize})`,
      [
        { text: 'Continuer', style: 'cancel' },
        { text: 'Voir panier', onPress: () => navigation.navigate('Cart') },
      ]
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (!product) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Produit non trouvé</Text>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backBtnText}>Retour</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Détail produit</Text>
        <TouchableOpacity 
          style={styles.cartBtn}
          onPress={() => navigation.navigate('Cart')}
        >
          <Text style={styles.cartIcon}>🛒</Text>
          {cartItemsCount > 0 && (
            <View style={styles.cartBadge}>
              <Text style={styles.cartBadgeText}>{cartItemsCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Product Image */}
        <View style={styles.imageSection}>
          <Text style={styles.imageEmoji}>
            {product.category === 'maillot' ? '👕' :
             product.category === 'vetement' ? '🧥' :
             product.category === 'ballon' ? '⚽' : '🧢'}
          </Text>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{product.category}</Text>
          </View>
        </View>

        {/* Product Info */}
        <View style={styles.infoSection}>
          <Text style={styles.productName}>{product.name}</Text>
          
          <View style={styles.priceRow}>
            <Text style={styles.productPrice}>{product.price} MAD</Text>
            {product.stock > 0 ? (
              <Text style={styles.stockText}>✓ En stock ({product.stock})</Text>
            ) : (
              <Text style={styles.outOfStock}>✗ Rupture de stock</Text>
            )}
          </View>

          {/* Description */}
          {product.description && (
            <View style={styles.descriptionCard}>
              <Text style={styles.descriptionTitle}>Description</Text>
              <Text style={styles.descriptionText}>{product.description}</Text>
            </View>
          )}

          {/* Size Selection (for clothing) */}
          {(product.category === 'maillot' || product.category === 'vetement') && (
            <View style={styles.sizeSection}>
              <Text style={styles.sectionTitle}>Taille</Text>
              <View style={styles.sizesRow}>
                {SIZES_OPTIONS.map((size) => (
                  <TouchableOpacity
                    key={size}
                    style={[
                      styles.sizeBtn,
                      selectedSize === size && styles.sizeBtnActive,
                    ]}
                    onPress={() => setSelectedSize(size)}
                  >
                    <Text
                      style={[
                        styles.sizeText,
                        selectedSize === size && styles.sizeTextActive,
                      ]}
                    >
                      {size}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* Quantity */}
          <View style={styles.quantitySection}>
            <Text style={styles.sectionTitle}>Quantité</Text>
            <View style={styles.quantityControls}>
              <TouchableOpacity
                style={styles.qtyBtn}
                onPress={() => setQuantity(Math.max(1, quantity - 1))}
              >
                <Text style={styles.qtyBtnText}>-</Text>
              </TouchableOpacity>
              <Text style={styles.qtyValue}>{quantity}</Text>
              <TouchableOpacity
                style={styles.qtyBtn}
                onPress={() => setQuantity(Math.min(product.stock, quantity + 1))}
              >
                <Text style={styles.qtyBtnText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Total */}
          <View style={styles.totalSection}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalPrice}>{product.price * quantity} MAD</Text>
          </View>
        </View>
      </ScrollView>

      {/* Add to Cart Button */}
      <View style={styles.bottomSection}>
        <TouchableOpacity
          style={[styles.addToCartBtn, product.stock === 0 && styles.disabledBtn]}
          onPress={handleAddToCart}
          disabled={product.stock === 0}
        >
          <Text style={styles.addToCartText}>
            {product.stock > 0 ? '🛒 Ajouter au panier' : 'Produit indisponible'}
          </Text>
        </TouchableOpacity>
      </View>
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  errorText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginBottom: 20,
  },
  backBtn: {
    backgroundColor: COLORS.primary,
    padding: 15,
    borderRadius: SIZES.radiusMd,
  },
  backBtnText: {
    color: COLORS.textWhite,
    fontWeight: 'bold',
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
  cartBtn: {
    position: 'relative',
  },
  cartIcon: {
    fontSize: 24,
  },
  cartBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: COLORS.textWhite,
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartBadgeText: {
    color: COLORS.primary,
    fontSize: 11,
    fontWeight: 'bold',
  },
  imageSection: {
    height: 250,
    backgroundColor: COLORS.card,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  imageEmoji: {
    fontSize: 100,
  },
  categoryBadge: {
    position: 'absolute',
    top: 15,
    right: 15,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 15,
  },
  categoryText: {
    color: COLORS.textWhite,
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'capitalize',
  },
  infoSection: {
    padding: SIZES.screenPadding,
  },
  productName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 10,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  productPrice: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  stockText: {
    fontSize: 14,
    color: COLORS.success,
    fontWeight: '600',
  },
  outOfStock: {
    fontSize: 14,
    color: COLORS.error,
    fontWeight: '600',
  },
  descriptionCard: {
    backgroundColor: COLORS.card,
    borderRadius: SIZES.radiusMd,
    padding: 15,
    marginBottom: 20,
    ...SHADOWS.small,
  },
  descriptionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 8,
  },
  descriptionText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 22,
  },
  sizeSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 12,
  },
  sizesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  sizeBtn: {
    flex: 1,
    padding: 12,
    marginHorizontal: 5,
    borderRadius: SIZES.radiusMd,
    backgroundColor: COLORS.card,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
    ...SHADOWS.small,
  },
  sizeBtnActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary + '10',
  },
  sizeText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  sizeTextActive: {
    color: COLORS.primary,
  },
  quantitySection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  qtyBtn: {
    width: 44,
    height: 44,
    backgroundColor: COLORS.card,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  qtyBtnText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  qtyValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
    marginHorizontal: 20,
    minWidth: 30,
    textAlign: 'center',
  },
  totalSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: COLORS.card,
    borderRadius: SIZES.radiusMd,
    ...SHADOWS.small,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  totalPrice: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  bottomSection: {
    padding: SIZES.screenPadding,
    backgroundColor: COLORS.card,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  addToCartBtn: {
    backgroundColor: COLORS.primary,
    padding: 18,
    borderRadius: SIZES.radiusMd,
    alignItems: 'center',
    ...SHADOWS.medium,
  },
  disabledBtn: {
    backgroundColor: COLORS.textSecondary,
  },
  addToCartText: {
    color: COLORS.textWhite,
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ProductDetailScreen;
