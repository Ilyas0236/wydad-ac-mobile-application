// ===========================================
// WYDAD AC - USE IMAGE PICKER HOOK
// ===========================================
// Hook personnalisé pour sélectionner des images
// depuis la galerie ou la caméra
// ===========================================

import { useState, useCallback, useMemo } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { Alert, Platform } from 'react-native';

/**
 * Hook personnalisé pour la sélection d'images
 * @param {Object} config - Configuration initiale
 * @returns {Object} - Fonctions et états pour gérer la sélection d'image
 */
const useImagePicker = (config = {}) => {
  const [image, setImage] = useState(null);
  const [images, setImages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Options par défaut pour le picker
   */
  const defaultOptions = useMemo(() => ({
    mediaTypes: ['images'],
    allowsEditing: true,
    aspect: config.aspect || [4, 3],
    quality: config.quality || 0.8,
  }), [config.aspect, config.quality]);

  /**
   * Réinitialiser l'erreur
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Demander les permissions pour la galerie
   */
  const requestGalleryPermission = useCallback(async () => {
    if (Platform.OS === 'web') return true;
    
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        const errorMsg = 'L\'accès à la galerie est nécessaire pour sélectionner une image.';
        setError(errorMsg);
        Alert.alert('Permission requise', errorMsg, [{ text: 'OK' }]);
        return false;
      }
      return true;
    } catch (err) {
      setError('Erreur lors de la demande de permission galerie');
      return false;
    }
  }, []);

  /**
   * Demander les permissions pour la caméra
   */
  const requestCameraPermission = useCallback(async () => {
    if (Platform.OS === 'web') return true;
    
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        const errorMsg = 'L\'accès à la caméra est nécessaire pour prendre une photo.';
        setError(errorMsg);
        Alert.alert('Permission requise', errorMsg, [{ text: 'OK' }]);
        return false;
      }
      return true;
    } catch (err) {
      setError('Erreur lors de la demande de permission caméra');
      return false;
    }
  }, []);

  /**
   * Valider l'image (taille, type)
   * @param {Object} imageAsset - Asset image à valider
   * @param {Object} constraints - Contraintes de validation
   */
  const validateImage = useCallback((imageAsset, constraints = {}) => {
    const { maxSizeMB = 10, allowedTypes = ['image/jpeg', 'image/png', 'image/webp'] } = constraints;
    
    if (imageAsset.fileSize) {
      const sizeMB = imageAsset.fileSize / (1024 * 1024);
      if (sizeMB > maxSizeMB) {
        return { valid: false, error: `L'image ne doit pas dépasser ${maxSizeMB}MB` };
      }
    }
    
    if (imageAsset.mimeType && !allowedTypes.includes(imageAsset.mimeType)) {
      return { valid: false, error: 'Type d\'image non supporté' };
    }
    
    return { valid: true, error: null };
  }, []);

  /**
   * Sélectionner une image depuis la galerie
   * @param {Object} options - Options additionnelles pour le picker
   */
  const pickImageFromGallery = useCallback(async (options = {}) => {
    try {
      clearError();
      const hasPermission = await requestGalleryPermission();
      if (!hasPermission) return null;

      setIsLoading(true);

      const result = await ImagePicker.launchImageLibraryAsync({
        ...defaultOptions,
        ...options,
      });

      if (!result.canceled && result.assets?.length > 0) {
        const selectedImage = result.assets[0];
        
        if (options.validate) {
          const validation = validateImage(selectedImage, options.constraints);
          if (!validation.valid) {
            setError(validation.error);
            Alert.alert('Validation', validation.error);
            return null;
          }
        }
        
        setImage(selectedImage);
        return selectedImage;
      }

      return null;
    } catch (err) {
      const errorMsg = 'Impossible de sélectionner l\'image';
      console.error('Erreur sélection image:', err);
      setError(errorMsg);
      Alert.alert('Erreur', errorMsg);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [defaultOptions, requestGalleryPermission, clearError, validateImage]);

  /**
   * Sélectionner plusieurs images depuis la galerie
   * @param {Object} options - Options additionnelles pour le picker
   */
  const pickMultipleImages = useCallback(async (options = {}) => {
    try {
      clearError();
      const hasPermission = await requestGalleryPermission();
      if (!hasPermission) return [];

      setIsLoading(true);

      const result = await ImagePicker.launchImageLibraryAsync({
        ...defaultOptions,
        ...options,
        allowsMultipleSelection: true,
        allowsEditing: false, // Désactivé pour sélection multiple
      });

      if (!result.canceled && result.assets?.length > 0) {
        setImages(result.assets);
        return result.assets;
      }

      return [];
    } catch (err) {
      const errorMsg = 'Impossible de sélectionner les images';
      console.error('Erreur sélection multiple:', err);
      setError(errorMsg);
      Alert.alert('Erreur', errorMsg);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [defaultOptions, requestGalleryPermission, clearError]);

  /**
   * Prendre une photo avec la caméra
   * @param {Object} options - Options additionnelles pour le picker
   */
  const takePhoto = useCallback(async (options = {}) => {
    try {
      clearError();
      const hasPermission = await requestCameraPermission();
      if (!hasPermission) return null;

      setIsLoading(true);

      const result = await ImagePicker.launchCameraAsync({
        ...defaultOptions,
        ...options,
      });

      if (!result.canceled && result.assets?.length > 0) {
        const selectedImage = result.assets[0];
        setImage(selectedImage);
        return selectedImage;
      }

      return null;
    } catch (err) {
      const errorMsg = 'Impossible de prendre la photo';
      console.error('Erreur prise de photo:', err);
      setError(errorMsg);
      Alert.alert('Erreur', errorMsg);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [defaultOptions, requestCameraPermission, clearError]);

  /**
   * Afficher un menu de choix (galerie ou caméra)
   * @param {Object} options - Options additionnelles pour le picker
   */
  const showImagePickerOptions = useCallback((options = {}) => {
    return new Promise((resolve) => {
      Alert.alert(
        'Choisir une image',
        'D\'où voulez-vous sélectionner l\'image?',
        [
          {
            text: 'Annuler',
            style: 'cancel',
            onPress: () => resolve(null),
          },
          {
            text: '📷 Caméra',
            onPress: async () => {
              const result = await takePhoto(options);
              resolve(result);
            },
          },
          {
            text: '🖼️ Galerie',
            onPress: async () => {
              const result = await pickImageFromGallery(options);
              resolve(result);
            },
          },
        ]
      );
    });
  }, [pickImageFromGallery, takePhoto]);

  /**
   * Réinitialiser l'image sélectionnée
   */
  const clearImage = useCallback(() => {
    setImage(null);
    setError(null);
  }, []);

  /**
   * Réinitialiser toutes les images
   */
  const clearAllImages = useCallback(() => {
    setImage(null);
    setImages([]);
    setError(null);
  }, []);

  /**
   * Définir une image directement (par URL)
   */
  const setImageUri = useCallback((uri) => {
    setImage(uri ? { uri } : null);
  }, []);

  return {
    // États
    image,
    images,
    isLoading,
    error,
    
    // Méthodes principales
    pickImageFromGallery,
    pickMultipleImages,
    takePhoto,
    showImagePickerOptions,
    
    // Utilitaires
    clearImage,
    clearAllImages,
    clearError,
    setImageUri,
    validateImage,
    
    // Permissions
    requestGalleryPermission,
    requestCameraPermission,
  };
};

export default useImagePicker;
