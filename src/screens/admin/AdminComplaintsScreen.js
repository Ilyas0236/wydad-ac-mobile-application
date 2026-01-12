// ===========================================
// WYDAD AC - ADMIN COMPLAINTS SCREEN
// ===========================================

import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    FlatList,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    Modal,
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { complaintsAPI } from '../../services/api';
import { COLORS, SIZES, SHADOWS } from '../../theme/colors';

const AdminComplaintsScreen = ({ navigation }) => {
    const [complaints, setComplaints] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // Reply Modal
    const [showReplyModal, setShowReplyModal] = useState(false);
    const [selectedComplaint, setSelectedComplaint] = useState(null);
    const [replyText, setReplyText] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Stats
    const [stats, setStats] = useState({ pending: 0, total: 0 });

    useFocusEffect(
        useCallback(() => {
            loadComplaints();
        }, [])
    );

    const loadComplaints = async () => {
        setIsLoading(true);
        try {
            const response = await complaintsAPI.getAllAdmin();
            if (response.success) {
                setComplaints(response.data);
                const pending = response.data.filter(c => c.status === 'pending').length;
                setStats({ pending, total: response.data.length });
            }
        } catch (error) {
            console.error('Erreur chargement réclamations admin:', error);
            Alert.alert('Erreur', 'Impossible de charger les réclamations');
        } finally {
            setIsLoading(false);
            setRefreshing(false);
        }
    };

    const openReplyModal = (complaint) => {
        setSelectedComplaint(complaint);
        setReplyText(complaint.admin_response || '');
        setShowReplyModal(true);
    };

    const handleReply = async () => {
        if (!replyText.trim()) {
            Alert.alert('Erreur', 'Veuillez rédiger une réponse');
            return;
        }

        setIsSubmitting(true);
        try {
            const response = await complaintsAPI.reply(selectedComplaint.id, replyText);
            if (response.success) {
                Alert.alert('Succès', 'Réponse envoyée');
                setShowReplyModal(false);
                loadComplaints();
            } else {
                Alert.alert('Erreur', response.message || 'Erreur lors de l\'envoi');
            }
        } catch (error) {
            console.error('Erreur réponse:', error);
            Alert.alert('Erreur', 'Impossible d\'envoyer la réponse');
        } finally {
            setIsSubmitting(false);
        }
    };

    const renderComplaint = ({ item }) => (
        <TouchableOpacity
            style={styles.card}
            onPress={() => openReplyModal(item)}
        >
            <View style={styles.cardHeader}>
                <View style={styles.userInfo}>
                    <Text style={styles.userAvatar}>{item.user_name?.charAt(0) || 'U'}</Text>
                    <View>
                        <Text style={styles.userName}>{item.user_name}</Text>
                        <Text style={styles.userEmail}>{item.user_email}</Text>
                    </View>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: item.status === 'pending' ? COLORS.warning : COLORS.success }]}>
                    <Text style={styles.statusText}>{item.status === 'pending' ? 'En attente' : 'Répondu'}</Text>
                </View>
            </View>

            <View style={styles.divider} />

            <Text style={styles.cardSubject}>{item.subject}</Text>
            <Text style={styles.cardMessage} numberOfLines={2}>{item.message}</Text>

            <View style={styles.cardFooter}>
                <Text style={styles.cardDate}>
                    📅 {new Date(item.created_at).toLocaleDateString('fr-FR')} {new Date(item.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                </Text>
                <Text style={styles.tapToReply}>
                    {item.status === 'pending' ? 'Toucher pour répondre →' : 'Voir la réponse →'}
                </Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Gestion Réclamations</Text>
                <View style={styles.headerBadge}>
                    <Text style={styles.headerBadgeText}>{stats.pending}</Text>
                </View>
            </View>

            <FlatList
                data={complaints}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderComplaint}
                contentContainerStyle={styles.list}
                refreshing={refreshing}
                onRefresh={() => {
                    setRefreshing(true);
                    loadComplaints();
                }}
                ListEmptyComponent={
                    !isLoading && (
                        <View style={styles.emptyContainer}>
                            <Text style={styles.emptyText}>Aucune réclamation</Text>
                        </View>
                    )
                }
            />

            {/* Reply Modal */}
            <Modal
                visible={showReplyModal}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setShowReplyModal(false)}
            >
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={styles.modalOverlay}
                >
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Répondre à {selectedComplaint?.user_name}</Text>
                            <TouchableOpacity onPress={() => setShowReplyModal(false)}>
                                <Text style={styles.closeButton}>✕</Text>
                            </TouchableOpacity>
                        </View>

                        <View style={styles.originalMessage}>
                            <Text style={styles.originalSubject}>{selectedComplaint?.subject}</Text>
                            <Text style={styles.originalText}>{selectedComplaint?.message}</Text>
                        </View>

                        <Text style={styles.label}>Votre réponse</Text>
                        <TextInput
                            style={[styles.input, styles.textArea]}
                            placeholder="Écrivez votre réponse ici..."
                            placeholderTextColor={COLORS.textLight}
                            value={replyText}
                            onChangeText={setReplyText}
                            multiline
                            textAlignVertical="top"
                            numberOfLines={6}
                        />

                        <TouchableOpacity
                            style={[styles.submitBtn, isSubmitting && styles.submitBtnDisabled]}
                            onPress={handleReply}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <ActivityIndicator color={COLORS.textWhite} />
                            ) : (
                                <Text style={styles.submitBtnText}>Envoyer la réponse</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </KeyboardAvoidingView>
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
        alignItems: 'center',
        padding: SIZES.screenPadding,
        backgroundColor: COLORS.primary,
    },
    headerTitle: {
        color: COLORS.textWhite,
        fontSize: 18,
        fontWeight: 'bold',
        marginRight: 10,
    },
    headerBadge: {
        backgroundColor: COLORS.warning,
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 10,
    },
    headerBadgeText: {
        color: COLORS.textWhite,
        fontSize: 12,
        fontWeight: 'bold',
    },
    list: {
        padding: SIZES.screenPadding,
    },
    card: {
        backgroundColor: COLORS.card,
        borderRadius: SIZES.radiusMd,
        padding: 15,
        marginBottom: 15,
        ...SHADOWS.small,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    userInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    userAvatar: {
        width: 30,
        height: 30,
        borderRadius: 15,
        backgroundColor: COLORS.primary,
        color: COLORS.textWhite,
        textAlign: 'center',
        lineHeight: 30,
        fontWeight: 'bold',
        marginRight: 10,
    },
    userName: {
        fontSize: 14,
        fontWeight: 'bold',
        color: COLORS.text,
    },
    userEmail: {
        fontSize: 10,
        color: COLORS.textSecondary,
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    statusText: {
        color: COLORS.textWhite,
        fontSize: 10,
        fontWeight: 'bold',
    },
    divider: {
        height: 1,
        backgroundColor: COLORS.border,
        marginVertical: 10,
    },
    cardSubject: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.text,
        marginBottom: 5,
    },
    cardMessage: {
        fontSize: 14,
        color: COLORS.textSecondary,
        marginBottom: 10,
    },
    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    cardDate: {
        fontSize: 10,
        color: COLORS.textLight,
    },
    tapToReply: {
        fontSize: 12,
        color: COLORS.primary,
        fontWeight: '600',
    },
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
        minHeight: '70%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.text,
    },
    closeButton: {
        fontSize: 24,
        color: COLORS.textSecondary,
        padding: 5,
    },
    originalMessage: {
        backgroundColor: COLORS.background,
        padding: 15,
        borderRadius: SIZES.radiusSm,
        marginBottom: 20,
    },
    originalSubject: {
        fontWeight: 'bold',
        color: COLORS.text,
        marginBottom: 5,
    },
    originalText: {
        color: COLORS.text,
        fontStyle: 'italic',
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.text,
        marginBottom: 10,
    },
    input: {
        backgroundColor: COLORS.background,
        borderRadius: SIZES.radiusSm,
        padding: 12,
        color: COLORS.text,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    textArea: {
        height: 150,
    },
    submitBtn: {
        backgroundColor: COLORS.primary,
        paddingVertical: 15,
        borderRadius: SIZES.radiusMd,
        alignItems: 'center',
        marginTop: 20,
    },
    submitBtnDisabled: {
        opacity: 0.7,
    },
    submitBtnText: {
        color: COLORS.textWhite,
        fontSize: 16,
        fontWeight: 'bold',
    },
    emptyContainer: {
        padding: 40,
        alignItems: 'center',
    },
    emptyText: {
        color: COLORS.textSecondary,
    },
});

export default AdminComplaintsScreen;
