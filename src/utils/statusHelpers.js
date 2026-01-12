// ===========================================
// WYDAD AC - STATUS HELPERS
// Configurations des statuts pour badges
// ===========================================

import { COLORS } from '../theme/colors';

/**
 * Configuration des statuts de commande
 */
export const ORDER_STATUS = {
  pending: { 
    label: 'En attente', 
    icon: '⏳', 
    color: COLORS.warning,
    bgColor: COLORS.warning + '20',
  },
  confirmed: { 
    label: 'Confirmée', 
    icon: '✓', 
    color: COLORS.info,
    bgColor: COLORS.info + '20',
  },
  paid: { 
    label: 'Payée', 
    icon: '💳', 
    color: COLORS.success,
    bgColor: COLORS.success + '20',
  },
  shipped: { 
    label: 'Expédiée', 
    icon: '📦', 
    color: COLORS.primary,
    bgColor: COLORS.primary + '20',
  },
  delivered: { 
    label: 'Livrée', 
    icon: '✅', 
    color: COLORS.success,
    bgColor: COLORS.success + '20',
  },
  cancelled: { 
    label: 'Annulée', 
    icon: '❌', 
    color: COLORS.error,
    bgColor: COLORS.error + '20',
  },
};

/**
 * Configuration des statuts de ticket
 */
export const TICKET_STATUS = {
  pending: { 
    label: 'En attente', 
    icon: '⏳', 
    color: COLORS.warning,
    bgColor: COLORS.warning + '20',
  },
  confirmed: { 
    label: 'Confirmé', 
    icon: '✓', 
    color: COLORS.info,
    bgColor: COLORS.info + '20',
  },
  paid: { 
    label: 'Payé', 
    icon: '💳', 
    color: COLORS.success,
    bgColor: COLORS.success + '20',
  },
  used: { 
    label: 'Utilisé', 
    icon: '✅', 
    color: COLORS.textLight,
    bgColor: COLORS.textLight + '20',
  },
  cancelled: { 
    label: 'Annulé', 
    icon: '❌', 
    color: COLORS.error,
    bgColor: COLORS.error + '20',
  },
  expired: { 
    label: 'Expiré', 
    icon: '⌛', 
    color: COLORS.textLight,
    bgColor: COLORS.textLight + '20',
  },
};

/**
 * Configuration des statuts de match
 */
export const MATCH_STATUS = {
  upcoming: { 
    label: 'À venir', 
    icon: '📅', 
    color: COLORS.primary,
    bgColor: COLORS.primary + '20',
  },
  live: { 
    label: 'En cours', 
    icon: '🔴', 
    color: COLORS.error,
    bgColor: COLORS.error + '20',
  },
  finished: { 
    label: 'Terminé', 
    icon: '✓', 
    color: COLORS.textLight,
    bgColor: COLORS.textLight + '20',
  },
  postponed: { 
    label: 'Reporté', 
    icon: '⏸️', 
    color: COLORS.warning,
    bgColor: COLORS.warning + '20',
  },
  cancelled: { 
    label: 'Annulé', 
    icon: '❌', 
    color: COLORS.error,
    bgColor: COLORS.error + '20',
  },
};

/**
 * Configuration des types de paiement
 */
export const PAYMENT_STATUS = {
  pending: { 
    label: 'En attente', 
    icon: '⏳', 
    color: COLORS.warning,
    bgColor: COLORS.warning + '20',
  },
  processing: { 
    label: 'En cours', 
    icon: '⏳', 
    color: COLORS.info,
    bgColor: COLORS.info + '20',
  },
  completed: { 
    label: 'Complété', 
    icon: '✅', 
    color: COLORS.success,
    bgColor: COLORS.success + '20',
  },
  failed: { 
    label: 'Échoué', 
    icon: '❌', 
    color: COLORS.error,
    bgColor: COLORS.error + '20',
  },
  refunded: { 
    label: 'Remboursé', 
    icon: '↩️', 
    color: COLORS.info,
    bgColor: COLORS.info + '20',
  },
};

/**
 * Récupère les informations de statut
 * @param {string} status - Le statut
 * @param {string} type - Le type ('order' | 'ticket' | 'match' | 'payment')
 */
export const getStatusInfo = (status, type = 'order') => {
  const statusMaps = {
    order: ORDER_STATUS,
    ticket: TICKET_STATUS,
    match: MATCH_STATUS,
    payment: PAYMENT_STATUS,
  };
  
  const statusMap = statusMaps[type] || ORDER_STATUS;
  
  return statusMap[status] || statusMap.pending || {
    label: status,
    icon: '❓',
    color: COLORS.textSecondary,
    bgColor: COLORS.textSecondary + '20',
  };
};

export default {
  ORDER_STATUS,
  TICKET_STATUS,
  MATCH_STATUS,
  PAYMENT_STATUS,
  getStatusInfo,
};
