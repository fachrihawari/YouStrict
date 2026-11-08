import { describe, expect, test } from 'bun:test';
import idContent from '../site/content/id';
import enContent from '../site/content/en';
import type { CatalogData, Screenshots } from './landing';
import {
  SITE_URL,
  escapeHtml,
  formatDuration,
  heroVideos,
  render404Page,
  renderCatalogIndexPage,
  renderLanding,
  renderSitemap,
  totalVideos,
} from './landing';

const catalog: CatalogData = {
  generatedAt: '2026-11-08T11:14:19.576Z',
  version: '56c2822ce0b7aabbccddeeff0011223344556677',
  channels: [
    {
      id: 'UC_a',
      handle: 'ChannelA',
      name: 'Channel A',
      videos: [
        { id: 'aaaaaaaaaaa', title: 'Video A1', duration: 754, timestamp: 1 },
        { id: 'aaaaaaaaaab', title: 'Video A2', duration: 61, timestamp: 1 },
      ],
    },
    {
      id: 'UC_b',
      handle: 'ChannelB',
      name: '<script>alert(1)</script> & friends',
      videos: [{ id: 'bbbbbbbbbbb', title: 'Video B1', duration: 3725, timestamp: 1 }],
    },
  ],
};

const noShots: Screenshots = { timer: null, channels: null, history: null };
const staticDir = `${import.meta.dir}/../site/static`;

function keyShape(value: unknown): unknown {
  if (Array.isArray(value)) return [`array:${value.length}`, ...value.map(keyShape)];
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.keys(value as Record<string, unknown>)
        .sort()
        .map((key) => [key, keyShape((value as Record<string, unknown>)[key])]),
    );
  }
  return typeof value;
}

describe('landing content', () => {
  test('id and en have the same shape', () => {
    expect(keyShape(enContent)).toEqual(keyShape(idContent));
  });

  test('has enough features, steps and FAQ answers', () => {
    expect(idContent.features.items.length).toBeGreaterThanOrEqual(6);
    expect(idContent.steps.items).toHaveLength(4);
    expect(idContent.faq.items.length).toBeGreaterThanOrEqual(6);
    expect(enContent.faq.items).toHaveLength(idContent.faq.items.length);
  });
});

describe('renderLanding', () => {
  const html = renderLanding('id', catalog, noShots);
  const en = renderLanding('en', catalog, noShots);

  test('does not leave template placeholders behind', () => {
    expect(html).not.toContain('{{');
    expect(en).not.toContain('{{');
  });

  test('escapes catalog names before printing them', () => {
    expect(html).not.toContain('<script>alert(1)</script>');
    expect(html).toContain('&lt;script&gt;alert(1)&lt;/script&gt; &amp; friends');
  });

  test('uses relative asset paths plus absolute canonical and og URLs', () => {
    expect(html).toContain('href="./styles.css"');
    expect(en).toContain('href="../styles.css"');
    expect(html).toContain(`<link rel="canonical" href="${SITE_URL}">`);
    expect(en).toContain(`<link rel="canonical" href="${SITE_URL}en/">`);
    expect(html).toContain(`content="${SITE_URL}assets/og-id.png"`);
    expect(en).toContain(`content="${SITE_URL}assets/og-en.png"`);
  });

  test('links the language switch in both directions', () => {
    expect(html).toContain('href="./en/" hreflang="en"');
    expect(en).toContain('href="../" hreflang="id"');
  });

  test('prints catalog stats and human dates', () => {
    expect(html).toContain('<strong>2</strong><span>channel</span>');
    expect(html).toContain('<strong>3</strong><span>video</span>');
    expect(html).toContain('2026');
    expect(html).toContain('WIB');
  });

  test('renders one thumbnail per channel in the hero', () => {
    // Two channels: one thumbnail each, then the spare video tops up the grid.
    expect(heroVideos(catalog)).toHaveLength(3);
    expect(heroVideos(catalog, 1)).toHaveLength(1);
    expect(html).toContain('https://i.ytimg.com/vi/aaaaaaaaaaa/mqdefault.jpg');
    expect(html).toContain('bbbbbbbbbbb');
  });

  test('adds screenshot paths relative to each page when provided', () => {
    const shots: Screenshots = {
      timer: 'assets/shots/timer.png',
      channels: null,
      history: null,
    };
    expect(renderLanding('id', catalog, shots)).toContain('src="./assets/shots/timer.png"');
    expect(renderLanding('en', catalog, shots)).toContain('src="../assets/shots/timer.png"');
  });

  test('only references assets that exist in site/static', async () => {
    const referenced = new Set<string>();
    for (const document of [html, en]) {
      for (const match of document.matchAll(/(?:src|href)="(?:\.\/|\.\.\/)?(assets\/[^"#?]+)"/g)) {
        referenced.add(match[1]!);
      }
    }

    expect(referenced.size).toBeGreaterThan(3);
    for (const asset of referenced) {
      if (asset.startsWith('assets/shots/')) continue;
      expect(await Bun.file(`${staticDir}/${asset}`).exists()).toBe(true);
    }
  });

  test('includes structured data for the app and the FAQ', () => {
    expect(html).toContain('"@type":"SoftwareApplication"');
    expect(html).toContain('"@type":"FAQPage"');
    expect(html).not.toContain('</script><script');
  });
});

describe('helpers', () => {
  test('formatDuration', () => {
    expect(formatDuration(61)).toBe('1:01');
    expect(formatDuration(754)).toBe('12:34');
    expect(formatDuration(3725)).toBe('1:02:05');
  });

  test('totalVideos', () => {
    expect(totalVideos(catalog)).toBe(3);
  });

  test('escapeHtml', () => {
    expect(escapeHtml(`<a href="x">'&'</a>`)).toBe(
      '&lt;a href=&quot;x&quot;&gt;&#39;&amp;&#39;&lt;/a&gt;',
    );
  });
});

describe('secondary pages', () => {
  test('catalog index escapes names and links the JSON files', () => {
    const page = renderCatalogIndexPage(catalog);
    expect(page).not.toContain('<script>alert(1)</script>');
    expect(page).toContain('channels/UC_a.json');
    expect(page).toContain('noindex');
  });

  test('404 page links back with absolute project paths', () => {
    const page = render404Page();
    expect(page).toContain('href="/YouStrict/"');
    expect(page).toContain('href="/YouStrict/en/"');
    expect(page).toContain('noindex');
  });

  test('sitemap lists both languages with alternates', () => {
    const xml = renderSitemap();
    expect(xml).toContain(`<loc>${SITE_URL}</loc>`);
    expect(xml).toContain(`<loc>${SITE_URL}en/</loc>`);
    expect(xml).toContain('hreflang="x-default"');
  });
});
