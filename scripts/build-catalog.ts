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
const escapeHtml = (value: string) => value.replace(/[&<>\"]/g, (char) => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;',
})[char]!);
const rows = channels.map((c) => `
      <tr><td>${escapeHtml(c.name)}</td><td>@${escapeHtml(c.handle)}</td><td>${c.videoCount}</td>
      <td><a href="catalog/${escapeHtml(c.file)}">JSON</a></td></tr>`).join('');
await Bun.write(`${values.out}/index.html`, `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>YouStrict catalog</title><style>
body{font:16px/1.5 system-ui,sans-serif;max-width:900px;margin:3rem auto;padding:0 1rem;color:#202a35;background:#f6f8fa}
h1{margin-bottom:.25rem} .muted{color:#596675} table{width:100%;border-collapse:collapse;background:white;margin-top:1.5rem}
th,td{text-align:left;padding:.7rem;border-bottom:1px solid #dce2e8} th{background:#eaf0f5}
a{color:#075fbd} code{overflow-wrap:anywhere}
</style></head><body><h1>YouStrict catalog</h1>
<p class="muted">Generated ${escapeHtml(index.generatedAt)} · version <code>${index.version.slice(0, 12)}</code></p>
<p>${channels.length} channels · ${total} videos</p>
<p><a href="catalog/index.json">Catalog index JSON</a></p>
<table><thead><tr><th>Channel</th><th>Handle</th><th>Videos</th><th>Data</th></tr></thead><tbody>${rows}
  </tbody></table><p class="muted">The TV app syncs <code>catalog/index.json</code>; this page is informational.</p>
</body></html>`);
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
      try {
        const r = await fetch(new URL(c.file, indexUrl));
        if (!r.ok) {
          console.warn(`⚠ Could not load previous @${c.handle}: HTTP ${r.status}`);
          return;
        }
        const file = (await r.json()) as CatalogChannelFile;
        if (!file || !Array.isArray(file.videos)) throw new Error('invalid channel file');
        const videos: CatalogVideo[] = file.videos.filter(isValidVideo);
        if (videos.length > 0) byHandle.set(c.handle.toLowerCase(), { ...file, videos });
        else console.warn(`⚠ Could not load previous @${c.handle}: no valid videos`);
      } catch (e) {
        console.warn(`⚠ Could not load previous @${c.handle}: ${(e as Error).message}`);
      }
    }));
  } catch (e) {
    console.warn(`⚠ Could not load previous catalog from ${indexUrl}: ${(e as Error).message}`);
  }
  return byHandle;
}
