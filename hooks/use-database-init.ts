import { useCallback, useEffect, useState } from 'react';
import { AppState } from 'react-native';
import { useMigrations } from 'drizzle-orm/expo-sqlite/migrator';
import { db } from '@/db';
import migrations from '@/drizzle/migrations';
import { hasCachedCatalog, syncCatalog } from '@/lib/catalog';
import { getSetting } from '@/lib/settings';
import { pruneHistory } from '@/lib/history';

const RESYNC_AFTER_MS = 6 * 60 * 60 * 1000;

export type DataState =
  | { status: 'loading' }
  | { status: 'error'; message: string; retry: () => void }
  | { status: 'ready' };

// Migrations → catalog. The app renders from the local cache immediately when
// it has one and syncs in the background; only the very first launch waits.
export function useDatabaseInit(): DataState {
  const { success, error: migrationError } = useMigrations(db, migrations);
  const [state, setState] = useState<DataState>({ status: 'loading' });

  const start = useCallback(async () => {
    pruneHistory();
    if (hasCachedCatalog()) {
      setState({ status: 'ready' });
      syncCatalog();
      return;
    }
    setState({ status: 'loading' });
    const result = await syncCatalog();
    if (result.status === 'error' && !hasCachedCatalog()) {
      setState({ status: 'error', message: result.message, retry: start });
    } else {
      setState({ status: 'ready' });
    }
  }, []);

  useEffect(() => {
    if (success) start();
  }, [success, start]);

  useEffect(() => {
    if (!success) return;
    const sub = AppState.addEventListener('change', (next) => {
      if (next !== 'active') return;
      const last = Date.parse(getSetting('lastSyncAt') ?? '');
      if (!(Date.now() - last < RESYNC_AFTER_MS)) syncCatalog();
    });
    return () => sub.remove();
  }, [success]);

  if (migrationError) {
    return { status: 'error', message: `Database error: ${migrationError.message}`, retry: () => {} };
  }
  return state;
}
