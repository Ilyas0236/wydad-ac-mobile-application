// ===========================================
// WYDAD AC - DATE HELPERS
// Fonctions utilitaires pour le formatage des dates
// ===========================================

/**
 * Formate une date en français
 * @param {string|Date} dateString - La date à formater
 * @param {string} format - 'full' | 'short' | 'day' | 'month'
 */
export const formatDate = (dateString, format = 'full') => {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  
  if (isNaN(date.getTime())) return '';
  
  const formats = {
    full: { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' },
    short: { day: 'numeric', month: 'short' },
    day: { weekday: 'short', day: 'numeric', month: 'short' },
    month: { month: 'long', year: 'numeric' },
    numeric: { day: '2-digit', month: '2-digit', year: 'numeric' },
  };
  
  return date.toLocaleDateString('fr-FR', formats[format] || formats.full);
};

/**
 * Formate l'heure
 * @param {string|Date} dateString - La date à formater
 */
export const formatTime = (dateString) => {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  
  if (isNaN(date.getTime())) return '';
  
  return date.toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * Formate date et heure ensemble
 * @param {string|Date} dateString - La date à formater
 */
export const formatDateTime = (dateString) => {
  if (!dateString) return '';
  return `${formatDate(dateString, 'day')} à ${formatTime(dateString)}`;
};

/**
 * Calcule le nombre de jours jusqu'à une date
 * @param {string|Date} dateString - La date cible
 */
export const getDaysUntil = (dateString) => {
  if (!dateString) return null;
  
  const date = new Date(dateString);
  const now = new Date();
  
  if (isNaN(date.getTime())) return null;
  
  const diffTime = date.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
};

/**
 * Vérifie si une date est dans le futur
 * @param {string|Date} dateString - La date à vérifier
 */
export const isUpcoming = (dateString) => {
  if (!dateString) return false;
  
  const date = new Date(dateString);
  const now = new Date();
  
  return date > now;
};

/**
 * Vérifie si une date est passée
 * @param {string|Date} dateString - La date à vérifier
 */
export const isPast = (dateString) => {
  if (!dateString) return false;
  
  const date = new Date(dateString);
  const now = new Date();
  
  return date < now;
};

/**
 * Vérifie si une date est aujourd'hui
 * @param {string|Date} dateString - La date à vérifier
 */
export const isToday = (dateString) => {
  if (!dateString) return false;
  
  const date = new Date(dateString);
  const now = new Date();
  
  return (
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear()
  );
};

/**
 * Retourne un texte relatif (Aujourd'hui, Demain, Dans X jours, Il y a X jours)
 * @param {string|Date} dateString - La date à formater
 */
export const getRelativeDate = (dateString) => {
  if (!dateString) return '';
  
  const days = getDaysUntil(dateString);
  
  if (days === null) return '';
  
  if (days === 0) return "Aujourd'hui";
  if (days === 1) return 'Demain';
  if (days === -1) return 'Hier';
  if (days > 1 && days <= 7) return `Dans ${days} jours`;
  if (days > 7 && days <= 30) return `Dans ${Math.ceil(days / 7)} semaines`;
  if (days < -1 && days >= -7) return `Il y a ${Math.abs(days)} jours`;
  
  return formatDate(dateString, 'day');
};

/**
 * Formate une durée en minutes
 * @param {number} minutes - La durée en minutes
 */
export const formatDuration = (minutes) => {
  if (!minutes || minutes <= 0) return '';
  
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  
  if (hours === 0) return `${mins}min`;
  if (mins === 0) return `${hours}h`;
  return `${hours}h${mins}`;
};

export default {
  formatDate,
  formatTime,
  formatDateTime,
  getDaysUntil,
  isUpcoming,
  isPast,
  isToday,
  getRelativeDate,
  formatDuration,
};
