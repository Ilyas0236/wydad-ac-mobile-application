// ===========================================
// WYDAD AC - CART CONTEXT
// ===========================================

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Charger le panier au démarrage
  useEffect(() => {
    loadCart();
  }, []);

  // Vider le panier quand l'utilisateur se déconnecte
  useEffect(() => {
    if (!isAuthenticated && !user) {
      setItems([]);
    }
  }, [isAuthenticated, user]);

  const loadCart = async () => {
    try {
      const storedCart = await AsyncStorage.getItem('cart');
      if (storedCart) {
        setItems(JSON.parse(storedCart));
      } else {
        setItems([]);
      }
    } catch (error) {
      console.error('Erreur chargement panier:', error);
      setItems([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Recharger le panier (utile après login/logout)
  const reloadCart = useCallback(async () => {
    await loadCart();
  }, []);

  const saveCart = async (newItems) => {
    try {
      await AsyncStorage.setItem('cart', JSON.stringify(newItems));
    } catch (error) {
      console.error('Erreur sauvegarde panier:', error);
    }
  };

  // Ajouter un produit au panier
  const addItem = (product, quantity = 1, size = null, color = null) => {
    const existingIndex = items.findIndex(
      item => item.product_id === product.id && item.size === size && item.color === color
    );

    let newItems;
    if (existingIndex >= 0) {
      // Mettre à jour la quantité
      newItems = items.map((item, index) => 
        index === existingIndex 
          ? { ...item, quantity: item.quantity + quantity }
          : item
      );
    } else {
      // Ajouter nouveau produit
      newItems = [...items, {
        product_id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        category: product.category,
        quantity,
        size,
        color,
      }];
    }

    setItems(newItems);
    saveCart(newItems);
  };

  // Mettre à jour la quantité
  const updateQuantity = (productId, size, color, quantity) => {
    if (quantity <= 0) {
      removeItem(productId, size, color);
      return;
    }

    const newItems = items.map(item => 
      item.product_id === productId && item.size === size && item.color === color
        ? { ...item, quantity }
        : item
    );

    setItems(newItems);
    saveCart(newItems);
  };

  // Supprimer un produit
  const removeItem = (productId, size, color) => {
    const newItems = items.filter(
      item => !(item.product_id === productId && item.size === size && item.color === color)
    );

    setItems(newItems);
    saveCart(newItems);
  };

  // Vider le panier
  const clearCart = async () => {
    setItems([]);
    await AsyncStorage.removeItem('cart');
  };

  // Calculer le total
  const getTotal = () => {
    return items.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  // Nombre d'articles
  const getItemCount = () => {
    return items.reduce((count, item) => count + item.quantity, 0);
  };

  // Formater pour l'API
  const getCartForAPI = () => {
    return items.map(item => ({
      product_id: item.product_id,
      quantity: item.quantity,
      size: item.size,
      color: item.color,
    }));
  };

  const value = {
    items,
    isLoading,
    addItem,
    updateQuantity,
    removeItem,
    clearCart,
    reloadCart,
    getTotal,
    getItemCount,
    getCartForAPI,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

// Hook personnalisé
export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart doit être utilisé dans un CartProvider');
  }
  return context;
};

export default CartContext;
