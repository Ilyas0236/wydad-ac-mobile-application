// ===========================================
// WYDAD AC - CRUD FORM MODAL COMPONENT
// Modal de formulaire CRUD pour admin
// ===========================================

import React from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { COLORS, SIZES, SHADOWS } from '../../theme/colors';

/**
 * Composant de modal pour formulaires CRUD admin
 * @param {Object} props
 * @param {boolean} props.visible - Visibilité du modal
 * @param {string} props.title - Titre du modal
 * @param {boolean} props.isEditing - Mode édition vs création
 * @param {boolean} props.saving - État de sauvegarde
 * @param {Function} props.onSave - Callback de sauvegarde
 * @param {Function} props.onCancel - Callback d'annulation
 * @param {React.ReactNode} props.children - Contenu du formulaire
 * @param {string} props.saveText - Texte du bouton sauvegarder
 * @param {string} props.cancelText - Texte du bouton annuler
 */
const CrudFormModal = ({
  visible = false,
  title = 'Formulaire',
  isEditing = false,
  saving = false,
  onSave,
  onCancel,
  children,
  saveText = null,
  cancelText = 'Annuler',
}) => {
  const defaultSaveText = isEditing ? 'Modifier' : 'Ajouter';

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onCancel}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.modalOverlay}
      >
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={onCancel} disabled={saving}>
              <Text style={[styles.cancelText, saving && styles.disabledText]}>
                {cancelText}
              </Text>
            </TouchableOpacity>
            
            <Text style={styles.modalTitle}>{title}</Text>
            
            <TouchableOpacity onPress={onSave} disabled={saving}>
              {saving ? (
                <ActivityIndicator size="small" color={COLORS.primary} />
              ) : (
                <Text style={styles.saveText}>
                  {saveText || defaultSaveText}
                </Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Content */}
          <ScrollView 
            style={styles.formContainer}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {children}
            <View style={styles.bottomSpacer} />
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

/**
 * Groupe de champ pour formulaire
 */
export const FormGroup = ({ label, required = false, error = null, children }) => (
  <View style={styles.formGroup}>
    <Text style={styles.label}>
      {label}
      {required && <Text style={styles.required}> *</Text>}
    </Text>
    {children}
    {error && <Text style={styles.errorText}>{error}</Text>}
  </View>
);

/**
 * Ligne de formulaire (2 colonnes)
 */
export const FormRow = ({ children }) => (
  <View style={styles.formRow}>{children}</View>
);

/**
 * Colonne de formulaire
 */
export const FormCol = ({ children, flex = 1 }) => (
  <View style={[styles.formCol, { flex }]}>{children}</View>
);

/**
 * Section de formulaire avec titre
 */
export const FormSection = ({ title, children }) => (
  <View style={styles.formSection}>
    {title && <Text style={styles.sectionTitle}>{title}</Text>}
    {children}
  </View>
);

/**
 * Séparateur de formulaire
 */
export const FormDivider = () => <View style={styles.divider} />;

/**
 * Image picker pour formulaire
 */
export const FormImagePicker = ({
  imageUrl,
  onPress,
  placeholder = 'Sélectionner une image',
  uploading = false,
}) => (
  <TouchableOpacity style={styles.imagePicker} onPress={onPress} disabled={uploading}>
    {imageUrl ? (
      <View style={styles.imagePreviewContainer}>
        {/* Note: Utiliser Image si nécessaire */}
        <Text style={styles.imagePreviewText}>Image sélectionnée</Text>
        <Text style={styles.changeImageText}>Changer</Text>
      </View>
    ) : (
      <View style={styles.imagePickerContent}>
        {uploading ? (
          <ActivityIndicator color={COLORS.primary} />
        ) : (
          <>
            <Text style={styles.imagePickerIcon}>📷</Text>
            <Text style={styles.imagePickerText}>{placeholder}</Text>
          </>
        )}
      </View>
    )}
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.card,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
    ...SHADOWS.large,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: COLORS.text,
  },
  cancelText: {
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  saveText: {
    fontSize: 16,
    color: COLORS.primary,
    fontWeight: '600',
  },
  disabledText: {
    opacity: 0.5,
  },
  formContainer: {
    padding: 20,
  },
  bottomSpacer: {
    height: 30,
  },

  // Form Group
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 8,
  },
  required: {
    color: COLORS.error,
  },
  errorText: {
    fontSize: 12,
    color: COLORS.error,
    marginTop: 4,
  },

  // Form Row
  formRow: {
    flexDirection: 'row',
    gap: 15,
  },
  formCol: {
    flex: 1,
  },

  // Form Section
  formSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 15,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },

  // Divider
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 20,
  },

  // Image Picker
  imagePicker: {
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: COLORS.border,
    borderRadius: SIZES.radiusMd,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 100,
  },
  imagePickerContent: {
    alignItems: 'center',
  },
  imagePickerIcon: {
    fontSize: 30,
    marginBottom: 8,
  },
  imagePickerText: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  imagePreviewContainer: {
    alignItems: 'center',
  },
  imagePreviewText: {
    fontSize: 14,
    color: COLORS.success,
    fontWeight: '500',
    marginBottom: 5,
  },
  changeImageText: {
    fontSize: 12,
    color: COLORS.primary,
  },
});

export default CrudFormModal;
