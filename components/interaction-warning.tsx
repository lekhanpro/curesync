import React from 'react';
import { View, Text } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { AlertTriangle } from 'lucide-react-native';

interface InteractionWarningProps {
    drugA: string;
    drugB: string;
    effect: string;
    severity?: 'low' | 'moderate' | 'high';
}

export function InteractionWarning({
    drugA,
    drugB,
    effect,
    severity = 'moderate',
}: InteractionWarningProps) {
    const severityColors = {
        low: { bg: '#FFF7ED', border: '#F97316', text: '#9A3412' },
        moderate: { bg: '#FFF1F2', border: '#F43F5E', text: '#9F1239' },
        high: { bg: '#FEF2F2', border: '#DC2626', text: '#991B1B' },
    };

    const colors = severityColors[severity];

    return (
        <Animated.View
            entering={FadeInUp.delay(200).springify().damping(15)}
            style={{
                backgroundColor: colors.bg,
                borderLeftWidth: 4,
                borderLeftColor: colors.border,
                borderRadius: 16,
                padding: 16,
                marginVertical: 8,
                marginHorizontal: 16,
                shadowColor: colors.border,
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 8,
                elevation: 3,
            }}
        >
            {/* Header */}
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                <View
                    style={{
                        width: 32,
                        height: 32,
                        borderRadius: 8,
                        backgroundColor: colors.border + '20',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginRight: 10,
                    }}
                >
                    <AlertTriangle size={18} color={colors.border} strokeWidth={2.5} />
                </View>
                <Text
                    style={{
                        fontWeight: '700',
                        fontSize: 14,
                        color: colors.text,
                        letterSpacing: -0.3,
                    }}
                >
                    ⚠️ Potential Interaction Detected
                </Text>
            </View>

            {/* Drug Names */}
            <View
                style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    marginBottom: 6,
                    paddingLeft: 42,
                }}
            >
                <View
                    style={{
                        backgroundColor: colors.border + '15',
                        paddingHorizontal: 10,
                        paddingVertical: 4,
                        borderRadius: 20,
                        marginRight: 6,
                    }}
                >
                    <Text style={{ fontWeight: '600', fontSize: 13, color: colors.text }}>
                        {drugA}
                    </Text>
                </View>
                <Text style={{ color: colors.text, fontWeight: '500', marginHorizontal: 4 }}>
                    ×
                </Text>
                <View
                    style={{
                        backgroundColor: colors.border + '15',
                        paddingHorizontal: 10,
                        paddingVertical: 4,
                        borderRadius: 20,
                    }}
                >
                    <Text style={{ fontWeight: '600', fontSize: 13, color: colors.text }}>
                        {drugB}
                    </Text>
                </View>
            </View>

            {/* Effect Description */}
            <Text
                style={{
                    fontSize: 13,
                    lineHeight: 19,
                    color: colors.text + 'CC',
                    fontWeight: '500',
                    paddingLeft: 42,
                }}
            >
                {effect}
            </Text>

            {/* Severity Badge */}
            <View style={{ flexDirection: 'row', paddingLeft: 42, marginTop: 8 }}>
                <View
                    style={{
                        backgroundColor: colors.border + '20',
                        paddingHorizontal: 8,
                        paddingVertical: 2,
                        borderRadius: 10,
                    }}
                >
                    <Text
                        style={{
                            fontSize: 11,
                            fontWeight: '700',
                            color: colors.border,
                            textTransform: 'uppercase',
                            letterSpacing: 0.5,
                        }}
                    >
                        {severity} risk
                    </Text>
                </View>
            </View>
        </Animated.View>
    );
}
