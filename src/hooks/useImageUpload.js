// ===========================================
// WYDAD AC - USE IMAGE UPLOAD HOOK
// Hook pour upload d'images
// ===========================================

import { useState, useCallback } from 'react';
import { Alert } from 'react-native';
import { uploadAPI } from '../services/api';
import { useImagePicker } from './useImagePicker';

/**
 * Hook pour gérer la sélection et l'upload d'images
 * @param {Object} options - Options de configuration
 * @returns {Object} - État et fonctions de contrôle
 */
export const useImageUpload = (options = {}) => {
  const {
    category = 'uploads',
    onUploadSuccess = null,
    onUploadError = null,
    aspect = [4, 3],
    quality = 0.8,
  } = options;

  const [localUri, setLocalUri] = useState(null);
  const [remoteUrl, setRemoteUrl] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState(null);

  const { showImagePickerOptions } = useImagePicker();

  /**
   * Ouvre le sélecteur d'image
   */
  const selectImage = useCallback(async (pickerOptions = {}) => {
    try {
      setError(null);
      
      const selectedImage = await showImagePickerOptions({
        aspect,
        quality,
        allowsEditing: true,
        ...pickerOptions,
      });

      if (selectedImage) {
        setLocalUri(selectedImage.uri);
        setRemoteUrl(null); // Reset remote URL quand nouvelle image sélectionnée
        return selectedImage;
      }
      
      return null;
    } catch (err) {
      console.error('Image selection error:', err);
      setError(err.message);
      return null;
    }
  }, [showImagePickerOptions, aspect, quality]);

  /**
   * Upload l'image sélectionnée
   */
  const uploadImage = useCallback(async (customUri = null) => {
    const uriToUpload = customUri || localUri;
    
    if (!uriToUpload) {
      const errorMsg = 'Aucune image à uploader';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    }

    setIsUploading(true);
    setUploadProgress(0);
    setError(null);

    try {
      const uploadResult = await uploadAPI.uploadImage(
        { uri: uriToUpload },
        category
      );

      if (uploadResult.success && uploadResult.data) {
        const imageUrl = uploadAPI.getImageUrl(uploadResult.data.url);
        setRemoteUrl(imageUrl);
        setUploadProgress(100);
        onUploadSuccess?.(imageUrl, uploadResult.data);
        return { success: true, url: imageUrl, data: uploadResult.data };
      } else {
        const errorMsg = uploadResult.message || 'Erreur lors de l\'upload';
        setError(errorMsg);
        onUploadError?.(errorMsg);
        return { success: false, error: errorMsg };
      }
    } catch (err) {
      console.error('Image upload error:', err);
      const errorMsg = err.message || 'Impossible d\'uploader l\'image';
      setError(errorMsg);
      onUploadError?.(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setIsUploading(false);
    }
  }, [localUri, category, onUploadSuccess, onUploadError]);

  /**
   * Sélectionne et upload immédiatement
   */
  const selectAndUpload = useCallback(async (pickerOptions = {}) => {
    const selectedImage = await selectImage(pickerOptions);
    
    if (selectedImage) {
      return await uploadImage(selectedImage.uri);
    }
    
    return { success: false, error: 'Aucune image sélectionnée' };
  }, [selectImage, uploadImage]);

  /**
   * Réinitialise l'état
   */
  const reset = useCallback(() => {
    setLocalUri(null);
    setRemoteUrl(null);
    setIsUploading(false);
    setUploadProgress(0);
    setError(null);
  }, []);

  /**
   * Définit une URL existante (pour édition)
   */
  const setExistingImage = useCallback((url) => {
    setRemoteUrl(url);
    setLocalUri(null);
  }, []);

  /**
   * Retourne l'URL à utiliser (locale ou distante)
   */
  const getDisplayUrl = useCallback(() => {
    return localUri || remoteUrl;
  }, [localUri, remoteUrl]);

  /**
   * Retourne l'URL finale pour sauvegarde
   */
  const getFinalUrl = useCallback(async (existingUrl = null) => {
    // Si une nouvelle image a été sélectionnée mais pas encore uploadée
    if (localUri && !remoteUrl) {
      const result = await uploadImage();
      if (result.success) {
        return result.url;
      }
      // Retourne l'URL existante en cas d'échec d'upload
      Alert.alert('Attention', 'L\'image n\'a pas pu être uploadée. L\'ancienne image sera conservée.');
      return existingUrl;
    }
    
    // Si l'image a déjà été uploadée
    if (remoteUrl) {
      return remoteUrl;
    }
    
    // Retourne l'URL existante si aucune nouvelle image
    return existingUrl;
  }, [localUri, remoteUrl, uploadImage]);

  return {
    // État
    localUri,
    remoteUrl,
    isUploading,
    uploadProgress,
    error,
    hasNewImage: !!localUri,
    hasImage: !!(localUri || remoteUrl),
    
    // Actions
    selectImage,
    uploadImage,
    selectAndUpload,
    reset,
    setExistingImage,
    getDisplayUrl,
    getFinalUrl,
  };
};

export default useImageUpload;
