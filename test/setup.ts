// Preloaded by `bun test` (see bunfig.toml). Swaps the Expo native modules for
// in-process stand-ins so app logic runs under Bun:
//   @/db              → in-memory bun:sqlite, migrated from ./drizzle like the app
//   expo-sqlite       → no-op change listener
//   expo-secure-store → a Map
//   expo-crypto       → node:crypto
//   expo-constants    → a fixed catalog URL
import { mock } from 'bun:test';
import { Database } from 'bun:sqlite';
import { createHash, randomUUID } from 'node:crypto';
import { drizzle } from 'drizzle-orm/bun-sqlite';
import { migrate } from 'drizzle-orm/bun-sqlite/migrator';
import { schema } from '@/db/schema';

export const sqlite = new Database(':memory:');
sqlite.exec('PRAGMA foreign_keys = ON;');
export const db = drizzle(sqlite, { schema });
migrate(db, { migrationsFolder: 'drizzle' });

mock.module('@/db', () => ({ db, sqlite }));
// hooks/use-db-query.ts subscribes to changes; nothing to watch in tests.
mock.module('expo-sqlite', () => ({ addDatabaseChangeListener: () => ({ remove() {} }) }));

export const secureStore = new Map<string, string>();
mock.module('expo-secure-store', () => ({
  getItemAsync: async (key: string) => secureStore.get(key) ?? null,
  setItemAsync: async (key: string, value: string) => void secureStore.set(key, value),
  deleteItemAsync: async (key: string) => void secureStore.delete(key),
}));

mock.module('expo-crypto', () => ({
  CryptoDigestAlgorithm: { SHA256: 'SHA-256' },
  digestStringAsync: async (_algorithm: string, data: string) => createHash('sha256').update(data).digest('hex'),
  randomUUID,
}));

export const CATALOG_URL = 'https://example.test/catalog/index.json';
mock.module('expo-constants', () => ({ default: { expoConfig: { extra: { catalogUrl: CATALOG_URL } } } }));

// Empties every table, children first. Call in beforeEach of DB tests.
export function resetDb() {
  sqlite.exec('DELETE FROM videos; DELETE FROM channels; DELETE FROM settings;');
}
