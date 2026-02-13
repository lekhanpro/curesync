import React, { useMemo, useCallback } from 'react';
import { View, Text, Pressable, Platform } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import { BlurView } from 'expo-blur';
import { Plus, Sparkles } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useMedications, useTodayHistory, useRecordDose } from '../../hooks/use-medications';
import { useUIStore } from '../../store/ui-store';
import { ProgressRing } from '../../components/progress-ring';
import { MedCard } from '../../components/med-card';
import type { Medication } from '../../db/schema';

// ── Schedule helpers ────────────────────────────────────────
interface TimeSlot {
    id: string;
    time: string;
    medication: Medication;
    isPast: boolean;
}

function buildTimeline(meds: Medication[]): TimeSlot[] {
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const slots: TimeSlot[] = [];

    for (const med of meds) {
        let times: string[] = ['08:00', '14:00', '20:00']; // default schedule

        if (med.frequency) {
            try {
                const freq = JSON.parse(med.frequency);
                if (freq.times && Array.isArray(freq.times)) {
                    times = freq.times;
                }
            } catch { }
        }

        for (const t of times) {
            const [h, m] = t.split(':').map(Number);
            const slotMinutes = h * 60 + m;
            slots.push({
                id: `${med.id}-${t}`,
                time: t,
                medication: med,
                isPast: slotMinutes <= currentMinutes,
            });
        }
    }

    // Sort by time
    slots.sort((a, b) => {
        const [ah, am] = a.time.split(':').map(Number);
        const [bh, bm] = b.time.split(':').map(Number);
        return ah * 60 + am - (bh * 60 + bm);
    });

    return slots;
}

function getGreeting(): string {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
}

// ── Dashboard Screen ────────────────────────────────────────
export default function DashboardScreen() {
    const router = useRouter();
    const userName = useUIStore((s) => s.userName);
    const { data: meds = [] } = useMedications();
    const { data: historyRecords = [] } = useTodayHistory();
    const recordDose = useRecordDose();

    // Build timeline
    const timeline = useMemo(() => buildTimeline(meds), [meds]);

    // Calculate progress
    const totalDoses = timeline.length;
    const takenDoses = historyRecords.filter((h) => h.status === 'taken').length;
    const progress = totalDoses > 0 ? takenDoses / totalDoses : 0;

    // Check if a dose is taken/skipped
    const getDoseStatus = useCallback(
        (medId: number, time: string) => {
            const record = historyRecords.find((h) => h.medId === medId);
            return {
                isTaken: record?.status === 'taken',
                isSkipped: record?.status === 'skipped',
            };
        },
        [historyRecords]
    );

    const handleTake = useCallback(
        async (medId: number) => {
            await recordDose.mutateAsync({ medId, status: 'taken' });
        },
        [recordDose]
    );

    const handleSkip = useCallback(
        async (medId: number) => {
            await recordDose.mutateAsync({ medId, status: 'skipped' });
        },
        [recordDose]
    );

    const handleAddMed = async () => {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        router.push('/add-medication');
    };

    // ── Render ──────────────────────────────────────────────
    const renderHeader = () => (
        <View style={{ paddingTop: Platform.OS === 'ios' ? 60 : 40, paddingBottom: 8 }}>
            {/* Greeting */}
            <Animated.View
                entering={FadeIn.duration(600)}
                style={{ paddingHorizontal: 20, marginBottom: 24 }}
            >
                <Text
                    style={{
                        fontSize: 14,
                        fontWeight: '600',
                        color: '#14B8A6',
                        letterSpacing: 1,
                        textTransform: 'uppercase',
                        marginBottom: 4,
                    }}
                >
                    {getGreeting()}
                </Text>
                <Text
                    style={{
                        fontSize: 28,
                        fontWeight: '800',
                        color: '#0F172A',
                        letterSpacing: -0.8,
                    }}
                >
                    {userName} 👋
                </Text>
                <Text
                    style={{
                        fontSize: 14,
                        fontWeight: '500',
                        color: '#64748B',
                        marginTop: 4,
                    }}
                >
                    {totalDoses > 0
                        ? `${takenDoses} of ${totalDoses} doses completed today`
                        : 'No medications scheduled. Tap + to add one.'}
                </Text>
            </Animated.View>

            {/* Progress Ring */}
            {totalDoses > 0 && (
                <Animated.View
                    entering={FadeInDown.delay(200).springify().damping(15)}
                    style={{
                        alignItems: 'center',
                        marginBottom: 28,
                        backgroundColor: '#FFFFFF',
                        marginHorizontal: 20,
                        borderRadius: 28,
                        paddingVertical: 28,
                        shadowColor: '#94A3B8',
                        shadowOffset: { width: 0, height: 6 },
                        shadowOpacity: 0.08,
                        shadowRadius: 16,
                        elevation: 4,
                    }}
                >
                    <ProgressRing
                        progress={progress}
                        size={140}
                        strokeWidth={10}
                        label="completed"
                        sublabel={`${totalDoses - takenDoses} remaining`}
                    />
                </Animated.View>
            )}

            {/* Section Title */}
            <Animated.View
                entering={FadeInDown.delay(350)}
                style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingHorizontal: 20,
                    marginBottom: 12,
                }}
            >
                <Sparkles size={16} color="#14B8A6" strokeWidth={2.5} />
                <Text
                    style={{
                        fontSize: 15,
                        fontWeight: '700',
                        color: '#0F172A',
                        letterSpacing: -0.3,
                        marginLeft: 6,
                    }}
                >
                    Today's Schedule
                </Text>
            </Animated.View>
        </View>
    );

    const renderEmpty = () => (
        <Animated.View
            entering={FadeInDown.delay(400)}
            style={{
                alignItems: 'center',
                paddingVertical: 60,
                paddingHorizontal: 40,
            }}
        >
            <Text style={{ fontSize: 48, marginBottom: 16 }}>💊</Text>
            <Text
                style={{
                    fontSize: 18,
                    fontWeight: '700',
                    color: '#0F172A',
                    textAlign: 'center',
                    letterSpacing: -0.3,
                }}
            >
                No medications yet
            </Text>
            <Text
                style={{
                    fontSize: 14,
                    fontWeight: '500',
                    color: '#64748B',
                    textAlign: 'center',
                    marginTop: 6,
                    lineHeight: 20,
                }}
            >
                Add your first medication to start tracking your health journey.
            </Text>
        </Animated.View>
    );

    return (
        <View style={{ flex: 1, backgroundColor: '#F8FAFC' }}>
            <FlashList
                data={timeline}
                keyExtractor={(item) => item.id}
                estimatedItemSize={120}
                ListHeaderComponent={renderHeader}
                ListEmptyComponent={renderEmpty}
                contentContainerStyle={{ paddingBottom: 120 }}
                renderItem={({ item, index }) => {
                    const { isTaken, isSkipped } = getDoseStatus(item.medication.id, item.time);
                    return (
                        <MedCard
                            medication={item.medication}
                            time={item.time}
                            isPast={item.isPast}
                            isTaken={isTaken}
                            isSkipped={isSkipped}
                            index={index}
                            onTake={() => handleTake(item.medication.id)}
                            onSkip={() => handleSkip(item.medication.id)}
                        />
                    );
                }}
            />

            {/* ── FAB ─────────────────────────────────────────────── */}
            <Animated.View
                entering={FadeInDown.delay(600).springify()}
                style={{
                    position: 'absolute',
                    bottom: Platform.OS === 'ios' ? 108 : 88,
                    right: 20,
                }}
            >
                <Pressable
                    onPress={handleAddMed}
                    style={{
                        width: 58,
                        height: 58,
                        borderRadius: 20,
                        backgroundColor: '#14B8A6',
                        alignItems: 'center',
                        justifyContent: 'center',
                        shadowColor: '#14B8A6',
                        shadowOffset: { width: 0, height: 8 },
                        shadowOpacity: 0.35,
                        shadowRadius: 16,
                        elevation: 8,
                    }}
                >
                    <Plus size={26} color="#FFF" strokeWidth={2.5} />
                </Pressable>
            </Animated.View>
        </View>
    );
}
