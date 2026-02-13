import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    Pressable,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    Alert,
} from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import * as Haptics from 'expo-haptics';
import { X, Check, Pill, AlertTriangle } from 'lucide-react-native';
import { useAddMedication, useMedications } from '../hooks/use-medications';
import { checkDrugInteraction } from '../services/fda';
import { InteractionWarning } from '../components/interaction-warning';

// ── Zod Schema ──────────────────────────────────────────────
const medicationSchema = z.object({
    name: z.string().min(1, 'Medication name is required'),
    dosage: z.string().optional(),
    frequency: z.string().optional(),
    inventoryCount: z.coerce.number().min(0).optional(),
    icon: z.string().optional(),
});

type MedicationForm = z.infer<typeof medicationSchema>;

// ── Color Palette ───────────────────────────────────────────
const COLORS = [
    '#14B8A6', '#3B82F6', '#8B5CF6', '#EC4899',
    '#F97316', '#EAB308', '#10B981', '#06B6D4',
    '#6366F1', '#F43F5E', '#84CC16', '#78716C',
];

// ── Time Presets ────────────────────────────────────────────
const TIME_PRESETS = [
    { label: 'Once daily', value: '{"type":"daily","times":["09:00"]}' },
    { label: 'Twice daily', value: '{"type":"daily","times":["08:00","20:00"]}' },
    { label: 'Three times', value: '{"type":"daily","times":["08:00","14:00","20:00"]}' },
    { label: 'Every 8h', value: '{"type":"interval","times":["08:00"],"intervalHours":8}' },
];

// ── Interaction Result Type ─────────────────────────────────
interface InteractionResult {
    status: 'safe' | 'warning' | 'unknown';
    message: string;
    severity?: 'low' | 'moderate' | 'high';
    drugA?: string;
    drugB?: string;
}

export default function AddMedicationScreen() {
    const router = useRouter();
    const addMed = useAddMedication();
    const { data: existingMeds = [] } = useMedications();
    const [selectedColor, setSelectedColor] = useState(COLORS[0]);
    const [selectedFreq, setSelectedFreq] = useState(TIME_PRESETS[0].value);
    const [interactions, setInteractions] = useState<InteractionResult[]>([]);
    const [isChecking, setIsChecking] = useState(false);

    const {
        control,
        handleSubmit,
        watch,
        formState: { errors },
    } = useForm<MedicationForm>({
        resolver: zodResolver(medicationSchema),
        defaultValues: {
            name: '',
            dosage: '',
            inventoryCount: 0,
        },
    });

    const watchedName = watch('name');

    // ── Check interactions on name blur ────────────────────
    const handleCheckInteractions = async () => {
        if (!watchedName || watchedName.length < 2) return;
        const existingNames = existingMeds.map((m) => m.name);
        if (existingNames.length === 0) return;

        setIsChecking(true);
        try {
            const results = await checkDrugInteraction(watchedName, existingNames);
            setInteractions(results);
        } catch {
            setInteractions([{
                status: 'unknown',
                message: 'Could not check for interactions.',
            }]);
        } finally {
            setIsChecking(false);
        }
    };

    // ── Submit ────────────────────────────────────────────────
    const onSubmit = async (data: MedicationForm) => {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

        try {
            await addMed.mutateAsync({
                name: data.name,
                dosage: data.dosage || null,
                frequency: selectedFreq,
                inventoryCount: data.inventoryCount || 0,
                color: selectedColor,
                icon: data.icon || 'pill',
            });
            router.back();
        } catch (err) {
            Alert.alert('Error', 'Failed to save medication. Please try again.');
        }
    };

    // ── Input Style ───────────────────────────────────────────
    const inputStyle = {
        height: 56,
        backgroundColor: '#F1F5F9',
        borderRadius: 16,
        paddingHorizontal: 16,
        fontSize: 16,
        fontWeight: '500' as const,
        color: '#0F172A',
    };

    const labelStyle = {
        fontSize: 13,
        fontWeight: '700' as const,
        color: '#334155',
        letterSpacing: -0.2,
        marginBottom: 8,
        marginTop: 20,
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={{ flex: 1, backgroundColor: '#F8FAFC' }}
        >
            <ScrollView
                contentContainerStyle={{ paddingBottom: 100 }}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
            >
                {/* ── Header ─────────────────────────────────────── */}
                <Animated.View
                    entering={FadeInDown.duration(400)}
                    style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        paddingHorizontal: 20,
                        paddingTop: Platform.OS === 'ios' ? 60 : 40,
                        paddingBottom: 16,
                    }}
                >
                    <Pressable
                        onPress={() => router.back()}
                        style={{
                            width: 40,
                            height: 40,
                            borderRadius: 14,
                            backgroundColor: '#F1F5F9',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        <X size={20} color="#64748B" strokeWidth={2} />
                    </Pressable>
                    <Text
                        style={{
                            fontSize: 18,
                            fontWeight: '700',
                            color: '#0F172A',
                            letterSpacing: -0.5,
                        }}
                    >
                        Add Medication
                    </Text>
                    <View style={{ width: 40 }} />
                </Animated.View>

                <View style={{ paddingHorizontal: 20 }}>
                    {/* ── Name ───────────────────────────────────────── */}
                    <Animated.View entering={FadeInDown.delay(100)}>
                        <Text style={labelStyle}>MEDICATION NAME *</Text>
                        <Controller
                            control={control}
                            name="name"
                            render={({ field: { onChange, onBlur, value } }) => (
                                <TextInput
                                    style={[
                                        inputStyle,
                                        errors.name && { borderWidth: 1.5, borderColor: '#F43F5E' },
                                    ]}
                                    placeholder="e.g. Metformin"
                                    placeholderTextColor="#94A3B8"
                                    value={value}
                                    onChangeText={onChange}
                                    onBlur={() => {
                                        onBlur();
                                        handleCheckInteractions();
                                    }}
                                    autoCapitalize="words"
                                />
                            )}
                        />
                        {errors.name && (
                            <Text style={{ color: '#F43F5E', fontSize: 12, marginTop: 4, fontWeight: '500' }}>
                                {errors.name.message}
                            </Text>
                        )}
                    </Animated.View>

                    {/* ── Interaction Warnings ──────────────────────── */}
                    {interactions.length > 0 && interactions.some((i) => i.status === 'warning') && (
                        <View style={{ marginTop: 12, marginHorizontal: -20 }}>
                            {interactions
                                .filter((i) => i.status === 'warning')
                                .map((interaction, idx) => (
                                    <InteractionWarning
                                        key={idx}
                                        drugA={interaction.drugA || watchedName}
                                        drugB={interaction.drugB || 'Unknown'}
                                        effect={interaction.message}
                                        severity={interaction.severity}
                                    />
                                ))}
                        </View>
                    )}

                    {isChecking && (
                        <Animated.View
                            entering={FadeInUp}
                            style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                marginTop: 8,
                                gap: 6,
                            }}
                        >
                            <AlertTriangle size={14} color="#F97316" strokeWidth={2} />
                            <Text style={{ fontSize: 12, color: '#F97316', fontWeight: '500' }}>
                                Checking for interactions...
                            </Text>
                        </Animated.View>
                    )}

                    {/* ── Dosage ─────────────────────────────────────── */}
                    <Animated.View entering={FadeInDown.delay(200)}>
                        <Text style={labelStyle}>DOSAGE</Text>
                        <Controller
                            control={control}
                            name="dosage"
                            render={({ field: { onChange, value } }) => (
                                <TextInput
                                    style={inputStyle}
                                    placeholder="e.g. 500mg"
                                    placeholderTextColor="#94A3B8"
                                    value={value}
                                    onChangeText={onChange}
                                />
                            )}
                        />
                    </Animated.View>

                    {/* ── Frequency ──────────────────────────────────── */}
                    <Animated.View entering={FadeInDown.delay(300)}>
                        <Text style={labelStyle}>FREQUENCY</Text>
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            style={{ marginHorizontal: -20, paddingHorizontal: 20 }}
                        >
                            {TIME_PRESETS.map((preset) => (
                                <Pressable
                                    key={preset.label}
                                    onPress={() => {
                                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                        setSelectedFreq(preset.value);
                                    }}
                                    style={{
                                        paddingHorizontal: 16,
                                        paddingVertical: 10,
                                        borderRadius: 14,
                                        marginRight: 8,
                                        backgroundColor:
                                            selectedFreq === preset.value ? '#14B8A6' : '#F1F5F9',
                                    }}
                                >
                                    <Text
                                        style={{
                                            fontSize: 13,
                                            fontWeight: '600',
                                            color: selectedFreq === preset.value ? '#FFF' : '#334155',
                                        }}
                                    >
                                        {preset.label}
                                    </Text>
                                </Pressable>
                            ))}
                        </ScrollView>
                    </Animated.View>

                    {/* ── Inventory ──────────────────────────────────── */}
                    <Animated.View entering={FadeInDown.delay(350)}>
                        <Text style={labelStyle}>INVENTORY COUNT</Text>
                        <Controller
                            control={control}
                            name="inventoryCount"
                            render={({ field: { onChange, value } }) => (
                                <TextInput
                                    style={inputStyle}
                                    placeholder="How many pills do you have?"
                                    placeholderTextColor="#94A3B8"
                                    value={value?.toString()}
                                    onChangeText={(t) => onChange(parseInt(t) || 0)}
                                    keyboardType="number-pad"
                                />
                            )}
                        />
                    </Animated.View>

                    {/* ── Color Picker ───────────────────────────────── */}
                    <Animated.View entering={FadeInDown.delay(400)}>
                        <Text style={labelStyle}>THEME COLOR</Text>
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            style={{ marginHorizontal: -20, paddingHorizontal: 20 }}
                        >
                            {COLORS.map((color) => (
                                <Pressable
                                    key={color}
                                    onPress={() => {
                                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                        setSelectedColor(color);
                                    }}
                                    style={{
                                        width: 44,
                                        height: 44,
                                        borderRadius: 22,
                                        backgroundColor: color,
                                        marginRight: 10,
                                        borderWidth: selectedColor === color ? 3 : 0,
                                        borderColor: '#0F172A',
                                        transform: [{ scale: selectedColor === color ? 1.15 : 1 }],
                                    }}
                                />
                            ))}
                        </ScrollView>
                    </Animated.View>
                </View>
            </ScrollView>

            {/* ── Submit Button ────────────────────────────────────── */}
            <Animated.View
                entering={FadeInDown.delay(500).springify()}
                style={{
                    position: 'absolute',
                    bottom: Platform.OS === 'ios' ? 40 : 20,
                    left: 20,
                    right: 20,
                }}
            >
                <Pressable
                    onPress={handleSubmit(onSubmit)}
                    style={{
                        height: 58,
                        backgroundColor: '#14B8A6',
                        borderRadius: 20,
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexDirection: 'row',
                        gap: 8,
                        shadowColor: '#14B8A6',
                        shadowOffset: { width: 0, height: 8 },
                        shadowOpacity: 0.35,
                        shadowRadius: 16,
                        elevation: 8,
                    }}
                >
                    <Pill size={20} color="#FFF" strokeWidth={2.5} />
                    <Text style={{ color: '#FFF', fontSize: 16, fontWeight: '700' }}>
                        Save Medication
                    </Text>
                </Pressable>
            </Animated.View>
        </KeyboardAvoidingView>
    );
}
