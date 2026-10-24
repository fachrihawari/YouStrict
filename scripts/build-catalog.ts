// Builds the published catalog from catalog/channels.json.
//
//   bun scripts/build-catalog.ts [--out dist] [--previous <url-of-index.json>]
//
// Output: <out>/catalog/index.json + <out>/catalog/channels/<channelId>.json
// Runs daily in .github/workflows/catalog.yml; never needs to be run by hand.
import { mkdir } from 'node:fs/promises';
import { parseArgs } from 'node:util';
import type { CatalogChannel, CatalogChannelFile, CatalogIndex, CatalogVideo, ChannelConfig } from '../catalog/schema';
import { HANDLE_PATTERN, isValidIndex, isValidVideo } from '../catalog/schema';
import { fetchChannel, withRetry } from './yt';

const DEFAULT_LIMIT = 200;
const CONCURRENCY = 4;

const { values } = parseArgs({
  args: Bun.argv.slice(2),
  options: {
    out: { type: 'string', default: 'dist' },
    previous: { type: 'string', default: process.env.CATALOG_URL },
  },
});

const configs: ChannelConfig[] = await Bun.file(`${import.meta.dir}/../catalog/channels.json`).json();
for (const c of configs) {
  if (!HANDLE_PATTERN.test(c.handle)) throw new Error(`Invalid handle in channels.json: ${c.handle}`);
}

const previous = values.previous ? await loadPrevious(values.previous) : new Map<string, CatalogChannelFile>();
console.log(`Previous catalog: ${previous.size} channels`);

const results: (CatalogChannelFile | null)[] = new Array(configs.length).fill(null);
let next = 0;
let failures = 0;

async function worker() {
  while (next < configs.length) {
    const i = next++;
    const { handle, limit = DEFAULT_LIMIT } = configs[i];
    const prev = previous.get(handle.toLowerCase());
    try {
      const fetched = await withRetry(() => fetchChannel(handle, limit));
      if (fetched.videos.length === 0) throw new Error('no playable videos');

      // Approximate dates are derived from "N weeks ago" and drift between runs;
      // keep the first-seen timestamp so unchanged videos keep the same hash.
      const knownTimestamps = new Map(prev?.videos.map((v) => [v.id, v.timestamp]));
      const videos = fetched.videos
        .map((v) => ({ ...v, timestamp: knownTimestamps.get(v.id) ?? v.timestamp }))
        .sort((a, b) => b.timestamp - a.timestamp);

      results[i] = { id: fetched.id, handle, name: fetched.name, videos };
      console.log(`✓ @${handle}: ${videos.length} videos (${fetched.dropped} dropped)`);
    } catch (e) {
      failures++;
      if (prev) {
        results[i] = prev;
        console.warn(`⚠ @${handle}: ${(e as Error).message} — keeping previous ${prev.videos.length} videos`);
      } else {
        console.warn(`⚠ @${handle}: ${(e as Error).message} — skipped (no previous data)`);
      }
    }
  }
}

await Promise.all(Array.from({ length: CONCURRENCY }, worker));

const files = results.filter((r): r is CatalogChannelFile => r !== null);
if (files.length === 0) {
  console.error('❌ No channels produced any videos; refusing to publish an empty catalog.');
  process.exit(1);
}

const outDir = `${values.out}/catalog`;
await mkdir(`${outDir}/channels`, { recursive: true });

const channels: CatalogChannel[] = [];
for (const file of files) {
  const body = JSON.stringify(file);
  const path = `channels/${file.id}.json`;
  await Bun.write(`${outDir}/${path}`, body);
  channels.push({
    id: file.id,
    handle: file.handle,
    name: file.name,
    videoCount: file.videos.length,
    hash: sha256(body),
    file: path,
  });
}

const index: CatalogIndex = {
  schema: 1,
  version: sha256(channels.map((c) => c.hash).join('\n')),
  generatedAt: new Date().toISOString(),
  channels,
};
await Bun.write(`${outDir}/index.json`, JSON.stringify(index, null, 2));

const total = channels.reduce((n, c) => n + c.videoCount, 0);
console.log(`\n✅ ${channels.length} channels, ${total} videos, version ${index.version.slice(0, 12)} (${failures} failures)`);

function sha256(input: string) {
  return new Bun.CryptoHasher('sha256').update(input).digest('hex');
}

async function loadPrevious(indexUrl: string) {
  const byHandle = new Map<string, CatalogChannelFile>();
  try {
    const res = await fetch(indexUrl);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const index = await res.json();
    if (!isValidIndex(index)) throw new Error('invalid index');

    await Promise.all(index.channels.map(async (c) => {
      const r = await fetch(new URL(c.file, indexUrl));
      if (!r.ok) return;
      const file = (await r.json()) as CatalogChannelFile;
      const videos: CatalogVideo[] = (file.videos ?? []).filter(isValidVideo);
      if (videos.length > 0) byHandle.set(c.handle.toLowerCase(), { ...file, videos });
    }));
  } catch (e) {
    console.warn(`⚠ Could not load previous catalog from ${indexUrl}: ${(e as Error).message}`);
  }
  return byHandle;
}
