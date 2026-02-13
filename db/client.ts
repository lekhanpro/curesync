import React, { createContext, useContext, useEffect, useState } from 'react';
import { openDatabaseSync } from 'expo-sqlite/next';
import { drizzle } from 'drizzle-orm/expo-sqlite';
import * as schema from './schema';

// ── Open the SQLite database ────────────────────────────────
const expoDb = openDatabaseSync('curesync.db');
export const db = drizzle(expoDb, { schema });

// ── Create tables if they don't exist ───────────────────────
const INIT_SQL = `
CREATE TABLE IF NOT EXISTS medications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  dosage TEXT,
  frequency TEXT,
  inventory_count INTEGER DEFAULT 0,
  color TEXT,
  icon TEXT,
  created_at INTEGER
);

CREATE TABLE IF NOT EXISTS history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  med_id INTEGER NOT NULL REFERENCES medications(id) ON DELETE CASCADE,
  taken_at INTEGER,
  status TEXT NOT NULL CHECK(status IN ('taken', 'skipped'))
);

CREATE TABLE IF NOT EXISTS notifications (
  id TEXT PRIMARY KEY,
  med_id INTEGER NOT NULL REFERENCES medications(id) ON DELETE CASCADE,
  scheduled_time INTEGER
);
`;

// ── Database Provider ───────────────────────────────────────
type DbContextType = typeof db | null;
const DbContext = createContext<DbContextType>(null);

export function DrizzleProvider({ children }: { children: React.ReactNode }) {
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        async function init() {
            try {
                expoDb.execSync(INIT_SQL);
                setIsReady(true);
            } catch (err) {
                console.error('❌ DB Init Error:', err);
            }
        }
        init();
    }, []);

    if (!isReady) return null;

    return <DbContext.Provider value={ db }> { children } </DbContext.Provider>;
}

export function useDb() {
    const ctx = useContext(DbContext);
    if (!ctx) throw new Error('useDb must be used within DrizzleProvider');
    return ctx;
}
