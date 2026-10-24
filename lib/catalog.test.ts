import { afterEach, beforeEach, describe, expect, test } from 'bun:test';
import { eq } from 'drizzle-orm';
import { CATALOG_URL, db, resetDb } from '@/test/setup';
import { channels, videos } from '@/db/schema';
import { getSetting } from '@/lib/settings';
import { setChannelEnabled, setVideoHidden, syncCatalog } from '@/lib/catalog';
import type { CatalogChannelFile, CatalogIndex, CatalogVideo } from '@/catalog/schema';

const BASE = CATALOG_URL.slice(0, CATALOG_URL.lastIndexOf('/') + 1);
const realFetch = globalThis.fetch;

function video(n: number, overrides: Partial<CatalogVideo> = {}): CatalogVideo {
  return { id: `vid${String(n).padStart(8, '0')}`, title: `Video ${n}`, duration: 300, timestamp: 1_700_000_000 + n, ...overrides };
}

// Serves an index plus one file per channel; the hash is derived from the
// video ids so changing a channel's videos changes its hash.
function serveCatalog(version: string, files: CatalogChannelFile[]) {
  const index: CatalogIndex = {
    schema: 1,
    version,
    generatedAt: new Date().toISOString(),
    channels: files.map((f) => ({
      id: f.id,
      handle: f.handle,
      name: f.name,
      videoCount: f.videos.length,
      hash: f.videos.map((v) => v.id + v.title).join(','),
      file: `channels/${f.id}.json`,
    })),
  };
  const routes = new Map<string, unknown>([[CATALOG_URL, index]]);
  for (const f of files) routes.set(`${BASE}channels/${f.id}.json`, f);

  const requested: string[] = [];
  globalThis.fetch = (async (url: string) => {
    requested.push(url);
    const body = routes.get(url);
    return body === undefined ? new Response('missing', { status: 404 }) : Response.json(body);
  }) as typeof fetch;
  return requested;
}

const channelA = (vids: CatalogVideo[]): CatalogChannelFile => ({ id: 'UC_A', handle: 'a', name: 'Channel A', videos: vids });
const channelB = (vids: CatalogVideo[]): CatalogChannelFile => ({ id: 'UC_B', handle: 'b', name: 'Channel B', videos: vids });

beforeEach(resetDb);
afterEach(() => { globalThis.fetch = realFetch; });

describe('syncCatalog', () => {
  test('imports channels turned off, with their videos', async () => {
    serveCatalog('v1', [channelA([video(1), video(2)]), channelB([video(3)])]);

    expect(await syncCatalog()).toEqual({ status: 'updated', channels: 2, videos: 3 });

    const rows = db.select().from(channels).all();
    expect(rows.map((c) => [c.id, c.enabled, c.sortOrder])).toEqual([['UC_A', false, 0], ['UC_B', false, 1]]);
    expect(db.select().from(videos).all()).toHaveLength(3);
    expect(getSetting('catalogVersion')).toBe('v1');
    expect(getSetting('lastSyncError')).toBeNull();
  });

  test('keeps parent choices (enabled channel, hidden video) across syncs', async () => {
    serveCatalog('v1', [channelA([video(1), video(2)])]);
    await syncCatalog();
    setChannelEnabled('UC_A', true);
    setVideoHidden([video(1).id], true);

    serveCatalog('v2', [channelA([video(1, { title: 'Renamed' }), video(2), video(4)])]);
    await syncCatalog();

    expect(db.select().from(channels).where(eq(channels.id, 'UC_A')).get()?.enabled).toBe(true);
    const first = db.select().from(videos).where(eq(videos.id, video(1).id)).get();
    expect(first?.hidden).toBe(true);
    expect(first?.title).toBe('Renamed');
    expect(db.select().from(videos).all()).toHaveLength(3);
  });

  test('removes videos and channels that left the catalog', async () => {
    serveCatalog('v1', [channelA([video(1), video(2)]), channelB([video(3)])]);
    await syncCatalog();

    serveCatalog('v2', [channelA([video(2)])]);
    await syncCatalog();

    expect(db.select().from(channels).all().map((c) => c.id)).toEqual(['UC_A']);
    expect(db.select().from(videos).all().map((v) => v.id)).toEqual([video(2).id]); // UC_B's videos cascade
  });

  test('downloads only channels whose hash changed', async () => {
    serveCatalog('v1', [channelA([video(1)]), channelB([video(2)])]);
    await syncCatalog();

    const requested = serveCatalog('v2', [channelA([video(1)]), channelB([video(2), video(3)])]);
    await syncCatalog();

    expect(requested).toEqual([CATALOG_URL, `${BASE}channels/UC_B.json`]);
  });

  test('same version is a no-op', async () => {
    serveCatalog('v1', [channelA([video(1)])]);
    await syncCatalog();
    const requested = serveCatalog('v1', [channelA([video(1)])]);

    expect(await syncCatalog()).toEqual({ status: 'up-to-date' });
    expect(requested).toEqual([CATALOG_URL]);
  });

  test('drops invalid and duplicate videos from channel files', async () => {
    serveCatalog('v1', [channelA([video(1), video(1), video(2, { id: 'bad' }), video(3, { duration: 0 })])]);
    await syncCatalog();

    expect(db.select().from(videos).all().map((v) => v.id)).toEqual([video(1).id]);
  });

  test('records errors and keeps the cached catalog', async () => {
    serveCatalog('v1', [channelA([video(1)])]);
    await syncCatalog();

    globalThis.fetch = (async () => new Response('down', { status: 503 })) as unknown as typeof fetch;
    expect(await syncCatalog()).toEqual({ status: 'error', message: 'Download failed (HTTP 503)' });
    expect(getSetting('lastSyncError')).toBe('Download failed (HTTP 503)');
    expect(getSetting('catalogVersion')).toBe('v1');
    expect(db.select().from(videos).all()).toHaveLength(1);
  });

  test('rejects a malformed index without touching the cache', async () => {
    globalThis.fetch = (async () => Response.json({ schema: 2 })) as unknown as typeof fetch;
    expect(await syncCatalog()).toEqual({ status: 'error', message: 'Catalog index has an unexpected format' });
    expect(db.select().from(channels).all()).toHaveLength(0);
  });
});
