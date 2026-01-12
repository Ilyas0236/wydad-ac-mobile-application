// ===========================================
// WYDAD AC - HOOKS INDEX
// Export centralisé des hooks personnalisés
// ===========================================

// Sélection d'images
export { default as useImagePicker } from './useImagePicker';
export { useImagePicker as useImagePickerHook } from './useImagePicker';

// Chargement de données API
export { useAsyncData, useAsyncList, usePaginatedData } from './useAsyncData';
export { default as useAsyncDataDefault } from './useAsyncData';

// Gestion CRUD Admin
export { useCrudModal } from './useCrudModal';
export { default as useCrudModalDefault } from './useCrudModal';

// Upload d'images
export { useImageUpload } from './useImageUpload';
export { default as useImageUploadDefault } from './useImageUpload';

// Formulaire de paiement
export { usePaymentForm } from './usePaymentForm';
export { default as usePaymentFormDefault } from './usePaymentForm';
