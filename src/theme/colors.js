// ===========================================
// WYDAD AC - THEME COLORS
// ===========================================

export const COLORS = {
  // Couleurs principales WAC
  primary: '#BE1522',      // Rouge WAC
  secondary: '#FFFFFF',    // Blanc
  accent: '#D4A84B',       // Or/Doré
  
  // Couleurs de fond
  background: '#F5F5F5',
  card: '#FFFFFF',
  dark: '#1A1A1A',
  
  // Couleurs de texte
  text: '#1A1A1A',
  textSecondary: '#666666',
  textLight: '#999999',
  textWhite: '#FFFFFF',
  
  // Couleurs d'état
  success: '#28A745',
  warning: '#FFC107',
  error: '#DC3545',
  info: '#17A2B8',
  
  // Couleurs utilitaires
  border: '#E0E0E0',
  shadow: 'rgba(0,0,0,0.1)',
  overlay: 'rgba(0,0,0,0.5)',
  
  // Gradients
  gradientStart: '#BE1522',
  gradientEnd: '#8B0F18',
};

export const SHADOWS = {
  small: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  large: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
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
  radiusSm: 4,
  radiusMd: 8,
  radiusLg: 16,
  radiusXl: 24,
  radiusFull: 9999,
  
  // Font sizes
  fontXs: 10,
  fontSm: 12,
  fontMd: 14,
  fontLg: 16,
  fontXl: 18,
  fontXxl: 24,
  fontTitle: 32,
  
  // Screen
  screenPadding: 16,
};

export default { COLORS, SHADOWS, SIZES };
