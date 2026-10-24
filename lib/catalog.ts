import Constants from 'expo-constants';
import { and, eq, inArray, notInArray, sql } from 'drizzle-orm';
import { db } from '@/db';
import { channels, videos } from '@/db/schema';
import { getSetting, setSetting } from '@/lib/settings';
import { isValidIndex, isValidVideo, type CatalogChannelFile, type CatalogIndex } from '@/catalog/schema';

const CATALOG_URL: string = Constants.expoConfig?.extra?.catalogUrl;
const FETCH_TIMEOUT_MS = 20_000;
const INSERT_CHUNK = 200;

export type SyncResult =
  | { status: 'up-to-date' }
  | { status: 'updated'; channels: number; videos: number }
  | { status: 'error'; message: string };

let inFlight: Promise<SyncResult> | null = null;

// Pulls the catalog published by .github/workflows/catalog.yml into SQLite.
// Safe to call any time: concurrent calls share one run, and errors are
// recorded in settings instead of thrown.
export function syncCatalog(): Promise<SyncResult> {
  inFlight ??= runSync().finally(() => { inFlight = null; });
  return inFlight;
}

async function runSync(): Promise<SyncResult> {
  try {
    const index = await fetchJson(CATALOG_URL);
    if (!isValidIndex(index)) throw new Error('Catalog index has an unexpected format');

    if (index.version === getSetting('catalogVersion')) {
      setSetting('lastSyncAt', new Date().toISOString());
      setSetting('lastSyncError', null);
      return { status: 'up-to-date' };
    }

    const stored = new Map(db.select({ id: channels.id, hash: channels.hash }).from(channels).all().map((c) => [c.id, c.hash]));
    const changed = index.channels.filter((c) => stored.get(c.id) !== c.hash);
    const files = await Promise.all(changed.map((c) => fetchChannelFile(c.file)));

    applyCatalog(index, files);
    const total = index.channels.reduce((n, c) => n + c.videoCount, 0);
    return { status: 'updated', channels: index.channels.length, videos: total };
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    setSetting('lastSyncError', message);
    return { status: 'error', message };
  }
}

function applyCatalog(index: CatalogIndex, files: CatalogChannelFile[]) {
  db.transaction((tx) => {
    index.channels.forEach((c, sortOrder) => {
      // New channels start disabled: a parent approves them in Parent → Channels.
      tx.insert(channels)
        .values({ id: c.id, handle: c.handle, name: c.name, videoCount: c.videoCount, hash: c.hash, sortOrder })
        .onConflictDoUpdate({
          target: channels.id,
          set: { handle: c.handle, name: c.name, videoCount: c.videoCount, hash: c.hash, sortOrder },
        })
        .run();
    });

    for (const file of files) {
      const ids = file.videos.map((v) => v.id);
      tx.delete(videos).where(and(eq(videos.channelId, file.id), notInArray(videos.id, ids))).run();
      // Upsert keeps each video's `hidden` flag across syncs.
      for (let i = 0; i < file.videos.length; i += INSERT_CHUNK) {
        const rows = file.videos.slice(i, i + INSERT_CHUNK).map((v) => ({ ...v, channelId: file.id }));
        tx.insert(videos)
          .values(rows)
          .onConflictDoUpdate({
            target: videos.id,
            set: {
              channelId: sql`excluded.channel_id`,
              title: sql`excluded.title`,
              duration: sql`excluded.duration`,
              timestamp: sql`excluded.timestamp`,
            },
          })
          .run();
      }
    }

    const keep = index.channels.map((c) => c.id);
    tx.delete(channels).where(notInArray(channels.id, keep)).run(); // videos cascade

    setSetting('catalogVersion', index.version, tx);
    setSetting('lastSyncAt', new Date().toISOString(), tx);
    setSetting('lastSyncError', null, tx);
  });
}

async function fetchChannelFile(file: string): Promise<CatalogChannelFile> {
  // RN's URL polyfill can't resolve relative URLs; files are relative to index.json.
  const base = CATALOG_URL.slice(0, CATALOG_URL.lastIndexOf('/') + 1);
  const data = await fetchJson(base + file);
  if (typeof data?.id !== 'string' || !Array.isArray(data.videos)) {
    throw new Error(`Catalog file ${file} has an unexpected format`);
  }
  const seen = new Set<string>();
  const valid = data.videos.filter((v: unknown) => {
    if (!isValidVideo(v) || seen.has(v.id)) return false;
    seen.add(v.id);
    return true;
  });
  return { ...data, videos: valid };
}

async function fetchJson(url: string) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(url, { signal: controller.signal, headers: { 'Cache-Control': 'no-cache' } });
    if (!res.ok) throw new Error(`Download failed (HTTP ${res.status})`);
    return await res.json();
  } catch (e) {
    if ((e as Error).name === 'AbortError') throw new Error('Download timed out');
    throw e;
  } finally {
    clearTimeout(timer);
  }
}

export function hasCachedCatalog() {
  return db.select({ n: sql<number>`count(*)` }).from(channels).get()!.n > 0;
}

export function setChannelEnabled(id: string, enabled: boolean) {
  db.update(channels).set({ enabled }).where(eq(channels.id, id)).run();
}

export function setVideoHidden(ids: string[], hidden: boolean) {
  db.update(videos).set({ hidden }).where(inArray(videos.id, ids)).run();
}
