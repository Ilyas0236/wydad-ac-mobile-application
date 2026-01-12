// ===========================================
// WYDAD AC - ADMIN PRODUCTS SCREEN
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
import { productsAPI, uploadAPI } from '../../services/api';
import { COLORS, SIZES, SHADOWS } from '../../theme/colors';
import api from '../../services/api';
import { useImagePicker } from '../../hooks';

const CATEGORIES = [
  { key: 'maillots', label: '👕 Maillots' },
  { key: 'vetements', label: '🧥 Vêtements' },
  { key: 'accessoires', label: '🧢 Accessoires' },
  { key: 'echarpes', label: '🚩 Écharpes' },
  { key: 'equipement', label: '⚽ Équipement' },
  { key: 'enfants', label: '👶 Enfants' },
  { key: 'collectors', label: '🏆 Collectors' },
];

const SIZE_OPTIONS = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
const COLOR_OPTIONS = [
  { name: 'Rouge', color: '#C8102E' },
  { name: 'Blanc', color: '#FFFFFF' },
  { name: 'Noir', color: '#000000' },
  { name: 'Or', color: '#FFD700' },
];

const AdminProductsScreen = ({ navigation }) => {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [saving, setSaving] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [filterCategory, setFilterCategory] = useState('all');
  const [uploading, setUploading] = useState(false);
  const [localImageUri, setLocalImageUri] = useState(null);
  
  // Hook pour sélection d'images
  const { showImagePickerOptions, pickImageFromGallery, takePhoto } = useImagePicker();

  // Form state
  const [form, setForm] = useState({
    name: '',
    description: '',
    price: '',
    category: 'maillots',
    stock: '100',
    image: '',
    is_featured: false,
    sizes: [],
    colors: [],
  });

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const response = await productsAPI.getAll();
      if (response.success) {
        setProducts(response.data);
      }
    } catch (error) {
      console.error('Erreur chargement produits:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadProducts();
    setRefreshing(false);
  };

  const resetForm = () => {
    setForm({
      name: '',
      description: '',
      price: '',
      category: 'maillots',
      stock: '100',
      image: '',
      is_featured: false,
      sizes: [],
      colors: [],
    });
    setEditingProduct(null);
    setImageError(false);
    setLocalImageUri(null);
  };

  const openAddModal = () => {
    resetForm();
    setModalVisible(true);
  };

  const openEditModal = (product) => {
    setEditingProduct(product);
    setForm({
      name: product.name,
      description: product.description || '',
      price: product.price.toString(),
      category: product.category,
      stock: product.stock?.toString() || '100',
      image: product.image || '',
      is_featured: product.is_featured === 1,
      sizes: product.sizes ? product.sizes.split(',') : [],
      colors: product.colors ? product.colors.split(',') : [],
    });
    setImageError(false);
    setLocalImageUri(null);
    setModalVisible(true);
  };

  const toggleSize = (size) => {
    const newSizes = form.sizes.includes(size)
      ? form.sizes.filter(s => s !== size)
      : [...form.sizes, size];
    setForm({ ...form, sizes: newSizes });
  };

  const toggleColor = (colorName) => {
    const newColors = form.colors.includes(colorName)
      ? form.colors.filter(c => c !== colorName)
      : [...form.colors, colorName];
    setForm({ ...form, colors: newColors });
  };

  const handleSave = async () => {
    if (!form.name || !form.price || !form.category) {
      Alert.alert('Erreur', 'Nom, prix et catégorie sont requis');
      return;
    }

    if (parseInt(form.stock) < 0) {
      Alert.alert('Erreur', 'Le stock ne peut pas être négatif');
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
            'products'
          );
          if (uploadResult.success && uploadResult.data) {
            finalImageUrl = uploadAPI.getImageUrl(uploadResult.data.url);
          }
        } catch (uploadError) {
          console.error('Erreur upload:', uploadError);
          Alert.alert('Attention', 'Image non uploadée, mais le produit sera créé sans image');
        } finally {
          setUploading(false);
        }
      }
      
      const productData = {
        name: form.name,
        description: form.description,
        price: parseFloat(form.price),
        category: form.category,
        stock: parseInt(form.stock),
        image: finalImageUrl,
        is_featured: form.is_featured ? 1 : 0,
        sizes: form.sizes.join(','),
        colors: form.colors.join(','),
      };

      let response;
      if (editingProduct) {
        response = await api.put(`/products/${editingProduct.id}`, productData);
      } else {
        response = await api.post('/products', productData);
      }

      if (response.success) {
        Alert.alert('Succès', editingProduct ? 'Produit modifié!' : 'Produit ajouté!');
        setModalVisible(false);
        resetForm();
        loadProducts();
      } else {
        Alert.alert('Erreur', response.message);
      }
    } catch (error) {
      Alert.alert('Erreur', error.message || 'Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (product) => {
    Alert.alert(
      'Supprimer',
      `Voulez-vous supprimer "${product.name}"?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await api.delete(`/products/${product.id}`);
              if (response.success) {
                Alert.alert('Succès', 'Produit supprimé');
                loadProducts();
              }
            } catch (error) {
              Alert.alert('Erreur', error.message);
            }
          },
        },
      ]
    );
  };

  const getCategoryLabel = (key) => {
    const cat = CATEGORIES.find(c => c.key === key);
    return cat?.label || key;
  };

  const getStockStatus = (stock) => {
    if (stock === 0) return { text: 'Épuisé', color: COLORS.error };
    if (stock <= 10) return { text: 'Stock bas', color: COLORS.warning };
    return { text: `Stock: ${stock}`, color: COLORS.success };
  };

  const filteredProducts = filterCategory === 'all'
    ? products
    : products.filter(p => p.category === filterCategory);

  const renderProduct = ({ item }) => {
    const stockStatus = getStockStatus(item.stock);
    return (
      <View style={styles.productCard}>
        <View style={styles.productImage}>
          {item.image ? (
            <Image source={{ uri: item.image }} style={styles.image} />
          ) : (
            <Text style={styles.imagePlaceholder}>📦</Text>
          )}
          {item.is_featured === 1 && (
            <View style={styles.featuredBadge}>
              <Text style={styles.featuredBadgeText}>⭐</Text>
            </View>
          )}
        </View>
        <View style={styles.productInfo}>
          <Text style={styles.productName} numberOfLines={1}>{item.name}</Text>
          <Text style={styles.productCategory}>{getCategoryLabel(item.category)}</Text>
          <View style={styles.priceStock}>
            <Text style={styles.productPrice}>{item.price} DH</Text>
            <Text style={[styles.stockBadge, { backgroundColor: stockStatus.color + '20', color: stockStatus.color }]}>
              {stockStatus.text}
            </Text>
          </View>
          {item.sizes && (
            <Text style={styles.sizesText}>Tailles: {item.sizes}</Text>
          )}
        </View>
        <View style={styles.productActions}>
          <TouchableOpacity style={styles.editBtn} onPress={() => openEditModal(item)}>
            <Text style={styles.actionIcon}>✏️</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDelete(item)}>
            <Text style={styles.actionIcon}>🗑️</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>🛍️ Gestion Produits</Text>
        <TouchableOpacity onPress={openAddModal}>
          <Text style={styles.addButton}>+ Ajouter</Text>
        </TouchableOpacity>
      </View>

      {/* Filters */}
      <View style={styles.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <TouchableOpacity
            style={[styles.filterBtn, filterCategory === 'all' && styles.filterBtnActive]}
            onPress={() => setFilterCategory('all')}
          >
            <Text style={[styles.filterText, filterCategory === 'all' && styles.filterTextActive]}>
              📦 Tous ({products.length})
            </Text>
          </TouchableOpacity>
          {CATEGORIES.map(cat => {
            const count = products.filter(p => p.category === cat.key).length;
            return (
              <TouchableOpacity
                key={cat.key}
                style={[styles.filterBtn, filterCategory === cat.key && styles.filterBtnActive]}
                onPress={() => setFilterCategory(cat.key)}
              >
                <Text style={[styles.filterText, filterCategory === cat.key && styles.filterTextActive]}>
                  {cat.label} ({count})
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <FlatList
        data={filteredProducts}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderProduct}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />
        }
        ListEmptyComponent={
          isLoading ? (
            <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 50 }} />
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>📦</Text>
              <Text style={styles.emptyText}>Aucun produit dans cette catégorie</Text>
            </View>
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
                {editingProduct ? '✏️ Modifier produit' : '➕ Ajouter produit'}
              </Text>

              {/* Image Preview */}
              <View style={styles.imagePreviewSection}>
                <TouchableOpacity 
                  style={styles.imagePreview}
                  onPress={async () => {
                    const selectedImage = await showImagePickerOptions({ aspect: [4, 3], quality: 0.8 });
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
                      <Text style={styles.noImageIcon}>📷</Text>
                      <Text style={styles.noImageText}>Touchez pour ajouter</Text>
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
                      const selectedImage = await pickImageFromGallery({ aspect: [4, 3], quality: 0.8 });
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
                      const selectedImage = await takePhoto({ aspect: [4, 3], quality: 0.8 });
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
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Ou URL Image externe</Text>
                <TextInput
                  style={styles.input}
                  placeholder="https://exemple.com/image.jpg"
                  placeholderTextColor={COLORS.textLight}
                  value={form.image}
                  onChangeText={(text) => {
                    setForm({ ...form, image: text });
                    setLocalImageUri(null);
                    setImageError(false);
                  }}
                />
                <Text style={styles.inputHint}>💡 Ou collez un lien externe (PNG, JPG)</Text>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Nom du produit *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Maillot WAC 2024/25"
                  placeholderTextColor={COLORS.textLight}
                  value={form.name}
                  onChangeText={(text) => setForm({ ...form, name: text })}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Description</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Description du produit..."
                  placeholderTextColor={COLORS.textLight}
                  value={form.description}
                  onChangeText={(text) => setForm({ ...form, description: text })}
                  multiline
                  numberOfLines={3}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Catégorie *</Text>
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

              <View style={styles.rowInputs}>
                <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
                  <Text style={styles.inputLabel}>Prix (DH) *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="299"
                    placeholderTextColor={COLORS.textLight}
                    value={form.price}
                    onChangeText={(text) => setForm({ ...form, price: text })}
                    keyboardType="numeric"
                  />
                </View>
                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={styles.inputLabel}>Stock *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="100"
                    placeholderTextColor={COLORS.textLight}
                    value={form.stock}
                    onChangeText={(text) => setForm({ ...form, stock: text })}
                    keyboardType="numeric"
                  />
                </View>
              </View>

              {/* Tailles */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Tailles disponibles</Text>
                <View style={styles.sizesRow}>
                  {SIZE_OPTIONS.map(size => (
                    <TouchableOpacity
                      key={size}
                      style={[styles.sizeBtn, form.sizes.includes(size) && styles.sizeBtnActive]}
                      onPress={() => toggleSize(size)}
                    >
                      <Text style={[styles.sizeText, form.sizes.includes(size) && styles.sizeTextActive]}>
                        {size}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Couleurs */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Couleurs disponibles</Text>
                <View style={styles.colorsRow}>
                  {COLOR_OPTIONS.map(colorOpt => (
                    <TouchableOpacity
                      key={colorOpt.name}
                      style={[
                        styles.colorBtn,
                        { backgroundColor: colorOpt.color },
                        form.colors.includes(colorOpt.name) && styles.colorBtnActive,
                      ]}
                      onPress={() => toggleColor(colorOpt.name)}
                    >
                      {form.colors.includes(colorOpt.name) && (
                        <Text style={[styles.colorCheck, colorOpt.color === '#FFFFFF' && { color: '#000' }]}>✓</Text>
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
                {form.colors.length > 0 && (
                  <Text style={styles.selectedColors}>
                    Sélectionné: {form.colors.join(', ')}
                  </Text>
                )}
              </View>

              <TouchableOpacity
                style={styles.featuredToggle}
                onPress={() => setForm({ ...form, is_featured: !form.is_featured })}
              >
                <View style={[styles.checkbox, form.is_featured && styles.checkboxActive]}>
                  {form.is_featured && <Text style={styles.checkmark}>✓</Text>}
                </View>
                <Text style={styles.featuredLabel}>⭐ Produit vedette (affiché en accueil)</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
                onPress={handleSave}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator color={COLORS.textWhite} />
                ) : (
                  <Text style={styles.saveBtnText}>
                    {editingProduct ? 'Enregistrer' : 'Ajouter'}
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
  filterContainer: {
    backgroundColor: COLORS.card,
    paddingVertical: 10,
    paddingHorizontal: 5,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  filterBtn: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.background,
    marginHorizontal: 5,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  filterBtnActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filterText: {
    fontSize: 12,
    color: COLORS.text,
  },
  filterTextActive: {
    color: COLORS.textWhite,
    fontWeight: 'bold',
  },
  list: {
    padding: SIZES.screenPadding,
  },
  productCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: SIZES.radiusMd,
    padding: 12,
    marginBottom: 10,
    ...SHADOWS.small,
  },
  productImage: {
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
  featuredBadge: {
    position: 'absolute',
    top: 2,
    right: 2,
    backgroundColor: COLORS.warning,
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  featuredBadgeText: {
    fontSize: 10,
  },
  productInfo: {
    flex: 1,
    marginLeft: 12,
  },
  productName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  productCategory: {
    fontSize: 11,
    color: COLORS.primary,
    marginTop: 2,
  },
  priceStock: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  productPrice: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.success,
  },
  stockBadge: {
    fontSize: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    fontWeight: '600',
  },
  sizesText: {
    fontSize: 10,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  productActions: {
    flexDirection: 'row',
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
  emptyContainer: {
    alignItems: 'center',
    marginTop: 50,
  },
  emptyIcon: {
    fontSize: 60,
    marginBottom: 10,
  },
  emptyText: {
    textAlign: 'center',
    color: COLORS.textSecondary,
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
    maxHeight: '95%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 20,
  },
  imagePreviewSection: {
    alignItems: 'center',
    marginBottom: 15,
  },
  imagePreview: {
    width: 150,
    height: 150,
    borderRadius: SIZES.radiusMd,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: COLORS.border,
    borderStyle: 'dashed',
  },
  previewImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  noImagePreview: {
    alignItems: 'center',
  },
  noImageIcon: {
    fontSize: 40,
    marginBottom: 5,
  },
  noImageText: {
    fontSize: 12,
    color: COLORS.textSecondary,
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
  inputHint: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 5,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  rowInputs: {
    flexDirection: 'row',
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
  sizesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  sizeBtn: {
    width: 45,
    height: 40,
    borderRadius: 8,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sizeBtnActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  sizeText: {
    fontSize: 13,
    color: COLORS.text,
    fontWeight: '500',
  },
  sizeTextActive: {
    color: COLORS.textWhite,
    fontWeight: 'bold',
  },
  colorsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  colorBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.border,
  },
  colorBtnActive: {
    borderWidth: 3,
    borderColor: COLORS.primary,
  },
  colorCheck: {
    fontSize: 18,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  selectedColors: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 8,
  },
  featuredToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  checkboxActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  checkmark: {
    color: COLORS.textWhite,
    fontWeight: 'bold',
  },
  featuredLabel: {
    fontSize: 14,
    color: COLORS.text,
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
  // Styles pour les boutons d'image
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

export default AdminProductsScreen;
