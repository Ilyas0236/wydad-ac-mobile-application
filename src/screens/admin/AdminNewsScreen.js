// ===========================================
// WYDAD AC - ADMIN NEWS SCREEN
// ===========================================

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { newsAPI, uploadAPI } from '../../services/api';
import { COLORS, SIZES, SHADOWS } from '../../theme/colors';
import api from '../../services/api';
import { useImagePicker } from '../../hooks';

const AdminNewsScreen = ({ navigation }) => {
  const [news, setNews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingNews, setEditingNews] = useState(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [localImageUri, setLocalImageUri] = useState(null);
  const [imageError, setImageError] = useState(false);
  
  // Hook pour sélection d'images
  const { showImagePickerOptions, pickImageFromGallery, takePhoto } = useImagePicker();

  // Form state
  const [form, setForm] = useState({
    title: '',
    content: '',
    summary: '',
    image: '',
    category: 'general',
  });

  const CATEGORIES = [
    { key: 'general', label: '📰 Général' },
    { key: 'match', label: '⚽ Match' },
    { key: 'transfert', label: '🔄 Transfert' },
    { key: 'club', label: '🏟️ Club' },
  ];

  useEffect(() => {
    loadNews();
  }, []);

  const loadNews = async () => {
    try {
      const response = await newsAPI.getAll();
      if (response.success) {
        setNews(response.data);
      }
    } catch (error) {
      console.error('Erreur chargement actualités:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadNews();
    setRefreshing(false);
  };

  const resetForm = () => {
    setForm({
      title: '',
      content: '',
      summary: '',
      image: '',
      category: 'general',
    });
    setEditingNews(null);
    setLocalImageUri(null);
    setImageError(false);
  };

  const openAddModal = () => {
    resetForm();
    setModalVisible(true);
  };

  const openEditModal = (item) => {
    setEditingNews(item);
    setForm({
      title: item.title,
      content: item.content || '',
      summary: item.summary || '',
      image: item.image || '',
      category: item.category || 'general',
    });
    setLocalImageUri(null);
    setImageError(false);
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!form.title || !form.content) {
      Alert.alert('Erreur', 'Titre et contenu sont requis');
      return;
    }

    setSaving(true);
    try {
      let finalImageUrl = form.image;
      
      // Si une nouvelle image a été sélectionnée depuis la galerie, l'uploader
      if (localImageUri) {
        setUploading(true);
        try {
          const uploadResult = await uploadAPI.uploadImage(
            { uri: localImageUri },
            'news'
          );
          if (uploadResult.success && uploadResult.data) {
            finalImageUrl = uploadAPI.getImageUrl(uploadResult.data.url);
          }
        } catch (uploadError) {
          console.error('Erreur upload:', uploadError);
          Alert.alert('Attention', 'Image non uploadée, mais l\'article sera créé sans image');
        } finally {
          setUploading(false);
        }
      }
      
      const newsData = {
        title: form.title,
        content: form.content,
        summary: form.summary || form.content.substring(0, 150) + '...',
        image: finalImageUrl,
        category: form.category,
      };

      let response;
      if (editingNews) {
        response = await api.put(`/news/${editingNews.id}`, newsData);
      } else {
        response = await api.post('/news', newsData);
      }

      if (response.success) {
        Alert.alert('Succès', editingNews ? 'Article modifié!' : 'Article ajouté!');
        setModalVisible(false);
        resetForm();
        loadNews();
      } else {
        Alert.alert('Erreur', response.message);
      }
    } catch (error) {
      Alert.alert('Erreur', error.message || 'Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (item) => {
    Alert.alert(
      'Supprimer',
      `Voulez-vous supprimer "${item.title}"?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await api.delete(`/news/${item.id}`);
              if (response.success) {
                Alert.alert('Succès', 'Article supprimé');
                loadNews();
              }
            } catch (error) {
              Alert.alert('Erreur', error.message);
            }
          },
        },
      ]
    );
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const getCategoryLabel = (key) => {
    const cat = CATEGORIES.find(c => c.key === key);
    return cat?.label || '📰 Général';
  };

  const renderNews = ({ item }) => (
    <View style={styles.newsCard}>
      <View style={styles.newsImage}>
        {item.image ? (
          <Image source={{ uri: item.image }} style={styles.image} />
        ) : (
          <Text style={styles.imagePlaceholder}>📰</Text>
        )}
      </View>
      <View style={styles.newsInfo}>
        <View style={styles.newsHeader}>
          <Text style={styles.newsCategory}>{getCategoryLabel(item.category)}</Text>
          <Text style={styles.newsDate}>{formatDate(item.created_at)}</Text>
        </View>
        <Text style={styles.newsTitle} numberOfLines={2}>{item.title}</Text>
      </View>
      <View style={styles.newsActions}>
        <TouchableOpacity style={styles.editBtn} onPress={() => openEditModal(item)}>
          <Text style={styles.actionIcon}>✏️</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDelete(item)}>
          <Text style={styles.actionIcon}>🗑️</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>📰 Gestion Actualités</Text>
        <TouchableOpacity onPress={openAddModal}>
          <Text style={styles.addButton}>+ Ajouter</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={news}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderNews}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />
        }
        ListEmptyComponent={
          isLoading ? (
            <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 50 }} />
          ) : (
            <Text style={styles.emptyText}>Aucune actualité</Text>
          )
        }
      />

      {/* Modal Add/Edit */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.modalTitle}>
                {editingNews ? '✏️ Modifier article' : '➕ Ajouter article'}
              </Text>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Titre *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Titre de l'article"
                  placeholderTextColor={COLORS.textLight}
                  value={form.title}
                  onChangeText={(text) => setForm({ ...form, title: text })}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Catégorie</Text>
                <View style={styles.categoriesRow}>
                  {CATEGORIES.map((cat) => (
                    <TouchableOpacity
                      key={cat.key}
                      style={[
                        styles.categoryBtn,
                        form.category === cat.key && styles.categoryBtnActive,
                      ]}
                      onPress={() => setForm({ ...form, category: cat.key })}
                    >
                      <Text
                        style={[
                          styles.categoryText,
                          form.category === cat.key && styles.categoryTextActive,
                        ]}
                      >
                        {cat.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Résumé</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Court résumé de l'article..."
                  placeholderTextColor={COLORS.textLight}
                  value={form.summary}
                  onChangeText={(text) => setForm({ ...form, summary: text })}
                  multiline
                  numberOfLines={2}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Contenu *</Text>
                <TextInput
                  style={[styles.input, styles.textAreaLarge]}
                  placeholder="Contenu complet de l'article..."
                  placeholderTextColor={COLORS.textLight}
                  value={form.content}
                  onChangeText={(text) => setForm({ ...form, content: text })}
                  multiline
                  numberOfLines={6}
                />
              </View>

              {/* Section Image */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Image de l'article</Text>
                
                {/* Preview de l'image */}
                <TouchableOpacity 
                  style={styles.imagePreview}
                  onPress={async () => {
                    const selectedImage = await showImagePickerOptions({ aspect: [16, 9], quality: 0.8 });
                    if (selectedImage) {
                      setLocalImageUri(selectedImage.uri);
                      setImageError(false);
                    }
                  }}
                >
                  {(localImageUri || form.image) && !imageError ? (
                    <Image 
                      source={{ uri: localImageUri || form.image }} 
                      style={styles.previewImage}
                      onError={() => setImageError(true)}
                    />
                  ) : (
                    <View style={styles.noImagePreview}>
                      <Text style={styles.noImageIcon}>🖼️</Text>
                      <Text style={styles.noImageText}>Touchez pour ajouter une image</Text>
                    </View>
                  )}
                  {uploading && (
                    <View style={styles.uploadOverlay}>
                      <ActivityIndicator size="large" color={COLORS.textWhite} />
                      <Text style={styles.uploadText}>Upload...</Text>
                    </View>
                  )}
                </TouchableOpacity>
                
                {/* Boutons de sélection d'image */}
                <View style={styles.imageButtonsRow}>
                  <TouchableOpacity 
                    style={styles.imageButton}
                    onPress={async () => {
                      const selectedImage = await pickImageFromGallery({ aspect: [16, 9], quality: 0.8 });
                      if (selectedImage) {
                        setLocalImageUri(selectedImage.uri);
                        setImageError(false);
                      }
                    }}
                  >
                    <Text style={styles.imageButtonIcon}>🖼️</Text>
                    <Text style={styles.imageButtonText}>Galerie</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={styles.imageButton}
                    onPress={async () => {
                      const selectedImage = await takePhoto({ aspect: [16, 9], quality: 0.8 });
                      if (selectedImage) {
                        setLocalImageUri(selectedImage.uri);
                        setImageError(false);
                      }
                    }}
                  >
                    <Text style={styles.imageButtonIcon}>📷</Text>
                    <Text style={styles.imageButtonText}>Caméra</Text>
                  </TouchableOpacity>
                  
                  {(localImageUri || form.image) && (
                    <TouchableOpacity 
                      style={[styles.imageButton, styles.removeImageButton]}
                      onPress={() => {
                        setLocalImageUri(null);
                        setForm({ ...form, image: '' });
                        setImageError(false);
                      }}
                    >
                      <Text style={styles.imageButtonIcon}>🗑️</Text>
                      <Text style={styles.imageButtonText}>Supprimer</Text>
                    </TouchableOpacity>
                  )}
                </View>
                
                {/* URL externe optionnelle */}
                <TextInput
                  style={[styles.input, { marginTop: 10 }]}
                  placeholder="Ou URL externe: https://..."
                  placeholderTextColor={COLORS.textLight}
                  value={form.image}
                  onChangeText={(text) => {
                    setForm({ ...form, image: text });
                    setLocalImageUri(null);
                    setImageError(false);
                  }}
                />
              </View>

              <TouchableOpacity
                style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
                onPress={handleSave}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator color={COLORS.textWhite} />
                ) : (
                  <Text style={styles.saveBtnText}>
                    {editingNews ? 'Enregistrer' : 'Publier'}
                  </Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => {
                  setModalVisible(false);
                  resetForm();
                }}
              >
                <Text style={styles.cancelBtnText}>Annuler</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SIZES.screenPadding,
    backgroundColor: COLORS.primary,
  },
  backButton: {
    color: COLORS.textWhite,
    fontSize: 24,
  },
  headerTitle: {
    color: COLORS.textWhite,
    fontSize: 16,
    fontWeight: 'bold',
  },
  addButton: {
    color: COLORS.textWhite,
    fontSize: 14,
    fontWeight: '600',
  },
  list: {
    padding: SIZES.screenPadding,
  },
  newsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: SIZES.radiusMd,
    padding: 12,
    marginBottom: 10,
    ...SHADOWS.small,
  },
  newsImage: {
    width: 70,
    height: 70,
    borderRadius: SIZES.radiusSm,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  imagePlaceholder: {
    fontSize: 28,
  },
  newsInfo: {
    flex: 1,
    marginLeft: 12,
  },
  newsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  newsCategory: {
    fontSize: 11,
    color: COLORS.primary,
  },
  newsDate: {
    fontSize: 11,
    color: COLORS.textSecondary,
  },
  newsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.text,
    lineHeight: 18,
  },
  newsActions: {
    flexDirection: 'column',
  },
  editBtn: {
    padding: 8,
  },
  deleteBtn: {
    padding: 8,
  },
  actionIcon: {
    fontSize: 18,
  },
  emptyText: {
    textAlign: 'center',
    color: COLORS.textSecondary,
    marginTop: 50,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.card,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '90%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 15,
  },
  inputLabel: {
    fontSize: 14,
    color: COLORS.text,
    marginBottom: 5,
    fontWeight: '600',
  },
  input: {
    backgroundColor: COLORS.background,
    borderRadius: SIZES.radiusMd,
    padding: 15,
    fontSize: 16,
    color: COLORS.text,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  textArea: {
    minHeight: 60,
    textAlignVertical: 'top',
  },
  textAreaLarge: {
    minHeight: 120,
    textAlignVertical: 'top',
  },
  categoriesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryBtn: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  categoryBtnActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  categoryText: {
    fontSize: 12,
    color: COLORS.text,
  },
  categoryTextActive: {
    color: COLORS.textWhite,
    fontWeight: 'bold',
  },
  saveBtn: {
    backgroundColor: COLORS.primary,
    padding: 18,
    borderRadius: SIZES.radiusMd,
    alignItems: 'center',
    marginTop: 10,
    ...SHADOWS.medium,
  },
  saveBtnDisabled: {
    opacity: 0.6,
  },
  saveBtnText: {
    color: COLORS.textWhite,
    fontSize: 16,
    fontWeight: 'bold',
  },
  cancelBtn: {
    padding: 15,
    alignItems: 'center',
  },
  cancelBtnText: {
    color: COLORS.textSecondary,
    fontSize: 14,
  },
  // Styles pour l'upload d'image
  imagePreview: {
    width: '100%',
    height: 180,
    backgroundColor: COLORS.background,
    borderRadius: SIZES.radiusMd,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  previewImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  noImagePreview: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  noImageIcon: {
    fontSize: 40,
    marginBottom: 5,
  },
  noImageText: {
    color: COLORS.textSecondary,
    fontSize: 12,
  },
  imageButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
    gap: 10,
  },
  imageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: SIZES.radiusSm,
    gap: 5,
  },
  removeImageButton: {
    backgroundColor: COLORS.error || '#dc3545',
  },
  imageButtonIcon: {
    fontSize: 16,
  },
  imageButtonText: {
    color: COLORS.textWhite,
    fontSize: 12,
    fontWeight: '600',
  },
  uploadOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: SIZES.radiusMd,
  },
  uploadText: {
    color: COLORS.textWhite,
    marginTop: 10,
    fontSize: 14,
  },
});

export default AdminNewsScreen;
