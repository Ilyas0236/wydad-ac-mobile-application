// ===========================================
// WYDAD AC - IMAGE PICKER COMPONENT
// ===========================================
// Composant réutilisable pour sélection d'image
// ===========================================

import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import useImagePicker from '../hooks/useImagePicker';
import { COLORS, SIZES, SHADOWS } from '../theme/colors';

/**
 * Composant ImagePickerButton
 * @param {Object} props
 * @param {string} props.currentImage - URL de l'image actuelle
 * @param {function} props.onImageSelected - Callback quand une image est sélectionnée
 * @param {string} props.placeholder - Texte placeholder
 * @param {Object} props.style - Styles additionnels
 * @param {string} props.aspectRatio - Ratio de l'image (par défaut 4:3)
 * @param {number} props.size - Taille du bouton (par défaut 120)
 * @param {boolean} props.circular - Si le bouton doit être circulaire
 */
const ImagePickerButton = ({
  currentImage,
  onImageSelected,
  placeholder = '📷 Ajouter une photo',
  style,
  aspectRatio = [4, 3],
  size = 120,
  circular = false,
  quality = 0.8,
}) => {
  const {
    image,
    isLoading,
    showImagePickerOptions,
    setImageUri,
  } = useImagePicker();

  // Utiliser l'image locale si disponible, sinon l'image actuelle
  const displayImage = image?.uri || currentImage;

  // Gérer la sélection d'image
  const handlePress = async () => {
    const selectedImage = await showImagePickerOptions({
      aspect: aspectRatio,
      quality,
    });

    if (selectedImage && onImageSelected) {
      onImageSelected(selectedImage);
    }
  };

  // Calculer les dimensions
  const containerStyle = circular
    ? {
        width: size,
        height: size,
        borderRadius: size / 2,
      }
    : {
        width: size,
        height: size * (aspectRatio[1] / aspectRatio[0]),
        borderRadius: SIZES.radiusMd,
      };

  return (
    <TouchableOpacity
      style={[styles.container, containerStyle, style]}
      onPress={handlePress}
      disabled={isLoading}
    >
      {isLoading ? (
        <ActivityIndicator size="large" color={COLORS.primary} />
      ) : displayImage ? (
        <>
          <Image
            source={{ uri: displayImage }}
            style={[styles.image, containerStyle]}
            resizeMode="cover"
          />
          <View style={styles.editOverlay}>
            <Text style={styles.editIcon}>✏️</Text>
          </View>
        </>
      ) : (
        <View style={styles.placeholderContainer}>
          <Text style={styles.cameraIcon}>📷</Text>
          <Text style={styles.placeholderText}>{placeholder}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

/**
 * Composant complet avec boutons séparés
 */
export const ImagePickerWithButtons = ({
  currentImage,
  onImageSelected,
  onRemoveImage,
  style,
  aspectRatio = [4, 3],
  quality = 0.8,
}) => {
  const {
    isLoading,
    pickImageFromGallery,
    takePhoto,
  } = useImagePicker();

  const handleGalleryPress = async () => {
    const selectedImage = await pickImageFromGallery({
      aspect: aspectRatio,
      quality,
    });
    if (selectedImage && onImageSelected) {
      onImageSelected(selectedImage);
    }
  };

  const handleCameraPress = async () => {
    const selectedImage = await takePhoto({
      aspect: aspectRatio,
      quality,
    });
    if (selectedImage && onImageSelected) {
      onImageSelected(selectedImage);
    }
  };

  return (
    <View style={[styles.fullContainer, style]}>
      {/* Preview de l'image */}
      <View style={styles.previewContainer}>
        {currentImage ? (
          <Image
            source={{ uri: currentImage }}
            style={styles.previewImage}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.previewPlaceholder}>
            <Text style={styles.previewPlaceholderIcon}>🖼️</Text>
            <Text style={styles.previewPlaceholderText}>Aucune image</Text>
          </View>
        )}
      </View>

      {/* Boutons */}
      <View style={styles.buttonsContainer}>
        <TouchableOpacity
          style={[styles.button, styles.galleryButton]}
          onPress={handleGalleryPress}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color={COLORS.textWhite} />
          ) : (
            <>
              <Text style={styles.buttonIcon}>🖼️</Text>
              <Text style={styles.buttonText}>Galerie</Text>
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.cameraButton]}
          onPress={handleCameraPress}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color={COLORS.textWhite} />
          ) : (
            <>
              <Text style={styles.buttonIcon}>📷</Text>
              <Text style={styles.buttonText}>Caméra</Text>
            </>
          )}
        </TouchableOpacity>

        {currentImage && onRemoveImage && (
          <TouchableOpacity
            style={[styles.button, styles.removeButton]}
            onPress={onRemoveImage}
            disabled={isLoading}
          >
            <Text style={styles.buttonIcon}>🗑️</Text>
            <Text style={styles.buttonText}>Supprimer</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  // ImagePickerButton styles
  container: {
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: COLORS.border,
    borderStyle: 'dashed',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  editOverlay: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  editIcon: {
    fontSize: 14,
  },
  placeholderContainer: {
    alignItems: 'center',
    padding: 10,
  },
  cameraIcon: {
    fontSize: 32,
    marginBottom: 5,
  },
  placeholderText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },

  // ImagePickerWithButtons styles
  fullContainer: {
    marginVertical: 10,
  },
  previewContainer: {
    width: '100%',
    height: 200,
    backgroundColor: COLORS.background,
    borderRadius: SIZES.radiusMd,
    overflow: 'hidden',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  previewPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewPlaceholderIcon: {
    fontSize: 48,
    marginBottom: 10,
  },
  previewPlaceholderText: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: SIZES.radiusMd,
    gap: 5,
  },
  galleryButton: {
    backgroundColor: COLORS.primary,
  },
  cameraButton: {
    backgroundColor: COLORS.primaryDark,
  },
  removeButton: {
    backgroundColor: COLORS.error,
    flex: 0.5,
  },
  buttonIcon: {
    fontSize: 16,
  },
  buttonText: {
    color: COLORS.textWhite,
    fontSize: 12,
    fontWeight: '600',
  },
});

export default ImagePickerButton;
