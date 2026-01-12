// ===========================================
// WYDAD AC - USE PAYMENT FORM HOOK
// Hook pour formulaire de paiement
// ===========================================

import { useState, useCallback, useMemo } from 'react';

/**
 * Hook pour gérer un formulaire de paiement par carte
 * @param {Object} options - Options de configuration
 * @returns {Object} - État et fonctions de contrôle
 */
export const usePaymentForm = (options = {}) => {
  const {
    onValidationError = null,
  } = options;

  const [cardNumber, setCardNumber] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCVV, setCardCVV] = useState('');
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  /**
   * Formate le numéro de carte (ajoute des espaces)
   */
  const formatCardNumber = useCallback((value) => {
    const cleaned = value.replace(/\D/g, '').slice(0, 16);
    const groups = cleaned.match(/.{1,4}/g);
    return groups ? groups.join(' ') : cleaned;
  }, []);

  /**
   * Formate la date d'expiration
   */
  const formatExpiry = useCallback((value) => {
    const cleaned = value.replace(/\D/g, '').slice(0, 4);
    if (cleaned.length >= 2) {
      return `${cleaned.slice(0, 2)}/${cleaned.slice(2)}`;
    }
    return cleaned;
  }, []);

  /**
   * Met à jour le numéro de carte
   */
  const handleCardNumberChange = useCallback((value) => {
    const formatted = formatCardNumber(value);
    setCardNumber(formatted);
    setTouched(prev => ({ ...prev, cardNumber: true }));
  }, [formatCardNumber]);

  /**
   * Met à jour le nom du titulaire
   */
  const handleCardHolderChange = useCallback((value) => {
    setCardHolder(value.toUpperCase());
    setTouched(prev => ({ ...prev, cardHolder: true }));
  }, []);

  /**
   * Met à jour la date d'expiration
   */
  const handleExpiryChange = useCallback((value) => {
    const formatted = formatExpiry(value);
    setCardExpiry(formatted);
    setTouched(prev => ({ ...prev, cardExpiry: true }));
  }, [formatExpiry]);

  /**
   * Met à jour le CVV
   */
  const handleCVVChange = useCallback((value) => {
    const cleaned = value.replace(/\D/g, '').slice(0, 4);
    setCardCVV(cleaned);
    setTouched(prev => ({ ...prev, cardCVV: true }));
  }, []);

  /**
   * Valide le formulaire
   */
  const validate = useCallback(() => {
    const newErrors = {};
    const cleanedCardNumber = cardNumber.replace(/\s/g, '');

    // Validation numéro de carte
    if (!cleanedCardNumber) {
      newErrors.cardNumber = 'Le numéro de carte est requis';
    } else if (cleanedCardNumber.length < 13 || cleanedCardNumber.length > 19) {
      newErrors.cardNumber = 'Numéro de carte invalide';
    }

    // Validation nom du titulaire
    if (!cardHolder.trim()) {
      newErrors.cardHolder = 'Le nom du titulaire est requis';
    } else if (cardHolder.trim().length < 3) {
      newErrors.cardHolder = 'Nom trop court';
    }

    // Validation date d'expiration
    if (!cardExpiry) {
      newErrors.cardExpiry = 'La date d\'expiration est requise';
    } else {
      const [month, year] = cardExpiry.split('/');
      const currentYear = new Date().getFullYear() % 100;
      const currentMonth = new Date().getMonth() + 1;
      
      if (!month || !year || parseInt(month) < 1 || parseInt(month) > 12) {
        newErrors.cardExpiry = 'Date invalide';
      } else if (
        parseInt(year) < currentYear ||
        (parseInt(year) === currentYear && parseInt(month) < currentMonth)
      ) {
        newErrors.cardExpiry = 'Carte expirée';
      }
    }

    // Validation CVV
    if (!cardCVV) {
      newErrors.cardCVV = 'Le CVV est requis';
    } else if (cardCVV.length < 3) {
      newErrors.cardCVV = 'CVV invalide';
    }

    setErrors(newErrors);
    
    const hasErrors = Object.keys(newErrors).length > 0;
    if (hasErrors && onValidationError) {
      onValidationError(newErrors);
    }
    
    return !hasErrors;
  }, [cardNumber, cardHolder, cardExpiry, cardCVV, onValidationError]);

  /**
   * Vérifie si le formulaire est valide
   */
  const isValid = useMemo(() => {
    const cleanedCardNumber = cardNumber.replace(/\s/g, '');
    return (
      cleanedCardNumber.length >= 13 &&
      cardHolder.trim().length >= 3 &&
      cardExpiry.length === 5 &&
      cardCVV.length >= 3
    );
  }, [cardNumber, cardHolder, cardExpiry, cardCVV]);

  /**
   * Réinitialise le formulaire
   */
  const reset = useCallback(() => {
    setCardNumber('');
    setCardHolder('');
    setCardExpiry('');
    setCardCVV('');
    setErrors({});
    setTouched({});
  }, []);

  /**
   * Retourne les données de la carte
   */
  const getCardData = useCallback(() => {
    return {
      number: cardNumber.replace(/\s/g, ''),
      holder: cardHolder,
      expiry: cardExpiry,
      cvv: cardCVV,
    };
  }, [cardNumber, cardHolder, cardExpiry, cardCVV]);

  /**
   * Détecte le type de carte
   */
  const cardType = useMemo(() => {
    const cleanedNumber = cardNumber.replace(/\s/g, '');
    
    if (/^4/.test(cleanedNumber)) return 'visa';
    if (/^5[1-5]/.test(cleanedNumber)) return 'mastercard';
    if (/^3[47]/.test(cleanedNumber)) return 'amex';
    if (/^6(?:011|5)/.test(cleanedNumber)) return 'discover';
    
    return null;
  }, [cardNumber]);

  /**
   * Retourne l'icône du type de carte
   */
  const cardTypeIcon = useMemo(() => {
    const icons = {
      visa: '💳 Visa',
      mastercard: '💳 Mastercard',
      amex: '💳 Amex',
      discover: '💳 Discover',
    };
    return icons[cardType] || '💳';
  }, [cardType]);

  return {
    // Valeurs
    cardNumber,
    cardHolder,
    cardExpiry,
    cardCVV,
    
    // Handlers
    handleCardNumberChange,
    handleCardHolderChange,
    handleExpiryChange,
    handleCVVChange,
    setCardNumber: handleCardNumberChange,
    setCardHolder: handleCardHolderChange,
    setCardExpiry: handleExpiryChange,
    setCardCVV: handleCVVChange,
    
    // Validation
    errors,
    touched,
    validate,
    isValid,
    
    // Utilitaires
    reset,
    getCardData,
    cardType,
    cardTypeIcon,
  };
};

export default usePaymentForm;
