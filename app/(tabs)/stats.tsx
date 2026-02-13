import React from 'react';
import { View, Text, Platform } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { BarChart3, TrendingUp, Calendar } from 'lucide-react-native';
import { useMedications, useTodayHistory } from '../../hooks/use-medications';

export default function StatsScreen() {
    const { data: meds = [] } = useMedications();
    const { data: historyRecords = [] } = useTodayHistory();

    const taken = historyRecords.filter((h) => h.status === 'taken').length;
    const skipped = historyRecords.filter((h) => h.status === 'skipped').length;
    const adherenceRate = taken + skipped > 0
        ? Math.round((taken / (taken + skipped)) * 100)
        : 0;

    const stats = [
        { label: 'Active Medications', value: meds.length.toString(), icon: BarChart3, color: '#14B8A6' },
        { label: 'Doses Taken Today', value: taken.toString(), icon: TrendingUp, color: '#10B981' },
        { label: 'Adherence Rate', value: `${adherenceRate}%`, icon: Calendar, color: '#3B82F6' },
        { label: 'Doses Skipped', value: skipped.toString(), icon: BarChart3, color: '#F43F5E' },
    ];

    return (
        <View style={{ flex: 1, backgroundColor: '#F8FAFC', paddingTop: Platform.OS === 'ios' ? 100 : 80 }}>
            <Animated.View entering={FadeInDown.duration(400)} style={{ paddingHorizontal: 20, marginBottom: 24 }}>
                <Text style={{ fontSize: 28, fontWeight: '800', color: '#0F172A', letterSpacing: -0.8 }}>
                    Statistics
                </Text>
                <Text style={{ fontSize: 14, fontWeight: '500', color: '#64748B', marginTop: 4 }}>
                    Your medication adherence overview
                </Text>
            </Animated.View>

            <View style={{ paddingHorizontal: 20, gap: 12 }}>
                {stats.map((stat, index) => {
                    const Icon = stat.icon;
                    return (
                        <Animated.View
                            key={stat.label}
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
                                    backgroundColor: stat.color + '15',
                                    alignItems: 'center', justifyContent: 'center', marginRight: 16,
                                }}
                            >
                                <Icon size={22} color={stat.color} strokeWidth={2} />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={{ fontSize: 13, fontWeight: '500', color: '#64748B' }}>
                                    {stat.label}
                                </Text>
                                <Text style={{
                                    fontSize: 28, fontWeight: '800', color: '#0F172A',
                                    letterSpacing: -1, fontVariant: ['tabular-nums'],
                                }}>
                                    {stat.value}
                                </Text>
                            </View>
                        </Animated.View>
                    );
                })}
            </View>
        </View>
    );
}
