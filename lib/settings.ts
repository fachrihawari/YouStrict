import { eq } from 'drizzle-orm';
import { db } from '@/db';
import { settings } from '@/db/schema';
import { parseFilters, type VideoFilters } from '@/helpers/filters';

export type SettingKey =
  | 'catalogVersion'
  | 'lastSyncAt'
  | 'lastSyncError'
  | 'defaultDuration'
  | 'blockedKeywords' // JSON string[]
  | 'maxDurationMinutes';

type Executor = Pick<typeof db, 'select' | 'insert' | 'delete'>;

// The expo-sqlite driver is synchronous, so these are too; that lets them
// run inside db.transaction() (which only accepts a sync callback).
export function getSetting(key: SettingKey, tx: Executor = db): string | null {
  const row = tx.select().from(settings).where(eq(settings.key, key)).get();
  return row?.value ?? null;
}

export function setSetting(key: SettingKey, value: string | null, tx: Executor = db) {
  if (value === null) {
    tx.delete(settings).where(eq(settings.key, key)).run();
    return;
  }
  tx.insert(settings).values({ key, value }).onConflictDoUpdate({ target: settings.key, set: { value } }).run();
}

export function getFilters(): VideoFilters {
  return parseFilters(getSetting('blockedKeywords'), getSetting('maxDurationMinutes'));
}

export function setFilters({ keywords, maxDurationMinutes }: VideoFilters) {
  db.transaction((tx) => {
    setSetting('blockedKeywords', keywords.length ? JSON.stringify(keywords) : null, tx);
    setSetting('maxDurationMinutes', maxDurationMinutes === null ? null : String(maxDurationMinutes), tx);
  });
}
