// ===========================================
// WYDAD AC - EDIT PROFILE SCREEN
// ===========================================

import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { COLORS, SIZES, SHADOWS } from '../theme/colors';

const EditProfileScreen = ({ navigation }) => {
    const { user, updateProfile } = useAuth();
    const [name, setName] = useState(user?.name || '');
    const [phone, setPhone] = useState(user?.phone || '');
    const [bio, setBio] = useState(user?.bio || '');
    const [loading, setLoading] = useState(false);

    const handleSave = async () => {
        if (!name.trim()) {
            Alert.alert('Erreur', 'Le nom est requis');
            return;
        }

        setLoading(true);
        try {
            const result = await updateProfile({ name, phone, bio });
            if (result.success) {
                Alert.alert('Succès', 'Profil mis à jour avec succès', [
                    { text: 'OK', onPress: () => navigation.goBack() },
                ]);
            } else {
                Alert.alert('Erreur', result.message || 'Impossible de mettre à jour le profil');
            }
        } catch (error) {
            Alert.alert('Erreur', error.message || 'Une erreur est survenue');
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Text style={styles.backIcon}>←</Text>
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Modifier mon profil</Text>
                    <View style={{ width: 40 }} />
                </View>

                <ScrollView contentContainerStyle={styles.scrollContent}>
                    <View style={styles.formContainer}>
                        <Text style={styles.label}>Nom complet</Text>
                        <TextInput
                            style={styles.input}
                            value={name}
                            onChangeText={setName}
                            placeholder="Votre nom"
                            placeholderTextColor={COLORS.textLight}
                        />

                        <Text style={styles.label}>Téléphone</Text>
                        <TextInput
                            style={styles.input}
                            value={phone}
                            onChangeText={setPhone}
                            placeholder="+212 6..."
                            placeholderTextColor={COLORS.textLight}
                            keyboardType="phone-pad"
                        />

                        <Text style={styles.label}>Bio</Text>
                        <TextInput
                            style={[styles.input, styles.textArea]}
                            value={bio}
                            onChangeText={setBio}
                            placeholder="Parlez-nous de vous..."
                            placeholderTextColor={COLORS.textLight}
                            multiline
                            numberOfLines={4}
                        />

                        <Text style={styles.emailText}>Email: {user?.email}</Text>
                        <Text style={styles.helperText}>L'email ne peut pas être modifié.</Text>

                        <TouchableOpacity
                            style={[styles.saveButton, loading && styles.disabledButton]}
                            onPress={handleSave}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator color={COLORS.textWhite} />
                            ) : (
                                <Text style={styles.saveButtonText}>Enregistrer</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
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
        padding: 5,
    },
    backIcon: {
        fontSize: 24,
        color: COLORS.textWhite,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.textWhite,
    },
    scrollContent: {
        flexGrow: 1,
    },
    formContainer: {
        padding: SIZES.screenPadding,
        marginTop: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.text,
        marginBottom: 8,
        marginTop: 15,
    },
    input: {
        backgroundColor: COLORS.card,
        borderRadius: SIZES.radiusSm,
        padding: 15,
        fontSize: 16,
        color: COLORS.text,
        borderWidth: 1,
        borderColor: COLORS.border,
        ...SHADOWS.small,
    },
    textArea: {
        height: 100,
        textAlignVertical: 'top',
    },
    emailText: {
        marginTop: 25,
        fontSize: 14,
        color: COLORS.textSecondary,
    },
    helperText: {
        fontSize: 12,
        color: COLORS.textLight,
        fontStyle: 'italic',
        marginTop: 5,
    },
    saveButton: {
        backgroundColor: COLORS.primary,
        borderRadius: SIZES.radiusMd,
        paddingVertical: 15,
        alignItems: 'center',
        marginTop: 40,
        ...SHADOWS.medium,
    },
    disabledButton: {
        opacity: 0.7,
    },
    saveButtonText: {
        color: COLORS.textWhite,
        fontSize: 18,
        fontWeight: 'bold',
    },
});

export default EditProfileScreen;
