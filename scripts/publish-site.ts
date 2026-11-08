// Copies site/static into the published directory and renders the HTML pages.
// Shared by scripts/build-catalog.ts (GitHub Actions) and scripts/preview-landing.ts.
import { cp, mkdir, readdir } from 'node:fs/promises';
import type { CatalogData, ScreenName, Screenshots } from './landing';
import {
  MANIFEST,
  ROBOTS,
  render404Page,
  renderCatalogIndexPage,
  renderLanding,
  renderSitemap,
} from './landing';

const SITE_STATIC = `${import.meta.dir}/../site/static`;
const SCREENS: ScreenName[] = ['timer', 'channels', 'history'];

export async function publishSite(outDir: string, catalog: CatalogData): Promise<void> {
  await mkdir(outDir, { recursive: true });
  await cp(SITE_STATIC, outDir, { recursive: true });

  const shots = await findScreenshots();
  await mkdir(`${outDir}/en`, { recursive: true });
  await mkdir(`${outDir}/catalog`, { recursive: true });

  await Promise.all([
    Bun.write(`${outDir}/index.html`, renderLanding('id', catalog, shots)),
    Bun.write(`${outDir}/en/index.html`, renderLanding('en', catalog, shots)),
    Bun.write(`${outDir}/404.html`, render404Page()),
    Bun.write(`${outDir}/sitemap.xml`, renderSitemap()),
    Bun.write(`${outDir}/site.webmanifest`, MANIFEST),
    Bun.write(`${outDir}/robots.txt`, ROBOTS),
    Bun.write(`${outDir}/catalog/index.html`, renderCatalogIndexPage(catalog)),
    // Uploaded artifacts skip Jekyll anyway; keeping this makes local serving predictable.
    Bun.write(`${outDir}/.nojekyll`, ''),
  ]);
}

/**
 * Real screenshots win when present. Drop files into site/static/assets/shots/
 * named timer.*, channels.*, history.* (png, webp or jpg) and rebuild.
 */
export async function findScreenshots(): Promise<Screenshots> {
  let files: string[] = [];
  try {
    files = await readdir(`${SITE_STATIC}/assets/shots`);
  } catch {
    files = [];
  }

  const shots: Screenshots = { timer: null, channels: null, history: null };
  for (const name of SCREENS) {
    const file = files.find((entry) => entry.startsWith(`${name}.`) && /\.(png|webp|jpe?g)$/i.test(entry));
    if (file) shots[name] = `assets/shots/${file}`;
  }
  return shots;
}
