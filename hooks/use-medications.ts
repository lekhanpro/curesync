import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { eq } from 'drizzle-orm';
import { db } from '../db/client';
import { medications, history, notifications } from '../db/schema';
import type { NewMedication, NewHistoryRecord } from '../db/schema';
import { scheduleMedication, cancelMedicationNotifications } from '../services/scheduler';

// ── Keys ────────────────────────────────────────────────────
export const queryKeys = {
    medications: ['medications'] as const,
    history: ['history'] as const,
    todayHistory: ['history', 'today'] as const,
};

// ── Fetch all medications ───────────────────────────────────
export function useMedications() {
    return useQuery({
        queryKey: queryKeys.medications,
        queryFn: async () => db.select().from(medications).all(),
    });
}

// ── Fetch today's history ───────────────────────────────────
export function useTodayHistory() {
    return useQuery({
        queryKey: queryKeys.todayHistory,
        queryFn: async () => {
            const startOfDay = new Date();
            startOfDay.setHours(0, 0, 0, 0);
            return db.select().from(history).all();
        },
    });
}

// ── Add medication ──────────────────────────────────────────
export function useAddMedication() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async (med: NewMedication) => {
            const result = await db.insert(medications).values({
                ...med,
                createdAt: new Date(),
            }).returning();

            // Schedule notifications for the new medication
            if (result[0]) {
                const notifIds = await scheduleMedication(result[0]);
                // Store notification IDs
                for (const nId of notifIds) {
                    await db.insert(notifications).values({
                        id: nId,
                        medId: result[0].id,
                        scheduledTime: Date.now(),
                    });
                }
            }

            return result[0];
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: queryKeys.medications });
        },
    });
}

// ── Record dose (taken/skipped) ─────────────────────────────
export function useRecordDose() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async (record: NewHistoryRecord) => {
            const result = await db.insert(history).values({
                ...record,
                takenAt: new Date(),
            }).returning();

            // Decrement inventory if taken
            if (record.status === 'taken') {
                const med = await db.select().from(medications)
                    .where(eq(medications.id, record.medId)).get();
                if (med && (med.inventoryCount ?? 0) > 0) {
                    await db.update(medications)
                        .set({ inventoryCount: (med.inventoryCount ?? 1) - 1 })
                        .where(eq(medications.id, record.medId));
                }
            }

            return result[0];
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: queryKeys.todayHistory });
            qc.invalidateQueries({ queryKey: queryKeys.medications });
        },
    });
}

// ── Delete medication ───────────────────────────────────────
export function useDeleteMedication() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async (medId: number) => {
            // Cancel scheduled notifications
            const notifs = await db.select().from(notifications)
                .where(eq(notifications.medId, medId)).all();
            await cancelMedicationNotifications(notifs.map((n) => n.id));

            // Delete from DB (cascade handles history & notifications)
            await db.delete(medications).where(eq(medications.id, medId));
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: queryKeys.medications });
        },
    });
}
