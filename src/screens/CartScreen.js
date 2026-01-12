// ===========================================
// WYDAD AC - CART SCREEN (PANIER)
// ===========================================

import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Modal,
  TextInput,
  ScrollView,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { ordersAPI } from '../services/api';
import { COLORS, SIZES, SHADOWS } from '../theme/colors';

const CartScreen = ({ navigation }) => {
  const { user } = useAuth();
  const { items: cartItems, updateQuantity, removeItem, clearCart, getTotal, getItemCount } = useCart();
  const [isOrdering, setIsOrdering] = useState(false);
  
  // Formulaire livraison
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [shippingAddress, setShippingAddress] = useState('');
  const [shippingCity, setShippingCity] = useState('');
  const [shippingPhone, setShippingPhone] = useState('');
  
  // Choix du mode de paiement
  const [showPaymentMethodModal, setShowPaymentMethodModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState(null); // 'card' ou 'cod'
  const [pendingOrderData, setPendingOrderData] = useState(null);
  
  // Modal paiement carte
  const [showCardPaymentModal, setShowCardPaymentModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false); // Ancien modal - compatibilité
  const [pendingOrder, setPendingOrder] = useState(null);
  const [cardNumber, setCardNumber] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCVV, setCardCVV] = useState('');
  const [paying, setPaying] = useState(false);

  const handleRemoveItem = (productId, size, color) => {
    Alert.alert(
      'Supprimer',
      'Voulez-vous retirer cet article du panier?',
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Supprimer', style: 'destructive', onPress: () => removeItem(productId, size, color) },
      ]
    );
  };

  const openCheckout = () => {
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

    setShowCheckoutModal(true);
  };

  const handleProceedToPayment = () => {
    // Validation adresse
    if (!shippingAddress.trim()) {
      Alert.alert('Erreur', 'Veuillez entrer votre adresse');
      return;
    }
    if (!shippingCity.trim()) {
      Alert.alert('Erreur', 'Veuillez entrer votre ville');
      return;
    }
    if (!shippingPhone.trim() || shippingPhone.length < 10) {
      Alert.alert('Erreur', 'Veuillez entrer un numéro de téléphone valide');
      return;
    }

    // Sauvegarder les données et afficher le choix de paiement
    setPendingOrderData({
      items: cartItems.map(item => ({
        product_id: item.product_id,
        quantity: item.quantity,
        size: item.size || null,
        color: item.color || null,
      })),
      shipping_address: shippingAddress,
      shipping_city: shippingCity,
      shipping_phone: shippingPhone,
    });
    setShowCheckoutModal(false);
    setShowPaymentMethodModal(true);
  };

  const handleSelectPaymentMethod = async (method) => {
    setPaymentMethod(method);
    setShowPaymentMethodModal(false);

    if (method === 'cod') {
      // Paiement à la livraison - créer commande directement
      await createOrderWithCOD();
    } else {
      // Paiement par carte - créer commande puis afficher formulaire
      await createOrderForCardPayment();
    }
  };

  const createOrderWithCOD = async () => {
    setIsOrdering(true);
    try {
      const orderData = {
        ...pendingOrderData,
        payment_method: 'cod',
      };

      const response = await ordersAPI.create(orderData);

      if (response.success) {
        clearCart();
        Alert.alert(
          '✅ Commande confirmée!',
          `Commande ${response.data.order_number}\nTotal: ${response.data.total} MAD\n\n💵 Paiement à la livraison\n📦 Livraison sous 3-5 jours`,
          [
            {
              text: 'Voir mes commandes',
              onPress: () => navigation.navigate('MyOrders'),
            },
            { text: 'OK' },
          ]
        );
        resetAllForms();
      } else {
        Alert.alert('Erreur', response.message || 'Impossible de créer la commande');
      }
    } catch (error) {
      Alert.alert('Erreur', error.message || 'Une erreur est survenue');
    } finally {
      setIsOrdering(false);
    }
  };

  const createOrderForCardPayment = async () => {
    setIsOrdering(true);
    try {
      const orderData = {
        ...pendingOrderData,
        payment_method: 'card',
      };

      const response = await ordersAPI.create(orderData);

      if (response.success) {
        setPendingOrder(response.data);
        setShowCardPaymentModal(true);
      } else {
        Alert.alert('Erreur', response.message || 'Impossible de créer la commande');
      }
    } catch (error) {
      Alert.alert('Erreur', error.message || 'Une erreur est survenue');
    } finally {
      setIsOrdering(false);
    }
  };

  const handleCreateOrder = async () => {
    // Validation adresse
    if (!shippingAddress.trim()) {
      Alert.alert('Erreur', 'Veuillez entrer votre adresse');
      return;
    }
    if (!shippingCity.trim()) {
      Alert.alert('Erreur', 'Veuillez entrer votre ville');
      return;
    }
    if (!shippingPhone.trim() || shippingPhone.length < 10) {
      Alert.alert('Erreur', 'Veuillez entrer un numéro de téléphone valide');
      return;
    }

    setIsOrdering(true);
    try {
      const orderData = {
        items: cartItems.map(item => ({
          product_id: item.product_id,
          quantity: item.quantity,
          size: item.size || null,
          color: item.color || null,
        })),
        shipping_address: shippingAddress,
        shipping_city: shippingCity,
        shipping_phone: shippingPhone,
      };

      const response = await ordersAPI.create(orderData);

      if (response.success) {
        setShowCheckoutModal(false);
        setPendingOrder(response.data);
        setShowPaymentModal(true);
      } else {
        Alert.alert('Erreur', response.message || 'Impossible de créer la commande');
      }
    } catch (error) {
      Alert.alert('Erreur', error.message || 'Une erreur est survenue');
    } finally {
      setIsOrdering(false);
    }
  };

  // Paiement simulé (carte)
  const handleCardPayment = async () => {
    if (!cardNumber || cardNumber.length < 16) {
      Alert.alert('Erreur', 'Veuillez entrer un numéro de carte valide (16 chiffres)');
      return;
    }
    if (!cardHolder.trim()) {
      Alert.alert('Erreur', 'Veuillez entrer le nom du titulaire');
      return;
    }
    if (!cardExpiry || cardExpiry.length < 4) {
      Alert.alert('Erreur', 'Veuillez entrer une date d\'expiration valide (MM/AA)');
      return;
    }
    if (!cardCVV || cardCVV.length < 3) {
      Alert.alert('Erreur', 'Veuillez entrer un CVV valide (3 chiffres)');
      return;
    }

    setPaying(true);
    // Simuler un délai de traitement
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    try {
      const response = await ordersAPI.pay(pendingOrder.order_id, {
        payment_method: 'card',
        card_number: cardNumber,
        card_holder: cardHolder,
        card_expiry: cardExpiry,
        card_cvv: cardCVV,
      });

      if (response.success) {
        setShowCardPaymentModal(false);
        clearCart();
        Alert.alert(
          '✅ Paiement réussi!',
          `Commande ${pendingOrder.order_number}\nTotal: ${pendingOrder.total} MAD\n\n💳 Paiement par carte confirmé\n📦 Livraison sous 3-5 jours`,
          [
            {
              text: 'Voir mes commandes',
              onPress: () => navigation.navigate('MyOrders'),
            },
            { text: 'OK' },
          ]
        );
        resetAllForms();
      } else {
        Alert.alert('Erreur', response.message || 'Erreur de paiement');
      }
    } catch (error) {
      Alert.alert('Erreur', error.message || 'Paiement échoué');
    } finally {
      setPaying(false);
    }
  };

  // Paiement simulé (ancien)
  const handlePayment = async () => {
    if (!cardNumber || cardNumber.length < 16) {
      Alert.alert('Erreur', 'Veuillez entrer un numéro de carte valide (16 chiffres)');
      return;
    }
    if (!cardHolder.trim()) {
      Alert.alert('Erreur', 'Veuillez entrer le nom du titulaire');
      return;
    }

    setPaying(true);
    try {
      const response = await ordersAPI.pay(pendingOrder.order_id, {
        payment_method: 'card',
        card_number: cardNumber,
        card_holder: cardHolder,
      });

      if (response.success) {
        setShowPaymentModal(false);
        clearCart();
        Alert.alert(
          '✅ Commande confirmée!',
          `Commande ${pendingOrder.order_number}\nTotal: ${pendingOrder.total} MAD\n\nVotre commande sera livrée sous 3-5 jours.`,
          [
            {
              text: 'Voir mes commandes',
              onPress: () => navigation.navigate('MyOrders'),
            },
            { text: 'OK' },
          ]
        );
        resetAllForms();
      } else {
        Alert.alert('Erreur', response.message || 'Erreur de paiement');
      }
    } catch (error) {
      Alert.alert('Erreur', error.message || 'Paiement échoué');
    } finally {
      setPaying(false);
    }
  };

  const resetAllForms = () => {
    setPendingOrder(null);
    setPendingOrderData(null);
    setPaymentMethod(null);
    setCardNumber('');
    setCardHolder('');
    setCardExpiry('');
    setCardCVV('');
    setShippingAddress('');
    setShippingCity('');
    setShippingPhone('');
  };

  const cancelOrder = async () => {
    if (pendingOrder) {
      try {
        await ordersAPI.cancel(pendingOrder.order_id);
      } catch (e) {
        // ignore
      }
    }
    setShowPaymentModal(false);
    setPendingOrder(null);
  };

  const renderCartItem = ({ item }) => (
    <View style={styles.cartItem}>
      {/* Product Icon */}
      <View style={styles.itemImage}>
        <Text style={styles.itemEmoji}>
          {item.category === 'maillots' ? '👕' :
           item.category === 'vetements' ? '🧥' :
           item.category === 'equipement' ? '⚽' : '🧢'}
        </Text>
      </View>

      {/* Product Info */}
      <View style={styles.itemInfo}>
        <Text style={styles.itemName} numberOfLines={2}>{item.name}</Text>
        {item.size && <Text style={styles.itemSize}>Taille: {item.size}</Text>}
        {item.color && <Text style={styles.itemSize}>Couleur: {item.color}</Text>}
        <Text style={styles.itemPrice}>{item.price} MAD</Text>
      </View>

      {/* Quantity Controls */}
      <View style={styles.quantitySection}>
        <TouchableOpacity
          style={styles.qtyBtn}
          onPress={() => updateQuantity(item.product_id, item.size, item.color, item.quantity - 1)}
        >
          <Text style={styles.qtyBtnText}>-</Text>
        </TouchableOpacity>
        <Text style={styles.qtyValue}>{item.quantity}</Text>
        <TouchableOpacity
          style={styles.qtyBtn}
          onPress={() => updateQuantity(item.product_id, item.size, item.color, item.quantity + 1)}
        >
          <Text style={styles.qtyBtnText}>+</Text>
        </TouchableOpacity>
      </View>

      {/* Remove Button */}
      <TouchableOpacity
        style={styles.removeBtn}
        onPress={() => handleRemoveItem(item.product_id, item.size, item.color)}
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
  const itemsCount = getItemCount();
  const shippingFee = total >= 500 ? 0 : 30;
  const finalTotal = total + shippingFee;

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
            keyExtractor={(item, index) => `${item.product_id}-${item.size}-${item.color}-${index}`}
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
              <Text style={[styles.summaryValue, shippingFee === 0 && styles.freeShipping]}>
                {shippingFee === 0 ? 'Gratuite 🎉' : `${shippingFee} MAD`}
              </Text>
            </View>
            {shippingFee > 0 && (
              <Text style={styles.freeShippingHint}>
                Plus que {500 - total} MAD pour la livraison gratuite!
              </Text>
            )}
            <View style={styles.divider} />
            <View style={styles.summaryRow}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>{finalTotal} MAD</Text>
            </View>

            <TouchableOpacity
              style={styles.checkoutBtn}
              onPress={openCheckout}
            >
              <Text style={styles.checkoutText}>🛒 Passer commande</Text>
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

      {/* Modal Adresse de livraison */}
      <Modal
        visible={showCheckoutModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowCheckoutModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.modalTitle}>📦 Adresse de livraison</Text>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Adresse complète *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Rue, numéro, quartier..."
                  placeholderTextColor={COLORS.textLight}
                  value={shippingAddress}
                  onChangeText={setShippingAddress}
                  multiline
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Ville *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Casablanca, Rabat, Marrakech..."
                  placeholderTextColor={COLORS.textLight}
                  value={shippingCity}
                  onChangeText={setShippingCity}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Téléphone *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="06XXXXXXXX"
                  placeholderTextColor={COLORS.textLight}
                  value={shippingPhone}
                  onChangeText={setShippingPhone}
                  keyboardType="phone-pad"
                  maxLength={14}
                />
              </View>

              <View style={styles.orderSummary}>
                <Text style={styles.summaryTitle}>Récapitulatif</Text>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Sous-total</Text>
                  <Text style={styles.summaryValue}>{total} MAD</Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Livraison</Text>
                  <Text style={styles.summaryValue}>{shippingFee === 0 ? 'Gratuite' : `${shippingFee} MAD`}</Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.totalLabel}>Total</Text>
                  <Text style={styles.totalValue}>{finalTotal} MAD</Text>
                </View>
              </View>

              <TouchableOpacity
                style={[styles.confirmBtn, isOrdering && styles.confirmBtnDisabled]}
                onPress={handleProceedToPayment}
                disabled={isOrdering}
              >
                {isOrdering ? (
                  <ActivityIndicator color={COLORS.textWhite} />
                ) : (
                  <Text style={styles.confirmBtnText}>Choisir le mode de paiement</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setShowCheckoutModal(false)}
              >
                <Text style={styles.cancelBtnText}>Retour</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Modal Choix Mode de Paiement */}
      <Modal
        visible={showPaymentMethodModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowPaymentMethodModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>💰 Mode de paiement</Text>
            <Text style={styles.modalSubtitle}>
              Choisissez votre méthode de paiement préférée
            </Text>

            <View style={styles.paymentOptions}>
              {/* Option Paiement à la livraison */}
              <TouchableOpacity
                style={styles.paymentOption}
                onPress={() => handleSelectPaymentMethod('cod')}
                disabled={isOrdering}
              >
                <View style={styles.paymentOptionIcon}>
                  <Text style={styles.paymentEmoji}>💵</Text>
                </View>
                <View style={styles.paymentOptionInfo}>
                  <Text style={styles.paymentOptionTitle}>Paiement à la livraison</Text>
                  <Text style={styles.paymentOptionDesc}>
                    Payez en espèces lors de la réception de votre commande
                  </Text>
                </View>
                <Text style={styles.paymentArrow}>→</Text>
              </TouchableOpacity>

              {/* Option Paiement par carte */}
              <TouchableOpacity
                style={styles.paymentOption}
                onPress={() => handleSelectPaymentMethod('card')}
                disabled={isOrdering}
              >
                <View style={styles.paymentOptionIcon}>
                  <Text style={styles.paymentEmoji}>💳</Text>
                </View>
                <View style={styles.paymentOptionInfo}>
                  <Text style={styles.paymentOptionTitle}>Paiement par carte</Text>
                  <Text style={styles.paymentOptionDesc}>
                    Paiement sécurisé par carte bancaire (simulation)
                  </Text>
                </View>
                <Text style={styles.paymentArrow}>→</Text>
              </TouchableOpacity>
            </View>

            {isOrdering && (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={COLORS.primary} />
                <Text style={styles.loadingText}>Traitement en cours...</Text>
              </View>
            )}

            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={() => {
                setShowPaymentMethodModal(false);
                setShowCheckoutModal(true);
              }}
              disabled={isOrdering}
            >
              <Text style={styles.cancelBtnText}>← Retour à l'adresse</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal Paiement Carte (Nouveau Design) */}
      <Modal
        visible={showCardPaymentModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => {
          if (!paying) {
            setShowCardPaymentModal(false);
            cancelOrder();
          }
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardIcon}>💳</Text>
                <Text style={styles.modalTitle}>Paiement Sécurisé</Text>
              </View>
              
              <View style={styles.orderInfo}>
                <Text style={styles.orderNumber}>
                  Commande: {pendingOrder?.order_number}
                </Text>
                <Text style={styles.orderAmount}>
                  {pendingOrder?.total} MAD
                </Text>
              </View>

              {/* Carte visuelle */}
              <View style={styles.virtualCard}>
                <View style={styles.cardChip}>
                  <Text>💿</Text>
                </View>
                <Text style={styles.cardNumberDisplay}>
                  {cardNumber ? cardNumber.replace(/(\d{4})/g, '$1 ').trim() : '•••• •••• •••• ••••'}
                </Text>
                <View style={styles.cardBottom}>
                  <View>
                    <Text style={styles.cardLabel}>TITULAIRE</Text>
                    <Text style={styles.cardValue}>{cardHolder || 'VOTRE NOM'}</Text>
                  </View>
                  <View>
                    <Text style={styles.cardLabel}>EXPIRE</Text>
                    <Text style={styles.cardValue}>{cardExpiry || 'MM/AA'}</Text>
                  </View>
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Numéro de carte *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="1234 5678 9012 3456"
                  placeholderTextColor={COLORS.textLight}
                  value={cardNumber}
                  onChangeText={(text) => setCardNumber(text.replace(/\D/g, '').slice(0, 16))}
                  keyboardType="numeric"
                  maxLength={16}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Nom du titulaire *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="NOM PRÉNOM"
                  placeholderTextColor={COLORS.textLight}
                  value={cardHolder}
                  onChangeText={setCardHolder}
                  autoCapitalize="characters"
                />
              </View>

              <View style={styles.inputRow}>
                <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
                  <Text style={styles.inputLabel}>Expiration *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="MM/AA"
                    placeholderTextColor={COLORS.textLight}
                    value={cardExpiry}
                    onChangeText={(text) => {
                      const cleaned = text.replace(/\D/g, '').slice(0, 4);
                      if (cleaned.length >= 2) {
                        setCardExpiry(cleaned.slice(0, 2) + '/' + cleaned.slice(2));
                      } else {
                        setCardExpiry(cleaned);
                      }
                    }}
                    keyboardType="numeric"
                    maxLength={5}
                  />
                </View>
                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={styles.inputLabel}>CVV *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="123"
                    placeholderTextColor={COLORS.textLight}
                    value={cardCVV}
                    onChangeText={(text) => setCardCVV(text.replace(/\D/g, '').slice(0, 3))}
                    keyboardType="numeric"
                    maxLength={3}
                    secureTextEntry
                  />
                </View>
              </View>

              <View style={styles.modalNote}>
                <Text style={styles.noteText}>🔒 Paiement simulé - Aucune transaction réelle</Text>
                <Text style={styles.noteText}>Utilisez: 4111 1111 1111 1111</Text>
              </View>

              <TouchableOpacity
                style={[styles.payBtn, paying && styles.payBtnDisabled]}
                onPress={handleCardPayment}
                disabled={paying}
              >
                {paying ? (
                  <View style={styles.payingContainer}>
                    <ActivityIndicator color={COLORS.textWhite} />
                    <Text style={styles.payingText}>Traitement...</Text>
                  </View>
                ) : (
                  <Text style={styles.payBtnText}>💳 Payer {pendingOrder?.total} MAD</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => {
                  if (!paying) {
                    setShowCardPaymentModal(false);
                    cancelOrder();
                  }
                }}
                disabled={paying}
              >
                <Text style={styles.cancelBtnText}>Annuler la commande</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Modal Paiement (Ancien - gardé pour compatibilité) */}
      <Modal
        visible={showPaymentModal}
        animationType="slide"
        transparent={true}
        onRequestClose={cancelOrder}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>💳 Paiement Sécurisé</Text>
            <Text style={styles.modalSubtitle}>
              Commande: {pendingOrder?.order_number}
            </Text>
            <Text style={styles.modalAmount}>
              Total: {pendingOrder?.total} MAD
            </Text>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Numéro de carte</Text>
              <TextInput
                style={styles.input}
                placeholder="1234 5678 9012 3456"
                placeholderTextColor={COLORS.textLight}
                value={cardNumber}
                onChangeText={(text) => setCardNumber(text.replace(/\D/g, '').slice(0, 16))}
                keyboardType="numeric"
                maxLength={16}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Nom du titulaire</Text>
              <TextInput
                style={styles.input}
                placeholder="NOM PRÉNOM"
                placeholderTextColor={COLORS.textLight}
                value={cardHolder}
                onChangeText={setCardHolder}
                autoCapitalize="characters"
              />
            </View>

            <View style={styles.modalNote}>
              <Text style={styles.noteText}>🔒 Paiement simulé - Aucune transaction réelle</Text>
            </View>

            <TouchableOpacity
              style={[styles.payBtn, paying && styles.payBtnDisabled]}
              onPress={handlePayment}
              disabled={paying}
            >
              {paying ? (
                <ActivityIndicator color={COLORS.textWhite} />
              ) : (
                <Text style={styles.payBtnText}>Confirmer le paiement</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={cancelOrder}
            >
              <Text style={styles.cancelBtnText}>Annuler la commande</Text>
            </TouchableOpacity>
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
    marginBottom: 2,
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
  freeShipping: {
    color: COLORS.success,
    fontWeight: 'bold',
  },
  freeShippingHint: {
    fontSize: 12,
    color: COLORS.warning,
    textAlign: 'center',
    marginBottom: 10,
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
    marginBottom: 5,
  },
  modalSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: 5,
  },
  modalAmount: {
    fontSize: 18,
    color: COLORS.primary,
    textAlign: 'center',
    marginBottom: 20,
    fontWeight: '600',
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
  orderSummary: {
    backgroundColor: COLORS.background,
    padding: 15,
    borderRadius: SIZES.radiusMd,
    marginVertical: 15,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 10,
  },
  modalNote: {
    backgroundColor: COLORS.background,
    padding: 10,
    borderRadius: SIZES.radiusMd,
    marginVertical: 15,
  },
  noteText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  confirmBtn: {
    backgroundColor: COLORS.primary,
    padding: 18,
    borderRadius: SIZES.radiusMd,
    alignItems: 'center',
    ...SHADOWS.medium,
  },
  confirmBtnDisabled: {
    opacity: 0.6,
  },
  confirmBtnText: {
    color: COLORS.textWhite,
    fontSize: 16,
    fontWeight: 'bold',
  },
  payBtn: {
    backgroundColor: COLORS.success,
    padding: 18,
    borderRadius: SIZES.radiusMd,
    alignItems: 'center',
    ...SHADOWS.medium,
  },
  payBtnDisabled: {
    opacity: 0.6,
  },
  payBtnText: {
    color: COLORS.textWhite,
    fontSize: 16,
    fontWeight: 'bold',
  },
  cancelBtn: {
    padding: 15,
    alignItems: 'center',
    marginTop: 10,
  },
  cancelBtnText: {
    color: COLORS.textSecondary,
    fontSize: 14,
  },
  // Payment Method Selection Styles
  paymentOptions: {
    marginVertical: 20,
  },
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderRadius: SIZES.radiusMd,
    padding: 20,
    marginBottom: 15,
    borderWidth: 2,
    borderColor: COLORS.border,
  },
  paymentOptionIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.card,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  paymentEmoji: {
    fontSize: 24,
  },
  paymentOptionInfo: {
    flex: 1,
  },
  paymentOptionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 4,
  },
  paymentOptionDesc: {
    fontSize: 12,
    color: COLORS.textSecondary,
    lineHeight: 16,
  },
  paymentArrow: {
    fontSize: 20,
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  loadingContainer: {
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  // Card Payment Modal Styles
  cardHeader: {
    alignItems: 'center',
    marginBottom: 15,
  },
  cardIcon: {
    fontSize: 40,
    marginBottom: 5,
  },
  orderInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    padding: 15,
    borderRadius: SIZES.radiusMd,
    marginBottom: 20,
  },
  orderNumber: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  orderAmount: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  virtualCard: {
    backgroundColor: 'linear-gradient(135deg, #8B0000 0%, #C41E3A 100%)',
    backgroundColor: COLORS.primary,
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    minHeight: 180,
    justifyContent: 'space-between',
  },
  cardChip: {
    width: 40,
    height: 30,
    backgroundColor: '#FFD700',
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  cardNumberDisplay: {
    fontSize: 20,
    color: COLORS.textWhite,
    letterSpacing: 3,
    fontFamily: 'monospace',
    marginBottom: 20,
  },
  cardBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cardLabel: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.6)',
    marginBottom: 2,
  },
  cardValue: {
    fontSize: 14,
    color: COLORS.textWhite,
    fontWeight: '500',
  },
  inputRow: {
    flexDirection: 'row',
  },
  payingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  payingText: {
    color: COLORS.textWhite,
    marginLeft: 10,
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default CartScreen;
