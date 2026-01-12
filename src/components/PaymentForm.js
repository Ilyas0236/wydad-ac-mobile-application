// ===========================================
// WYDAD AC - PAYMENT FORM COMPONENT
// Formulaire de paiement réutilisable
// ===========================================

import React from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { COLORS, SIZES, SHADOWS } from '../theme/colors';
import { usePaymentForm } from '../hooks/usePaymentForm';

/**
 * Composant de formulaire de paiement par carte
 * @param {Object} props
 * @param {Object} props.paymentForm - Instance de usePaymentForm hook
 * @param {boolean} props.loading - État de chargement
 * @param {Function} props.onSubmit - Callback de soumission
 * @param {string} props.submitText - Texte du bouton
 * @param {number} props.amount - Montant à payer (optionnel, pour affichage)
 * @param {Object} props.style - Style personnalisé
 */
const PaymentForm = ({
  paymentForm,
  loading = false,
  onSubmit,
  submitText = 'Payer',
  amount = null,
  style = null,
}) => {
  const {
    cardNumber,
    cardHolder,
    cardExpiry,
    cardCVV,
    handleCardNumberChange,
    handleCardHolderChange,
    handleExpiryChange,
    handleCVVChange,
    errors,
    touched,
    validate,
    isValid,
    cardTypeIcon,
  } = paymentForm;

  const handleSubmit = () => {
    if (validate()) {
      onSubmit?.();
    }
  };

  return (
    <View style={[styles.container, style]}>
      {/* Card Type Icon */}
      <View style={styles.cardTypeContainer}>
        <Text style={styles.cardTypeIcon}>{cardTypeIcon}</Text>
      </View>

      {/* Numéro de carte */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Numéro de carte</Text>
        <TextInput
          style={[
            styles.input,
            touched.cardNumber && errors.cardNumber && styles.inputError,
          ]}
          placeholder="1234 5678 9012 3456"
          placeholderTextColor={COLORS.textLight}
          value={cardNumber}
          onChangeText={handleCardNumberChange}
          keyboardType="numeric"
          maxLength={19}
          editable={!loading}
        />
        {touched.cardNumber && errors.cardNumber && (
          <Text style={styles.errorText}>{errors.cardNumber}</Text>
        )}
      </View>

      {/* Nom du titulaire */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Titulaire de la carte</Text>
        <TextInput
          style={[
            styles.input,
            touched.cardHolder && errors.cardHolder && styles.inputError,
          ]}
          placeholder="NOM PRÉNOM"
          placeholderTextColor={COLORS.textLight}
          value={cardHolder}
          onChangeText={handleCardHolderChange}
          autoCapitalize="characters"
          editable={!loading}
        />
        {touched.cardHolder && errors.cardHolder && (
          <Text style={styles.errorText}>{errors.cardHolder}</Text>
        )}
      </View>

      {/* Expiration et CVV */}
      <View style={styles.row}>
        <View style={[styles.inputGroup, styles.halfInput]}>
          <Text style={styles.label}>Expiration</Text>
          <TextInput
            style={[
              styles.input,
              touched.cardExpiry && errors.cardExpiry && styles.inputError,
            ]}
            placeholder="MM/AA"
            placeholderTextColor={COLORS.textLight}
            value={cardExpiry}
            onChangeText={handleExpiryChange}
            keyboardType="numeric"
            maxLength={5}
            editable={!loading}
          />
          {touched.cardExpiry && errors.cardExpiry && (
            <Text style={styles.errorText}>{errors.cardExpiry}</Text>
          )}
        </View>

        <View style={[styles.inputGroup, styles.halfInput]}>
          <Text style={styles.label}>CVV</Text>
          <TextInput
            style={[
              styles.input,
              touched.cardCVV && errors.cardCVV && styles.inputError,
            ]}
            placeholder="123"
            placeholderTextColor={COLORS.textLight}
            value={cardCVV}
            onChangeText={handleCVVChange}
            keyboardType="numeric"
            maxLength={4}
            secureTextEntry
            editable={!loading}
          />
          {touched.cardCVV && errors.cardCVV && (
            <Text style={styles.errorText}>{errors.cardCVV}</Text>
          )}
        </View>
      </View>

      {/* Montant */}
      {amount !== null && (
        <View style={styles.amountContainer}>
          <Text style={styles.amountLabel}>Montant à payer</Text>
          <Text style={styles.amountValue}>{amount} MAD</Text>
        </View>
      )}

      {/* Bouton de soumission */}
      <TouchableOpacity
        style={[
          styles.submitButton,
          (!isValid || loading) && styles.submitButtonDisabled,
        ]}
        onPress={handleSubmit}
        disabled={!isValid || loading}
      >
        {loading ? (
          <ActivityIndicator color={COLORS.textWhite} />
        ) : (
          <Text style={styles.submitButtonText}>
            {submitText} {amount !== null && `- ${amount} MAD`}
          </Text>
        )}
      </TouchableOpacity>

      {/* Sécurité */}
      <View style={styles.securityNote}>
        <Text style={styles.securityIcon}>🔒</Text>
        <Text style={styles.securityText}>
          Paiement sécurisé - Vos données sont protégées
        </Text>
      </View>
    </View>
  );
};

/**
 * Version simplifiée avec hook intégré
 */
export const PaymentFormStandalone = ({
  onPaymentSuccess,
  amount,
  submitText = 'Payer',
  style = null,
}) => {
  const paymentForm = usePaymentForm();
  const [loading, setLoading] = React.useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      // Simuler un paiement
      await new Promise(resolve => setTimeout(resolve, 2000));
      const cardData = paymentForm.getCardData();
      onPaymentSuccess?.(cardData);
      paymentForm.reset();
    } catch (error) {
      console.error('Payment error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PaymentForm
      paymentForm={paymentForm}
      loading={loading}
      onSubmit={handleSubmit}
      submitText={submitText}
      amount={amount}
      style={style}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 15,
  },
  cardTypeContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  cardTypeIcon: {
    fontSize: 24,
  },
  inputGroup: {
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 8,
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
  inputError: {
    borderColor: COLORS.error,
  },
  errorText: {
    fontSize: 12,
    color: COLORS.error,
    marginTop: 4,
  },
  row: {
    flexDirection: 'row',
    gap: 15,
  },
  halfInput: {
    flex: 1,
  },
  amountContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.primary + '10',
    borderRadius: SIZES.radiusMd,
    padding: 15,
    marginVertical: 15,
  },
  amountLabel: {
    fontSize: 14,
    color: COLORS.text,
  },
  amountValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  submitButton: {
    backgroundColor: COLORS.primary,
    borderRadius: SIZES.radiusMd,
    padding: 18,
    alignItems: 'center',
    marginTop: 10,
    ...SHADOWS.medium,
  },
  submitButtonDisabled: {
    backgroundColor: COLORS.textLight,
  },
  submitButtonText: {
    color: COLORS.textWhite,
    fontSize: 16,
    fontWeight: 'bold',
  },
  securityNote: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 15,
  },
  securityIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  securityText: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
});

export default PaymentForm;
