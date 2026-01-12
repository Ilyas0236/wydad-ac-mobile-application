// ===========================================
// WYDAD AC - COMPONENTS INDEX
// Export centralisé de tous les composants
// ===========================================

// Image Picker
export { default as ImagePickerButton, ImagePickerWithButtons } from './ImagePickerButton';

// États d'écran
export { default as LoadingScreen, LoadingIndicator, LoadingOverlay } from './LoadingScreen';
export { default as ErrorState, NotFoundState, ConnectionErrorState, AuthErrorState } from './ErrorState';
export { 
  default as EmptyState,
  EmptyPlayers,
  EmptyMatches,
  EmptyProducts,
  EmptyNews,
  EmptyCart,
  EmptyOrders,
  EmptyTickets,
  EmptyStores,
  EmptySearch,
} from './EmptyState';

// Navigation & Headers
export { default as ScreenHeader, GradientHeader, ModalHeader } from './ScreenHeader';

// Filtres & Onglets
export { default as FilterTabs, FilterTabsVertical, SegmentedTabs } from './FilterTabs';

// Badges & Statuts
export { default as StatusBadge, StatusDot, CustomBadge } from './StatusBadge';

// Sélecteurs
export { default as QuantitySelector, QuantitySelectorCompact } from './QuantitySelector';

// Formulaires
export { default as PaymentForm, PaymentFormStandalone } from './PaymentForm';

// Admin
export { 
  default as CrudFormModal,
  FormGroup,
  FormRow,
  FormCol,
  FormSection,
  FormDivider,
  FormImagePicker,
} from './admin/CrudFormModal';
