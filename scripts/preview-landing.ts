// Builds the landing with the current published catalog and serves it locally.
//
//   bun run site:preview
//   bun run site:preview https://fachrihawari.github.io/YouStrict/catalog/index.json
//
// Output goes to .site-preview/ (gitignored). Stop with Ctrl+C.
import { mkdir, rm } from 'node:fs/promises';
import type { CatalogChannelFile } from '../catalog/schema';
import { isValidIndex } from '../catalog/schema';
import { SITE_URL, type CatalogData } from './landing';
import { publishSite } from './publish-site';

const catalogUrl = process.argv[2] ?? process.env.CATALOG_URL ?? `${SITE_URL}catalog/index.json`;
const outDir = `${import.meta.dir}/../.site-preview`;
const port = Number(process.env.PORT ?? 4173);

console.log(`Catalog: ${catalogUrl}`);
const catalog = await loadCatalog(catalogUrl);
console.log(`Loaded ${catalog.channels.length} channels (${catalog.channels.reduce((n, c) => n + c.videos.length, 0)} videos)`);

await rm(outDir, { recursive: true, force: true });
await mkdir(outDir, { recursive: true });
await publishSite(outDir, catalog);

const server = Bun.serve({
  port,
  async fetch(request) {
    const url = new URL(request.url);
    let pathname = decodeURIComponent(url.pathname);
    // GitHub Pages serves the project under /YouStrict; mirror that locally so
    // absolute paths (404.html, canonical links) resolve the same way.
    if (pathname === '/YouStrict') pathname = '/';
    else if (pathname.startsWith('/YouStrict/')) pathname = pathname.slice('/YouStrict'.length);
    if (pathname.includes('..')) return new Response('Bad request', { status: 400 });
    if (pathname.endsWith('/')) pathname += 'index.html';

    const file = Bun.file(`${outDir}${pathname}`);
    if (await file.exists()) return new Response(file);

    const index = Bun.file(`${outDir}${pathname}/index.html`);
    if (await index.exists()) return new Response(index);

    const notFound = Bun.file(`${outDir}/404.html`);
    if (await notFound.exists()) return new Response(notFound, { status: 404 });

    return new Response('Not found', { status: 404 });
  },
});

console.log(`\nLanding ready: http://localhost:${server.port}/YouStrict/  (also at /)\n`);

async function loadCatalog(url: string): Promise<CatalogData> {
  const indexResponse = await fetch(url);
  if (!indexResponse.ok) throw new Error(`Could not fetch ${url}: HTTP ${indexResponse.status}`);
  const index = await indexResponse.json();
  if (!isValidIndex(index)) throw new Error(`Invalid catalog index at ${url}`);

  const channels = await Promise.all(
    index.channels.map(async (channel) => {
      const fileUrl = new URL(channel.file, url);
      const response = await fetch(fileUrl);
      if (!response.ok) throw new Error(`Could not fetch ${fileUrl}: HTTP ${response.status}`);
      const file = (await response.json()) as CatalogChannelFile;
      if (!file || !Array.isArray(file.videos)) throw new Error(`Invalid channel file at ${fileUrl}`);
      return file;
    }),
  );

  return { channels, generatedAt: index.generatedAt, version: index.version };
}
