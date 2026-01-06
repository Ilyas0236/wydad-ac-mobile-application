// ===========================================
// WYDAD AC - NEWS DETAIL SCREEN
// ===========================================

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Share,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { newsAPI } from '../services/api';
import { COLORS, SIZES, SHADOWS } from '../theme/colors';

const NewsDetailScreen = ({ route, navigation }) => {
  const { newsId } = route.params;
  const [article, setArticle] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadArticle();
  }, []);

  const loadArticle = async () => {
    try {
      const response = await newsAPI.getOne(newsId);
      if (response.success) {
        setArticle(response.data);
      }
    } catch (error) {
      console.error('Erreur chargement article:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `${article.title}\n\nWydad Athletic Club`,
        title: article.title,
      });
    } catch (error) {
      console.error('Erreur partage:', error);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (!article) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Article non trouvé</Text>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backBtnText}>Retour</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Actualité</Text>
        <TouchableOpacity onPress={handleShare}>
          <Text style={styles.shareBtn}>📤</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Article Image Placeholder */}
        <View style={styles.imageSection}>
          <Text style={styles.imageEmoji}>📰</Text>
          
          {/* Category Badge */}
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{article.category || 'Actualité'}</Text>
          </View>
        </View>

        {/* Article Content */}
        <View style={styles.contentSection}>
          {/* Date */}
          <Text style={styles.dateText}>
            📅 {formatDate(article.created_at)}
          </Text>

          {/* Title */}
          <Text style={styles.articleTitle}>{article.title}</Text>

          {/* Summary */}
          {article.summary && (
            <Text style={styles.summaryText}>{article.summary}</Text>
          )}

          {/* Content */}
          <View style={styles.contentCard}>
            <Text style={styles.contentText}>{article.content}</Text>
          </View>

          {/* Tags */}
          {article.tags && (
            <View style={styles.tagsContainer}>
              {article.tags.split(',').map((tag, index) => (
                <View key={index} style={styles.tag}>
                  <Text style={styles.tagText}>#{tag.trim()}</Text>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Related Actions */}
        <View style={styles.actionsSection}>
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => navigation.navigate('Home')}
          >
            <Text style={styles.actionIcon}>📰</Text>
            <Text style={styles.actionText}>Plus d'actualités</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionBtn, styles.actionBtnPrimary]}
            onPress={handleShare}
          >
            <Text style={styles.actionIcon}>📤</Text>
            <Text style={[styles.actionText, styles.actionTextWhite]}>Partager</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 30 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  errorText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginBottom: 20,
  },
  backBtn: {
    backgroundColor: COLORS.primary,
    padding: 15,
    borderRadius: SIZES.radiusMd,
  },
  backBtnText: {
    color: COLORS.textWhite,
    fontWeight: 'bold',
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
    fontSize: 18,
    fontWeight: 'bold',
  },
  shareBtn: {
    fontSize: 20,
  },
  imageSection: {
    height: 200,
    backgroundColor: COLORS.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  imageEmoji: {
    fontSize: 80,
  },
  categoryBadge: {
    position: 'absolute',
    bottom: 15,
    left: 15,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 15,
  },
  categoryText: {
    color: COLORS.textWhite,
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'capitalize',
  },
  contentSection: {
    padding: SIZES.screenPadding,
  },
  dateText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginBottom: 15,
  },
  articleTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 15,
    lineHeight: 32,
  },
  summaryText: {
    fontSize: 16,
    color: COLORS.text,
    fontWeight: '500',
    lineHeight: 24,
    marginBottom: 20,
    fontStyle: 'italic',
  },
  contentCard: {
    backgroundColor: COLORS.card,
    borderRadius: SIZES.radiusMd,
    padding: 20,
    ...SHADOWS.small,
  },
  contentText: {
    fontSize: 15,
    color: COLORS.text,
    lineHeight: 26,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 20,
  },
  tag: {
    backgroundColor: COLORS.primary + '15',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '600',
  },
  actionsSection: {
    flexDirection: 'row',
    padding: SIZES.screenPadding,
    gap: 15,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: SIZES.radiusMd,
    backgroundColor: COLORS.card,
    ...SHADOWS.small,
  },
  actionBtnPrimary: {
    backgroundColor: COLORS.primary,
  },
  actionIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  actionText: {
    fontSize: 14,
    color: COLORS.text,
    fontWeight: '600',
  },
  actionTextWhite: {
    color: COLORS.textWhite,
  },
});

export default NewsDetailScreen;
