import React from 'react';
import { View, Text, Pressable } from 'react-native';
import Animated, {
    FadeInDown,
    LinearTransition,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Check, X, Clock, Pill } from 'lucide-react-native';
import type { Medication } from '../db/schema';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface MedCardProps {
    medication: Medication;
    time: string;
    isPast: boolean;
    isTaken: boolean;
    isSkipped: boolean;
    index: number;
    onTake: () => void;
    onSkip: () => void;
}

export function MedCard({
    medication,
    time,
    isPast,
    isTaken,
    isSkipped,
    index,
    onTake,
    onSkip,
}: MedCardProps) {
    const scale = useSharedValue(1);

    const animStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));

    const handleTake = async () => {
        scale.value = withSpring(0.95, {}, () => {
            scale.value = withSpring(1);
        });
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        onTake();
    };

    const handleSkip = async () => {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onSkip();
    };

    const statusColor = isTaken
        ? '#10B981'
        : isSkipped
            ? '#94A3B8'
            : medication.color || '#14B8A6';

    return (
        <Animated.View
            entering={FadeInDown.springify().damping(15).delay(index * 80)}
            layout={LinearTransition.springify()}
            style={{ flexDirection: 'row', marginBottom: 12, paddingHorizontal: 16 }}
        >
            {/* ── Timeline Connector ─────────────────────────────── */}
            <View style={{ alignItems: 'center', width: 48, paddingTop: 4 }}>
                <Text
                    style={{
                        fontSize: 12,
                        fontWeight: '700',
                        color: isPast ? '#64748B' : '#0F172A',
                        fontVariant: ['tabular-nums'],
                    }}
                >
                    {time}
                </Text>
                <View
                    style={{
                        width: 2,
                        flex: 1,
                        backgroundColor: isPast ? '#CBD5E1' : '#E2E8F0',
                        marginTop: 6,
                        borderStyle: isPast ? 'solid' : 'dashed',
                    }}
                />
                <View
                    style={{
                        width: 10,
                        height: 10,
                        borderRadius: 5,
                        backgroundColor: statusColor,
                        marginTop: -1,
                    }}
                />
            </View>

            {/* ── Pill Card ──────────────────────────────────────── */}
            <AnimatedPressable
                style={[
                    animStyle,
                    {
                        flex: 1,
                        backgroundColor: isTaken ? '#F0FDF4' : isSkipped ? '#F8FAFC' : '#FFFFFF',
                        borderRadius: 24,
                        padding: 16,
                        marginLeft: 12,
                        shadowColor: '#94A3B8',
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.08,
                        shadowRadius: 12,
                        elevation: 3,
                        borderWidth: isTaken ? 1 : 0,
                        borderColor: '#BBF7D0',
                    },
                ]}
                onPress={!isTaken && !isSkipped ? handleTake : undefined}
            >
                {/* Top Row */}
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    {/* Icon */}
                    <View
                        style={{
                            width: 44,
                            height: 44,
                            borderRadius: 14,
                            backgroundColor: statusColor + '15',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginRight: 12,
                        }}
                    >
                        {isTaken ? (
                            <Check size={22} color="#10B981" strokeWidth={2.5} />
                        ) : (
                            <Pill size={22} color={statusColor} strokeWidth={2} />
                        )}
                    </View>

                    {/* Name & Dosage */}
                    <View style={{ flex: 1 }}>
                        <Text
                            style={{
                                fontSize: 16,
                                fontWeight: '700',
                                color: isTaken ? '#065F46' : '#0F172A',
                                letterSpacing: -0.3,
                            }}
                            numberOfLines={1}
                        >
                            {medication.name}
                        </Text>
                        <Text
                            style={{
                                fontSize: 13,
                                fontWeight: '500',
                                color: '#64748B',
                                marginTop: 2,
                            }}
                        >
                            {medication.dosage || 'As prescribed'}
                            {medication.inventoryCount != null && medication.inventoryCount > 0 && (
                                ` · ${medication.inventoryCount} left`
                            )}
                        </Text>
                    </View>

                    {/* Status Indicator */}
                    {isTaken && (
                        <View
                            style={{
                                backgroundColor: '#DCFCE7',
                                paddingHorizontal: 10,
                                paddingVertical: 4,
                                borderRadius: 20,
                            }}
                        >
                            <Text style={{ fontSize: 11, fontWeight: '700', color: '#059669' }}>
                                TAKEN ✓
                            </Text>
                        </View>
                    )}
                    {isSkipped && (
                        <View
                            style={{
                                backgroundColor: '#F1F5F9',
                                paddingHorizontal: 10,
                                paddingVertical: 4,
                                borderRadius: 20,
                            }}
                        >
                            <Text style={{ fontSize: 11, fontWeight: '700', color: '#94A3B8' }}>
                                SKIPPED
                            </Text>
                        </View>
                    )}
                </View>

                {/* Action Buttons */}
                {!isTaken && !isSkipped && (
                    <View
                        style={{
                            flexDirection: 'row',
                            marginTop: 12,
                            gap: 8,
                        }}
                    >
                        <Pressable
                            onPress={handleTake}
                            style={{
                                flex: 1,
                                backgroundColor: '#14B8A6',
                                paddingVertical: 10,
                                borderRadius: 14,
                                alignItems: 'center',
                                flexDirection: 'row',
                                justifyContent: 'center',
                                gap: 6,
                            }}
                        >
                            <Check size={16} color="#FFF" strokeWidth={2.5} />
                            <Text style={{ color: '#FFF', fontWeight: '700', fontSize: 13 }}>
                                Take
                            </Text>
                        </Pressable>
                        <Pressable
                            onPress={handleSkip}
                            style={{
                                paddingVertical: 10,
                                paddingHorizontal: 16,
                                borderRadius: 14,
                                backgroundColor: '#F1F5F9',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                        >
                            <X size={16} color="#94A3B8" strokeWidth={2} />
                        </Pressable>
                    </View>
                )}
            </AnimatedPressable>
        </Animated.View>
    );
}
