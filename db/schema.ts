import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

// ── Medications ─────────────────────────────────────────────
export const medications = sqliteTable('medications', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    name: text('name').notNull(),
    dosage: text('dosage'),                          // e.g. "50mg"
    frequency: text('frequency'),                    // JSON stringified schedule
    inventoryCount: integer('inventory_count').default(0),
    color: text('color'),                            // Hex code for UI
    icon: text('icon'),                              // Lucide icon name
    createdAt: integer('created_at', { mode: 'timestamp' })
        .$defaultFn(() => new Date()),
});

// ── History ─────────────────────────────────────────────────
export const history = sqliteTable('history', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    medId: integer('med_id')
        .notNull()
        .references(() => medications.id, { onDelete: 'cascade' }),
    takenAt: integer('taken_at', { mode: 'timestamp' }),
    status: text('status', { enum: ['taken', 'skipped'] }).notNull(),
});

// ── Notifications ───────────────────────────────────────────
export const notifications = sqliteTable('notifications', {
    id: text('id').primaryKey(),                     // Expo notification ID
    medId: integer('med_id')
        .notNull()
        .references(() => medications.id, { onDelete: 'cascade' }),
    scheduledTime: integer('scheduled_time'),
});

// ── Type Exports ────────────────────────────────────────────
export type Medication = typeof medications.$inferSelect;
export type NewMedication = typeof medications.$inferInsert;
export type HistoryRecord = typeof history.$inferSelect;
export type NewHistoryRecord = typeof history.$inferInsert;
export type Notification = typeof notifications.$inferSelect;
