// ===========================================
// WYDAD AC - COMPLAINTS SCREEN
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
import { complaintsAPI } from '../services/api';
import { COLORS, SIZES, SHADOWS } from '../theme/colors';

const ComplaintsScreen = ({ navigation }) => {
    const [complaints, setComplaints] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form State
    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');

    useFocusEffect(
        useCallback(() => {
            loadComplaints();
        }, [])
    );

    const loadComplaints = async () => {
        setIsLoading(true);
        try {
            const response = await complaintsAPI.getMy();
            if (response.success) {
                setComplaints(response.data);
            }
        } catch (error) {
            console.error('Erreur chargement réclamations:', error);
            Alert.alert('Erreur', 'Impossible de charger vos réclamations');
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreate = async () => {
        if (!subject.trim() || !message.trim()) {
            Alert.alert('Erreur', 'Veuillez remplir tous les champs');
            return;
        }

        setIsSubmitting(true);
        try {
            const response = await complaintsAPI.create({ subject, message });
            if (response.success) {
                Alert.alert('Succès', 'Votre réclamation a été envoyée. Nous vous répondrons bientôt.');
                setShowCreateModal(false);
                setSubject('');
                setMessage('');
                loadComplaints();
            } else {
                Alert.alert('Erreur', response.message || 'Erreur lors de l\'envoi');
            }
        } catch (error) {
            console.error('Erreur création réclamation:', error);
            Alert.alert('Erreur', 'Impossible d\'envoyer la réclamation');
        } finally {
            setIsSubmitting(false);
        }
    };

    const getStatusBadge = (status) => {
        if (status === 'replied') {
            return (
                <View style={[styles.statusBadge, { backgroundColor: COLORS.success }]}>
                    <Text style={styles.statusText}>Répondu</Text>
                </View>
            );
        }
        return (
            <View style={[styles.statusBadge, { backgroundColor: COLORS.warning }]}>
                <Text style={styles.statusText}>En attente</Text>
            </View>
        );
    };

    const renderComplaint = ({ item }) => (
        <View style={styles.card}>
            <View style={styles.cardHeader}>
                <Text style={styles.cardDate}>
                    📅 {new Date(item.created_at).toLocaleDateString('fr-FR')}
                </Text>
                {getStatusBadge(item.status)}
            </View>

            <Text style={styles.cardSubject}>{item.subject}</Text>
            <Text style={styles.cardMessage}>{item.message}</Text>

            {item.admin_response && (
                <View style={styles.responseContainer}>
                    <Text style={styles.responseLabel}>Réponse du Support:</Text>
                    <Text style={styles.responseText}>{item.admin_response}</Text>
                    <Text style={styles.responseDate}>
                        🕒 {new Date(item.updated_at).toLocaleDateString('fr-FR')}
                    </Text>
                </View>
            )}
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Text style={styles.backButton}>←</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Mes Réclamations</Text>
                <View style={{ width: 30 }} />
            </View>

            <FlatList
                data={complaints}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderComplaint}
                contentContainerStyle={styles.list}
                ListEmptyComponent={
                    !isLoading && (
                        <View style={styles.emptyContainer}>
                            <Text style={styles.emptyEmoji}>📬</Text>
                            <Text style={styles.emptyText}>Aucune réclamation</Text>
                            <Text style={styles.emptySubtext}>
                                Si vous avez un problème, créez une nouvelle réclamation.
                            </Text>
                        </View>
                    )
                }
                refreshing={isLoading}
                onRefresh={loadComplaints}
            />

            {/* FAB Create Button */}
            <TouchableOpacity
                style={styles.fab}
                onPress={() => setShowCreateModal(true)}
            >
                <Text style={styles.fabText}>+</Text>
            </TouchableOpacity>

            {/* Initialize Create Modal */}
            <Modal
                visible={showCreateModal}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setShowCreateModal(false)}
            >
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={styles.modalOverlay}
                >
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Nouvelle Réclamation</Text>
                            <TouchableOpacity onPress={() => setShowCreateModal(false)}>
                                <Text style={styles.closeButton}>✕</Text>
                            </TouchableOpacity>
                        </View>

                        <Text style={styles.label}>Sujet</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Ex: Problème ticket, Boutique..."
                            placeholderTextColor={COLORS.textLight}
                            value={subject}
                            onChangeText={setSubject}
                        />

                        <Text style={styles.label}>Message</Text>
                        <TextInput
                            style={[styles.input, styles.textArea]}
                            placeholder="Décrivez votre problème en détail..."
                            placeholderTextColor={COLORS.textLight}
                            value={message}
                            onChangeText={setMessage}
                            multiline
                            textAlignVertical="top"
                            numberOfLines={5}
                        />

                        <TouchableOpacity
                            style={[styles.submitBtn, isSubmitting && styles.submitBtnDisabled]}
                            onPress={handleCreate}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <ActivityIndicator color={COLORS.textWhite} />
                            ) : (
                                <Text style={styles.submitBtnText}>Envoyer la réclamation</Text>
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
    list: {
        padding: SIZES.screenPadding,
        paddingBottom: 100,
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
        marginBottom: 10,
    },
    cardDate: {
        fontSize: 12,
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
    cardSubject: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.text,
        marginBottom: 5,
    },
    cardMessage: {
        fontSize: 14,
        color: COLORS.text,
        lineHeight: 20,
    },
    responseContainer: {
        marginTop: 15,
        padding: 10,
        backgroundColor: COLORS.background,
        borderRadius: SIZES.radiusSm,
        borderLeftWidth: 3,
        borderLeftColor: COLORS.primary,
    },
    responseLabel: {
        fontSize: 12,
        fontWeight: 'bold',
        color: COLORS.primary,
        marginBottom: 5,
    },
    responseText: {
        fontSize: 14,
        color: COLORS.text,
        fontStyle: 'italic',
    },
    responseDate: {
        fontSize: 10,
        color: COLORS.textLight,
        marginTop: 5,
        textAlign: 'right',
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 100,
    },
    emptyEmoji: {
        fontSize: 60,
        marginBottom: 20,
    },
    emptyText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.text,
        marginBottom: 10,
    },
    emptySubtext: {
        fontSize: 14,
        color: COLORS.textSecondary,
        textAlign: 'center',
        paddingHorizontal: 40,
    },
    fab: {
        position: 'absolute',
        bottom: 30,
        right: 30,
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: COLORS.primary,
        justifyContent: 'center',
        alignItems: 'center',
        ...SHADOWS.medium,
    },
    fabText: {
        fontSize: 30,
        color: COLORS.textWhite,
        marginTop: -2,
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
        minHeight: '60%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: COLORS.text,
    },
    closeButton: {
        fontSize: 24,
        color: COLORS.textSecondary,
        padding: 5,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.text,
        marginBottom: 5,
        marginTop: 10,
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
        height: 120,
    },
    submitBtn: {
        backgroundColor: COLORS.primary,
        paddingVertical: 15,
        borderRadius: SIZES.radiusMd,
        alignItems: 'center',
        marginTop: 30,
    },
    submitBtnDisabled: {
        opacity: 0.7,
    },
    submitBtnText: {
        color: COLORS.textWhite,
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default ComplaintsScreen;
