import React from 'react';
import { View, Text, Platform, ScrollView, Pressable, Alert } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Pill, Trash2, Edit3 } from 'lucide-react-native';
import { useMedications, useDeleteMedication } from '../../hooks/use-medications';
import * as Haptics from 'expo-haptics';

export default function MedsScreen() {
    const { data: meds = [] } = useMedications();
    const deleteMed = useDeleteMedication();

    const handleDelete = (id: number, name: string) => {
        Alert.alert(
            'Delete Medication',
            `Are you sure you want to delete ${name}?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                        await deleteMed.mutateAsync(id);
                    },
                },
            ]
        );
    };

    return (
        <ScrollView style={{ flex: 1, backgroundColor: '#F8FAFC' }} contentContainerStyle={{ paddingTop: Platform.OS === 'ios' ? 100 : 80, paddingBottom: 130 }}>
            <Animated.View entering={FadeInDown.duration(400)} style={{ paddingHorizontal: 20, marginBottom: 24 }}>
                <Text style={{ fontSize: 28, fontWeight: '800', color: '#0F172A', letterSpacing: -0.8 }}>
                    My Medications
                </Text>
                <Text style={{ fontSize: 14, fontWeight: '500', color: '#64748B', marginTop: 4 }}>
                    Manage your active prescriptions
                </Text>
            </Animated.View>

            <View style={{ paddingHorizontal: 20, gap: 12 }}>
                {meds.length === 0 ? (
                    <Text style={{ textAlign: 'center', color: '#94A3B8', marginTop: 40 }}>
                        No medications found.
                    </Text>
                ) : (
                    meds.map((med, index) => (
                        <Animated.View
                            key={med.id.toString()}
                            entering={FadeInDown.delay(100 * index).springify().damping(15)}
                            style={{
                                backgroundColor: '#FFFFFF',
                                borderRadius: 24,
                                padding: 20,
                                flexDirection: 'row',
                                alignItems: 'center',
                                shadowColor: '#94A3B8',
                                shadowOffset: { width: 0, height: 4 },
                                shadowOpacity: 0.06,
                                shadowRadius: 12,
                                elevation: 2,
                            }}
                        >
                            <View
                                style={{
                                    width: 48, height: 48, borderRadius: 16,
                                    backgroundColor: (med.color || '#14B8A6') + '15',
                                    alignItems: 'center', justifyContent: 'center', marginRight: 16,
                                }}
                            >
                                <Pill size={22} color={med.color || '#14B8A6'} strokeWidth={2} />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={{ fontSize: 18, fontWeight: '700', color: '#0F172A' }}>
                                    {med.name}
                                </Text>
                                <Text style={{ fontSize: 13, fontWeight: '500', color: '#64748B', marginTop: 2 }}>
                                    {med.dosage || 'No dosage'} • {med.inventoryCount} left
                                </Text>
                            </View>
                            <Pressable
                                onPress={() => handleDelete(med.id, med.name)}
                                style={{ padding: 8, backgroundColor: '#FEF2F2', borderRadius: 12 }}
                            >
                                <Trash2 size={20} color="#EF4444" />
                            </Pressable>
                        </Animated.View>
                    ))
                )}
            </View>
        </ScrollView>
    );
}
