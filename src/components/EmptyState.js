// ===========================================
// WYDAD AC - EMPTY STATE COMPONENT
// État liste vide réutilisable
// ===========================================

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS, SIZES, SHADOWS } from '../theme/colors';

/**
 * Composant d'état liste vide
 * @param {Object} props
 * @param {string} props.icon - Icône emoji à afficher
 * @param {string} props.title - Titre
 * @param {string} props.subtitle - Sous-titre explicatif
 * @param {string} props.buttonText - Texte du bouton d'action (optionnel)
 * @param {Function} props.onAction - Action du bouton (optionnel)
 * @param {Object} props.style - Style personnalisé
 */
const EmptyState = ({
  icon = '📭',
  title = 'Aucun élément',
  subtitle = 'Il n\'y a rien à afficher pour le moment.',
  buttonText = null,
  onAction = null,
  style = null,
}) => {
  return (
    <View style={[styles.container, style]}>
      <Text style={styles.icon}>{icon}</Text>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
      
      {buttonText && onAction && (
        <TouchableOpacity style={styles.actionButton} onPress={onAction}>
          <Text style={styles.actionButtonText}>{buttonText}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

/**
 * États vides prédéfinis pour différents contextes
 */
export const EmptyPlayers = ({ onAction }) => (
  <EmptyState
    icon="⚽"
    title="Aucun joueur"
    subtitle="Aucun joueur dans cette catégorie."
    buttonText={onAction ? "Voir tous les joueurs" : null}
    onAction={onAction}
  />
);

export const EmptyMatches = ({ onAction }) => (
  <EmptyState
    icon="🏟️"
    title="Aucun match"
    subtitle="Aucun match programmé pour le moment."
    buttonText={onAction ? "Actualiser" : null}
    onAction={onAction}
  />
);

export const EmptyProducts = ({ onAction }) => (
  <EmptyState
    icon="🛒"
    title="Aucun produit"
    subtitle="Aucun produit disponible dans cette catégorie."
    buttonText={onAction ? "Voir tout" : null}
    onAction={onAction}
  />
);

export const EmptyNews = () => (
  <EmptyState
    icon="📰"
    title="Aucune actualité"
    subtitle="Pas d'actualités disponibles pour le moment."
  />
);

export const EmptyCart = ({ onAction }) => (
  <EmptyState
    icon="🛒"
    title="Panier vide"
    subtitle="Votre panier est vide. Ajoutez des articles pour continuer."
    buttonText="Continuer mes achats"
    onAction={onAction}
  />
);

export const EmptyOrders = ({ onAction }) => (
  <EmptyState
    icon="📦"
    title="Aucune commande"
    subtitle="Vous n'avez pas encore passé de commande."
    buttonText="Voir la boutique"
    onAction={onAction}
  />
);

export const EmptyTickets = ({ onAction }) => (
  <EmptyState
    icon="🎫"
    title="Aucun billet"
    subtitle="Vous n'avez pas encore de billets."
    buttonText="Acheter des billets"
    onAction={onAction}
  />
);

export const EmptyStores = () => (
  <EmptyState
    icon="🏪"
    title="Aucun magasin"
    subtitle="Aucun magasin disponible pour le moment."
  />
);

export const EmptySearch = ({ query }) => (
  <EmptyState
    icon="🔍"
    title="Aucun résultat"
    subtitle={`Aucun résultat pour "${query}".`}
  />
);

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 50,
    paddingHorizontal: 30,
  },
  icon: {
    fontSize: 50,
    marginBottom: 15,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  actionButton: {
    backgroundColor: COLORS.primary,
    borderRadius: SIZES.radiusMd,
    paddingHorizontal: 25,
    paddingVertical: 12,
    marginTop: 10,
    ...SHADOWS.small,
  },
  actionButtonText: {
    color: COLORS.textWhite,
    fontSize: 14,
    fontWeight: '600',
  },
});

export default EmptyState;
