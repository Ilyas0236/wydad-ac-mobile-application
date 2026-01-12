// ===========================================
// WYDAD AC - THEME COLORS PROFESSIONAL
// ===========================================

export const COLORS = {
  // Couleurs principales WAC
  primary: '#BE1522',        // Rouge WAC officiel
  primaryDark: '#8B0F18',    // Rouge foncé
  primaryLight: '#E8434F',   // Rouge clair
  secondary: '#FFFFFF',      // Blanc
  accent: '#D4A84B',         // Or/Doré
  accentLight: '#F5E6C8',    // Or clair
  
  // Couleurs de fond
  background: '#F8F9FA',     // Gris très clair
  backgroundDark: '#1A1A1A', // Fond sombre
  card: '#FFFFFF',           // Blanc cartes
  cardDark: '#2D2D2D',       // Carte sombre
  
  // Couleurs de texte
  text: '#1A1A1A',
  textSecondary: '#6C757D',
  textLight: '#ADB5BD',
  textWhite: '#FFFFFF',
  textMuted: '#868E96',
  
  // Couleurs d'état
  success: '#28A745',
  successLight: '#D4EDDA',
  warning: '#FFC107',
  warningLight: '#FFF3CD',
  error: '#DC3545',
  errorLight: '#F8D7DA',
  info: '#17A2B8',
  infoLight: '#D1ECF1',
  
  // Couleurs utilitaires
  border: '#DEE2E6',
  borderLight: '#E9ECEF',
  shadow: 'rgba(0,0,0,0.1)',
  overlay: 'rgba(0,0,0,0.5)',
  overlayLight: 'rgba(0,0,0,0.3)',
  
  // Gradients
  gradientStart: '#BE1522',
  gradientMiddle: '#A01119',
  gradientEnd: '#8B0F18',
  
  // Couleurs de statut commandes
  statusPending: '#FFC107',
  statusConfirmed: '#17A2B8',
  statusPaid: '#28A745',
  statusShipped: '#6F42C1',
  statusDelivered: '#20C997',
  statusCancelled: '#DC3545',
};

export const SHADOWS = {
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  small: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  large: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.16,
    shadowRadius: 16,
    elevation: 8,
  },
  colored: {
    shadowColor: '#BE1522',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
};

export const SIZES = {
  // Spacing
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  
  // Border radius
  radiusXs: 4,
  radiusSm: 8,
  radiusMd: 12,
  radiusLg: 16,
  radiusXl: 24,
  radiusXxl: 32,
  radiusFull: 9999,
  
  // Font sizes
  fontXs: 10,
  fontSm: 12,
  fontMd: 14,
  fontLg: 16,
  fontXl: 18,
  fontXxl: 22,
  fontTitle: 28,
  fontHero: 36,
  
  // Screen
  screenPadding: 16,
  headerHeight: 60,
  tabBarHeight: 70,
  
  // Icons
  iconSm: 20,
  iconMd: 24,
  iconLg: 32,
  iconXl: 48,
};

// Styles de texte réutilisables
export const TYPOGRAPHY = {
  hero: {
    fontSize: SIZES.fontHero,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  title: {
    fontSize: SIZES.fontTitle,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  heading: {
    fontSize: SIZES.fontXxl,
    fontWeight: '700',
    color: COLORS.text,
  },
  subheading: {
    fontSize: SIZES.fontXl,
    fontWeight: '600',
    color: COLORS.text,
  },
  body: {
    fontSize: SIZES.fontMd,
    color: COLORS.text,
  },
  bodySmall: {
    fontSize: SIZES.fontSm,
    color: COLORS.textSecondary,
  },
  caption: {
    fontSize: SIZES.fontXs,
    color: COLORS.textLight,
  },
  button: {
    fontSize: SIZES.fontLg,
    fontWeight: '600',
  },
};

export default { COLORS, SHADOWS, SIZES, TYPOGRAPHY };
