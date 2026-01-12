// ===========================================
// WYDAD AC - USE CRUD MODAL HOOK
// Hook pour gestion CRUD dans les écrans admin
// ===========================================

import { useState, useCallback } from 'react';
import { Alert } from 'react-native';
import api from '../services/api';

/**
 * Hook pour gérer les opérations CRUD avec modal
 * @param {Object} options - Options de configuration
 * @returns {Object} - État et fonctions de contrôle
 */
export const useCrudModal = (options = {}) => {
  const {
    apiEndpoint,
    initialForm = {},
    onSuccess = null,
    validateForm = null,
    transformFormToData = null,
    transformDataToForm = null,
    itemName = 'cet élément',
  } = options;

  const [modalVisible, setModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const isEditing = editingItem !== null;

  /**
   * Réinitialise le formulaire
   */
  const resetForm = useCallback(() => {
    setForm(initialForm);
    setEditingItem(null);
  }, [initialForm]);

  /**
   * Ouvre le modal pour ajouter
   */
  const openAdd = useCallback(() => {
    resetForm();
    setModalVisible(true);
  }, [resetForm]);

  /**
   * Ouvre le modal pour éditer
   */
  const openEdit = useCallback((item) => {
    setEditingItem(item);
    const formData = transformDataToForm ? transformDataToForm(item) : item;
    setForm({ ...initialForm, ...formData });
    setModalVisible(true);
  }, [initialForm, transformDataToForm]);

  /**
   * Ferme le modal
   */
  const closeModal = useCallback(() => {
    setModalVisible(false);
    resetForm();
  }, [resetForm]);

  /**
   * Met à jour un champ du formulaire
   */
  const updateField = useCallback((field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  }, []);

  /**
   * Sauvegarde (create ou update)
   */
  const handleSave = useCallback(async (customData = null) => {
    // Validation
    if (validateForm) {
      const validationError = validateForm(form);
      if (validationError) {
        Alert.alert('Erreur de validation', validationError);
        return { success: false, error: validationError };
      }
    }

    setSaving(true);

    try {
      const dataToSend = customData || (transformFormToData ? transformFormToData(form) : form);
      
      let response;
      if (isEditing) {
        response = await api.put(`${apiEndpoint}/${editingItem.id}`, dataToSend);
      } else {
        response = await api.post(apiEndpoint, dataToSend);
      }

      if (response.success) {
        Alert.alert(
          'Succès',
          isEditing ? 'Modification enregistrée!' : 'Ajout réussi!'
        );
        closeModal();
        onSuccess?.(response.data, isEditing ? 'update' : 'create');
        return { success: true, data: response.data };
      } else {
        Alert.alert('Erreur', response.message || 'Une erreur est survenue');
        return { success: false, error: response.message };
      }
    } catch (error) {
      console.error('CRUD save error:', error);
      Alert.alert('Erreur', error.message || 'Impossible de sauvegarder');
      return { success: false, error: error.message };
    } finally {
      setSaving(false);
    }
  }, [form, isEditing, editingItem, apiEndpoint, validateForm, transformFormToData, closeModal, onSuccess]);

  /**
   * Suppression avec confirmation
   */
  const handleDelete = useCallback((item, customItemName = null) => {
    const name = customItemName || itemName;
    
    Alert.alert(
      'Confirmer la suppression',
      `Voulez-vous vraiment supprimer ${name}? Cette action est irréversible.`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            setDeleting(true);
            try {
              const response = await api.delete(`${apiEndpoint}/${item.id}`);
              
              if (response.success) {
                Alert.alert('Succès', 'Suppression réussie!');
                onSuccess?.(item, 'delete');
              } else {
                Alert.alert('Erreur', response.message || 'Impossible de supprimer');
              }
            } catch (error) {
              console.error('CRUD delete error:', error);
              Alert.alert('Erreur', error.message || 'Impossible de supprimer');
            } finally {
              setDeleting(false);
            }
          },
        },
      ]
    );
  }, [apiEndpoint, itemName, onSuccess]);

  /**
   * Suppression directe sans confirmation
   */
  const deleteItem = useCallback(async (item) => {
    setDeleting(true);
    try {
      const response = await api.delete(`${apiEndpoint}/${item.id}`);
      
      if (response.success) {
        onSuccess?.(item, 'delete');
        return { success: true };
      } else {
        return { success: false, error: response.message };
      }
    } catch (error) {
      console.error('CRUD delete error:', error);
      return { success: false, error: error.message };
    } finally {
      setDeleting(false);
    }
  }, [apiEndpoint, onSuccess]);

  return {
    // État
    modalVisible,
    isEditing,
    editingItem,
    form,
    saving,
    deleting,
    
    // Actions
    openAdd,
    openEdit,
    closeModal,
    resetForm,
    updateField,
    setForm,
    handleSave,
    handleDelete,
    deleteItem,
  };
};

export default useCrudModal;
