import * as SQLite from 'expo-sqlite';
import { drizzle } from 'drizzle-orm/expo-sqlite';
import { schema } from './schema';

// Change listener powers hooks/use-db-query.ts (UI re-renders after a sync).
export const sqlite = SQLite.openDatabaseSync('youstrict.db', { enableChangeListener: true });
sqlite.execSync('PRAGMA foreign_keys = ON;');

export const db = drizzle(sqlite, {
  schema: schema,
});
