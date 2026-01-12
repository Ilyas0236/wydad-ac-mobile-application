// ===========================================
// WYDAD AC - COMMON STYLES
// Styles partagés pour toute l'application
// ===========================================

import { StyleSheet, Platform } from 'react-native';
import { COLORS, SIZES, SHADOWS } from './colors';

export const commonStyles = StyleSheet.create({
  // ==========================================
  // CONTAINERS
  // ==========================================
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  
  screenContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  
  contentContainer: {
    padding: SIZES.screenPadding,
  },
  
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  
  rowAround: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },

  // ==========================================
  // CARDS
  // ==========================================
  card: {
    backgroundColor: COLORS.card,
    borderRadius: SIZES.radiusMd,
    padding: 15,
    marginBottom: 15,
    ...SHADOWS.small,
  },
  
  cardElevated: {
    backgroundColor: COLORS.card,
    borderRadius: SIZES.radiusMd,
    padding: 15,
    marginBottom: 15,
    ...SHADOWS.medium,
  },
  
  cardPressed: {
    backgroundColor: COLORS.card,
    borderRadius: SIZES.radiusMd,
    padding: 15,
    marginBottom: 15,
    borderWidth: 2,
    borderColor: COLORS.primary,
    ...SHADOWS.small,
  },

  // ==========================================
  // HEADERS
  // ==========================================
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SIZES.screenPadding,
    backgroundColor: COLORS.primary,
  },
  
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.textWhite,
  },
  
  headerSubtitle: {
    fontSize: 14,
    color: COLORS.textWhite + 'CC',
    marginTop: 2,
  },
  
  backButton: {
    fontSize: 24,
    color: COLORS.textWhite,
    paddingRight: 10,
  },
  
  headerRight: {
    width: 30,
  },

  // ==========================================
  // BUTTONS
  // ==========================================
  primaryButton: {
    backgroundColor: COLORS.primary,
    borderRadius: SIZES.radiusMd,
    padding: 15,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.small,
  },
  
  primaryButtonText: {
    color: COLORS.textWhite,
    fontSize: 16,
    fontWeight: 'bold',
  },
  
  secondaryButton: {
    backgroundColor: COLORS.card,
    borderRadius: SIZES.radiusMd,
    padding: 15,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  
  secondaryButtonText: {
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  
  outlineButton: {
    borderRadius: SIZES.radiusMd,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: 'transparent',
  },
  
  outlineButtonText: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '500',
  },
  
  dangerButton: {
    backgroundColor: COLORS.error,
    borderRadius: SIZES.radiusMd,
    padding: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  dangerButtonText: {
    color: COLORS.textWhite,
    fontSize: 16,
    fontWeight: 'bold',
  },
  
  iconButton: {
    padding: 10,
    borderRadius: SIZES.radiusMd,
    backgroundColor: COLORS.card,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // ==========================================
  // INPUTS
  // ==========================================
  input: {
    backgroundColor: COLORS.card,
    borderRadius: SIZES.radiusMd,
    padding: 15,
    fontSize: 16,
    color: COLORS.text,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  
  inputFocused: {
    borderColor: COLORS.primary,
  },
  
  inputError: {
    borderColor: COLORS.error,
  },
  
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 8,
  },
  
  inputHelper: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  
  inputErrorText: {
    fontSize: 12,
    color: COLORS.error,
    marginTop: 4,
  },
  
  textArea: {
    backgroundColor: COLORS.card,
    borderRadius: SIZES.radiusMd,
    padding: 15,
    fontSize: 16,
    color: COLORS.text,
    borderWidth: 1,
    borderColor: COLORS.border,
    minHeight: 100,
    textAlignVertical: 'top',
  },

  // ==========================================
  // BADGES
  // ==========================================
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  
  badgePrimary: {
    backgroundColor: COLORS.primary + '20',
  },
  
  badgePrimaryText: {
    color: COLORS.primary,
  },
  
  badgeSuccess: {
    backgroundColor: COLORS.success + '20',
  },
  
  badgeSuccessText: {
    color: COLORS.success,
  },
  
  badgeWarning: {
    backgroundColor: COLORS.warning + '20',
  },
  
  badgeWarningText: {
    color: COLORS.warning,
  },
  
  badgeError: {
    backgroundColor: COLORS.error + '20',
  },
  
  badgeErrorText: {
    color: COLORS.error,
  },

  // ==========================================
  // TYPOGRAPHY
  // ==========================================
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  
  subtitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
  },
  
  body: {
    fontSize: 14,
    color: COLORS.text,
    lineHeight: 22,
  },
  
  caption: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  
  link: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '500',
  },

  // ==========================================
  // LISTS
  // ==========================================
  listContainer: {
    padding: SIZES.screenPadding,
  },
  
  listSeparator: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 10,
  },
  
  listHeader: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 15,
  },

  // ==========================================
  // MODALS
  // ==========================================
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  modalContent: {
    backgroundColor: COLORS.card,
    borderRadius: SIZES.radiusLg,
    padding: 20,
    width: '90%',
    maxHeight: '90%',
    ...SHADOWS.large,
  },
  
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  
  modalCloseButton: {
    padding: 5,
  },
  
  modalCloseText: {
    fontSize: 24,
    color: COLORS.textSecondary,
  },
  
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 20,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    gap: 10,
  },

  // ==========================================
  // FORMS
  // ==========================================
  formGroup: {
    marginBottom: 15,
  },
  
  formRow: {
    flexDirection: 'row',
    gap: 10,
  },
  
  formCol: {
    flex: 1,
  },

  // ==========================================
  // DIVIDERS
  // ==========================================
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 15,
  },
  
  dividerText: {
    textAlign: 'center',
    color: COLORS.textSecondary,
    fontSize: 12,
    backgroundColor: COLORS.background,
    paddingHorizontal: 10,
  },

  // ==========================================
  // SHADOWS (for manual use)
  // ==========================================
  shadowSmall: SHADOWS.small,
  shadowMedium: SHADOWS.medium,
  shadowLarge: SHADOWS.large,

  // ==========================================
  // UTILITIES
  // ==========================================
  flexGrow: {
    flexGrow: 1,
  },
  
  flex1: {
    flex: 1,
  },
  
  textCenter: {
    textAlign: 'center',
  },
  
  mb10: {
    marginBottom: 10,
  },
  
  mb15: {
    marginBottom: 15,
  },
  
  mb20: {
    marginBottom: 20,
  },
  
  mt10: {
    marginTop: 10,
  },
  
  mt15: {
    marginTop: 15,
  },
  
  mt20: {
    marginTop: 20,
  },
  
  p10: {
    padding: 10,
  },
  
  p15: {
    padding: 15,
  },
  
  p20: {
    padding: 20,
  },
});

export default commonStyles;
