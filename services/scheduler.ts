import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import type { Medication } from '../db/schema';

interface ScheduleFrequency {
    type: 'daily' | 'weekly' | 'interval';
    times: string[];        // ["08:00", "14:00", "20:00"]
    daysOfWeek?: number[];  // [1,3,5] for Mon/Wed/Fri
    intervalHours?: number;
}

/**
 * Request notification permissions.
 * Must be called before scheduling any notifications.
 */
export async function requestNotificationPermissions(): Promise<boolean> {
    if (!Device.isDevice) {
        console.warn('Notifications require a physical device');
        return false;
    }

    const { status: existing } = await Notifications.getPermissionsAsync();
    let finalStatus = existing;

    if (existing !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
    }

    if (finalStatus !== 'granted') {
        console.warn('Notification permission not granted');
        return false;
    }

    // Android notification channel
    if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('medication-reminders', {
            name: 'Medication Reminders',
            importance: Notifications.AndroidImportance.HIGH,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#14b8a6',
            sound: 'default',
        });
    }

    return true;
}

/**
 * Configure notification behavior (show even when app is foregrounded).
 */
export function configureNotificationHandler() {
    Notifications.setNotificationHandler({
        handleNotification: async () => ({
            shouldShowAlert: true,
            shouldPlaySound: true,
            shouldSetBadge: true,
        }),
    });
}

/**
 * Schedule medication notifications based on the frequency object.
 * Returns an array of notification IDs for storage in the DB.
 */
export async function scheduleMedication(
    med: Medication
): Promise<string[]> {
    const notificationIds: string[] = [];

    if (!med.frequency) return notificationIds;

    let freq: ScheduleFrequency;
    try {
        freq = JSON.parse(med.frequency as string);
    } catch {
        console.error('Invalid frequency JSON for medication:', med.name);
        return notificationIds;
    }

    // Default content for all notifications
    const baseContent: Notifications.NotificationContentInput = {
        title: '💊 Time for your medication',
        body: `${med.name} — ${med.dosage || 'Take as prescribed'}`,
        data: { medId: med.id, type: 'medication-reminder' },
        sound: 'default',
        categoryIdentifier: 'medication',
    };

    // Android channel MUST be specified in content only (not trigger)
    if (Platform.OS === 'android') {
        // @ts-ignore - channelId is valid for Android
        baseContent.channelId = 'medication-reminders';
    }

    for (const timeStr of freq.times) {
        const [hours, minutes] = timeStr.split(':').map(Number);

        if (freq.type === 'daily') {
            const trigger: Notifications.DailyTriggerInput = {
                hour: hours,
                minute: minutes,
                repeats: true,
            };

            const id = await Notifications.scheduleNotificationAsync({
                content: baseContent,
                trigger,
            });
            notificationIds.push(id);

        } else if (freq.type === 'weekly' && freq.daysOfWeek) {
            // Schedule for each day of the week
            for (const weekday of freq.daysOfWeek) {
                const trigger: Notifications.WeeklyTriggerInput = {
                    weekday: weekday,
                    hour: hours,
                    minute: minutes,
                    repeats: true,
                };

                const id = await Notifications.scheduleNotificationAsync({
                    content: baseContent,
                    trigger,
                });

                notificationIds.push(id);
            }
        } else if (freq.type === 'interval' && freq.intervalHours) {
            const trigger: Notifications.TimeIntervalTriggerInput = {
                seconds: freq.intervalHours * 3600,
                repeats: true,
            };

            const id = await Notifications.scheduleNotificationAsync({
                content: baseContent,
                trigger,
            });
            notificationIds.push(id);
        }
    }

    return notificationIds;
}

/**
 * Cancel all notifications for a specific medication.
 */
export async function cancelMedicationNotifications(
    notificationIds: string[]
): Promise<void> {
    for (const id of notificationIds) {
        await Notifications.cancelScheduledNotificationAsync(id);
    }
}
