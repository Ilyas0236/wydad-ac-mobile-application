// ===========================================
// WYDAD AC - ADMIN TICKET CONFIGURATION
// Gestion de la billetterie par match
// ===========================================

import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    RefreshControl,
    ActivityIndicator,
    Modal,
    TextInput,
    Alert,
    ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { adminAPI, matchesAPI } from '../../services/api';
import { COLORS, SIZES, SHADOWS } from '../../theme/colors';

// Sections du stade
const STADIUM_SECTIONS_REF = [
    { key: 'virage_nord', label: 'Virage Nord' },
    { key: 'virage_sud', label: 'Virage Sud' },
    { key: 'pelouse', label: 'Pelouse' },
    { key: 'tribune', label: 'Tribune Latérale' },
    { key: 'tribune_honneur', label: "Tribune d'Honneur" },
];

const AdminTicketsScreen = ({ navigation }) => {
    const [matches, setMatches] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // Modal Config
    const [showConfigModal, setShowConfigModal] = useState(false);
    const [selectedMatch, setSelectedMatch] = useState(null);
    const [sectionsConfig, setSectionsConfig] = useState([]);
    const [loadingConfig, setLoadingConfig] = useState(false);
    const [saving, setSaving] = useState(false);

    // Initial load
    useEffect(() => {
        loadMatches();
    }, []);

    const loadMatches = async () => {
        try {
            const response = await matchesAPI.getUpcoming();
            if (response.success) {
                setMatches(response.data);
            }
        } catch (error) {
            console.error('Erreur chargement matchs:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await loadMatches();
        setRefreshing(false);
    };

    // Ouvrir la configuration pour un match
    const openMatchConfig = async (match) => {
        setSelectedMatch(match);
        setShowConfigModal(true);
        setLoadingConfig(true);

        try {
            const response = await adminAPI.getMatchSections(match.id);
            if (response.success) {
                // Ensure all sections are present
                const loadedSections = response.data;
                const fullConfig = STADIUM_SECTIONS_REF.map(ref => {
                    const existing = loadedSections.find(s => s.category_key === ref.key);
                    return existing ? { ...existing, label: ref.label } : {
                        category_key: ref.key,
                        label: ref.label,
                        price: 0,
                        capacity: 1000
                    };
                });
                setSectionsConfig(fullConfig);
            }
        } catch (error) {
            Alert.alert('Erreur', 'Impossible de charger la configuration');
            setShowConfigModal(false);
        } finally {
            setLoadingConfig(false);
        }
    };

    // Sauvegarder la configuration
    const handleSaveConfig = async () => {
        setSaving(true);
        try {
            // Validation simple
            const valid = sectionsConfig.every(s => s.price >= 0 && s.capacity >= 0);
            if (!valid) {
                Alert.alert('Erreur', 'Prix et quantités doivent être positifs');
                setSaving(false);
                return;
            }

            const response = await adminAPI.saveMatchSections(selectedMatch.id, sectionsConfig);
            if (response.success) {
                Alert.alert('Succès', 'Billetterie configurée avec succès !');
                setShowConfigModal(false);
                loadMatches(); // Refresh to update "available_seats" maybe
            }
        } catch (error) {
            Alert.alert('Erreur', error.message || 'Erreur lors de la sauvegarde');
        } finally {
            setSaving(false);
        }
    };

    const updateSection = (key, field, value) => {
        setSectionsConfig(prev => prev.map(s => {
            if (s.category_key === key) {
                return { ...s, [field]: value };
            }
            return s;
        }));
    };

    const renderMatchItem = ({ item }) => (
        <View style={styles.matchCard}>
            <View style={styles.matchHeader}>
                <Text style={styles.matchCompetition}>{item.competition}</Text>
                <View style={styles.statusBadge}>
                    <Text style={styles.statusText}>
                        {item.available_seats} places dispo
                    </Text>
                </View>
            </View>

            <View style={styles.teamsContainer}>
                <Text style={styles.teamName}>WAC</Text>
                <Text style={styles.vsText}>VS</Text>
                <Text style={styles.teamName}>{item.opponent}</Text>
            </View>

            <View style={styles.matchInfo}>
                <Text style={styles.infoText}>📅 {new Date(item.match_date).toLocaleDateString()}</Text>
                <Text style={styles.infoText}>📍 {item.venue}</Text>
            </View>

            <TouchableOpacity
                style={styles.configButton}
                onPress={() => openMatchConfig(item)}
            >
                <Text style={styles.configButtonText}>⚙️ Configurer la Billetterie</Text>
            </TouchableOpacity>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <LinearGradient
                colors={[COLORS.gradientStart, COLORS.gradientEnd]}
                style={styles.header}
            >
                <Text style={styles.headerTitle}>🎟️ Gestion Billetterie</Text>
                <Text style={styles.headerSubtitle}>Configurez les prix par match</Text>
            </LinearGradient>

            <FlatList
                data={matches}
                keyExtractor={item => item.id.toString()}
                renderItem={renderMatchItem}
                contentContainerStyle={styles.list}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />
                }
                ListEmptyComponent={
                    <View style={styles.emptyState}>
                        <Text style={styles.emptyText}>Aucun match programmé</Text>
                    </View>
                }
            />

            {/* Modal de Configuration */}
            <Modal
                visible={showConfigModal}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setShowConfigModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Configuration Billetterie</Text>
                            <TouchableOpacity onPress={() => setShowConfigModal(false)}>
                                <Text style={styles.closeBtn}>✕</Text>
                            </TouchableOpacity>
                        </View>

                        {selectedMatch && (
                            <Text style={styles.matchTitle}>
                                WAC vs {selectedMatch.opponent}
                            </Text>
                        )}

                        {loadingConfig ? (
                            <ActivityIndicator size="large" color={COLORS.primary} style={{ margin: 20 }} />
                        ) : (
                            <ScrollView style={styles.configList}>
                                {sectionsConfig.map((section) => (
                                    <View key={section.category_key} style={styles.sectionRow}>
                                        <Text style={styles.sectionLabel}>{section.label}</Text>

                                        <View style={styles.inputsRow}>
                                            <View style={styles.inputGroup}>
                                                <Text style={styles.inputLegend}>Prix (MAD)</Text>
                                                <TextInput
                                                    style={styles.input}
                                                    value={section.price?.toString()}
                                                    onChangeText={v => updateSection(section.category_key, 'price', v)}
                                                    keyboardType="numeric"
                                                />
                                            </View>

                                            <View style={styles.inputGroup}>
                                                <Text style={styles.inputLegend}>Places</Text>
                                                <TextInput
                                                    style={styles.input}
                                                    value={section.capacity?.toString()}
                                                    onChangeText={v => updateSection(section.category_key, 'capacity', v)}
                                                    keyboardType="numeric"
                                                />
                                            </View>
                                        </View>
                                    </View>
                                ))}
                            </ScrollView>
                        )}

                        <View style={styles.modalFooter}>
                            <TouchableOpacity
                                style={[styles.saveBtn, saving && styles.btnDisabled]}
                                onPress={handleSaveConfig}
                                disabled={saving}
                            >
                                {saving ? (
                                    <ActivityIndicator color={COLORS.textWhite} />
                                ) : (
                                    <Text style={styles.saveBtnText}>💾 Sauvegarder Configuration</Text>
                                )}
                            </TouchableOpacity>
                        </View>
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
        padding: SIZES.screenPadding,
        paddingTop: 10,
        paddingBottom: 20,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: COLORS.textWhite,
    },
    headerSubtitle: {
        fontSize: 14,
        color: COLORS.textWhite,
        opacity: 0.8,
        marginTop: 4,
    },
    list: {
        padding: SIZES.screenPadding,
    },
    matchCard: {
        backgroundColor: COLORS.card,
        borderRadius: SIZES.radiusMd,
        padding: 16,
        marginBottom: 16,
        ...SHADOWS.small,
    },
    matchHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    matchCompetition: {
        color: COLORS.primary,
        fontWeight: 'bold',
        fontSize: 14,
    },
    statusBadge: {
        backgroundColor: COLORS.success + '20',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 10,
    },
    statusText: {
        color: COLORS.success,
        fontSize: 12,
        fontWeight: '600',
    },
    teamsContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    teamName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.text,
        flex: 1,
        textAlign: 'center',
    },
    vsText: {
        color: COLORS.textSecondary,
        marginHorizontal: 10,
        fontSize: 14,
    },
    matchInfo: {
        alignItems: 'center',
        marginBottom: 16,
    },
    infoText: {
        color: COLORS.textSecondary,
        fontSize: 13,
        marginBottom: 4,
    },
    configButton: {
        backgroundColor: COLORS.primary,
        paddingVertical: 12,
        borderRadius: SIZES.radiusSm,
        alignItems: 'center',
    },
    configButtonText: {
        color: COLORS.textWhite,
        fontWeight: 'bold',
        fontSize: 14,
    },
    emptyState: {
        padding: 40,
        alignItems: 'center',
    },
    emptyText: {
        color: COLORS.textSecondary,
        fontSize: 16,
    },
    // Modal
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        padding: 20,
    },
    modalContent: {
        backgroundColor: COLORS.card,
        borderRadius: SIZES.radiusLg,
        padding: 20,
        maxHeight: '90%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: COLORS.text,
    },
    closeBtn: {
        fontSize: 24,
        color: COLORS.textSecondary,
        padding: 5,
    },
    matchTitle: {
        fontSize: 16,
        color: COLORS.primary,
        marginBottom: 20,
        fontWeight: '600',
        textAlign: 'center',
    },
    configList: {
        marginBottom: 20,
    },
    sectionRow: {
        marginBottom: 20,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.borderLight,
        paddingBottom: 15,
    },
    sectionLabel: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.text,
        marginBottom: 10,
    },
    inputsRow: {
        flexDirection: 'row',
        gap: 15,
    },
    inputGroup: {
        flex: 1,
    },
    inputLegend: {
        fontSize: 12,
        color: COLORS.textSecondary,
        marginBottom: 5,
    },
    input: {
        borderWidth: 1,
        borderColor: COLORS.border,
        borderRadius: SIZES.radiusSm,
        padding: 10,
        fontSize: 16,
        backgroundColor: COLORS.background,
        color: COLORS.text,
    },
    modalFooter: {
        borderTopWidth: 1,
        borderTopColor: COLORS.borderLight,
        paddingTop: 15,
    },
    saveBtn: {
        backgroundColor: COLORS.success,
        padding: 15,
        borderRadius: SIZES.radiusMd,
        alignItems: 'center',
    },
    saveBtnText: {
        color: COLORS.textWhite,
        fontWeight: 'bold',
        fontSize: 16,
    },
    btnDisabled: {
        opacity: 0.7,
    },
});

export default AdminTicketsScreen;
