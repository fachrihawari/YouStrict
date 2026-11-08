// Renders the static landing pages served from GitHub Pages.
//
//   /            Indonesian landing
//   /en/         English landing
//   /404.html    bilingual not-found page
//   /catalog/    human-readable catalog index (the app only needs index.json)
//
// Everything is rendered at build time, so the pages work without JavaScript and
// the catalog numbers come from the same run that publishes catalog/index.json.
// Keep this module free of side effects: scripts/landing.test.ts imports it.
import type { CatalogChannelFile } from '../catalog/schema';
import type { IconName, LandingContent } from '../site/content/types';
import idContent from '../site/content/id';
import enContent from '../site/content/en';

export type Lang = 'id' | 'en';

export type CatalogData = {
  channels: CatalogChannelFile[];
  generatedAt: string;
  version: string;
};

export type ScreenName = 'timer' | 'channels' | 'history';
/** Paths relative to the site root (assets/shots/timer.png), or null for the CSS mock. */
export type Screenshots = Record<ScreenName, string | null>;

export const SITE_ORIGIN = 'https://fachrihawari.github.io';
export const SITE_BASE = '/YouStrict';
export const SITE_URL = `${SITE_ORIGIN}${SITE_BASE}/`;
export const REPO_URL = 'https://github.com/fachrihawari/YouStrict';
export const RELEASES_URL = `${REPO_URL}/releases/latest`;
export const README_URL = `${REPO_URL}#development`;

const CONTENT: Record<Lang, LandingContent> = { id: idContent, en: enContent };
const LOCALE: Record<Lang, string> = { id: 'id-ID', en: 'en-GB' };

const ESCAPES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
};

export function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (char) => ESCAPES[char]!);
}

const ICONS: Record<IconName, string> = {
  shield: '<path d="M12 3 5 6v5c0 4.6 3 7.7 7 9 4-1.3 7-4.4 7-9V6l-7-3Z"/><path d="m9 11.5 2.2 2.2 4.3-4.4"/>',
  'search-off': '<circle cx="11" cy="11" r="6.5"/><path d="m16.2 16.2 4.3 4.3"/><path d="M4 4l16 16"/>',
  clock: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>',
  lock: '<rect x="5" y="10" width="14" height="10" rx="2.5"/><path d="M8.5 10V7.5a3.5 3.5 0 0 1 7 0V10"/><circle cx="12" cy="15" r="1"/>',
  filter: '<path d="M4 5h16l-6.2 7.2V18l-3.6 2v-7.8L4 5Z"/>',
  history: '<path d="M4 12a8 8 0 1 0 2.4-5.7"/><path d="M4 4.5V9h4.5"/><path d="M12 8v4.2l2.8 1.8"/>',
  refresh: '<path d="M20 11a8 8 0 0 0-13.7-5.4L4 8"/><path d="M4 4v4h4"/><path d="M4 13a8 8 0 0 0 13.7 5.4L20 16"/><path d="M20 20v-4h-4"/>',
  remote: '<rect x="7" y="2.5" width="10" height="19" rx="3"/><circle cx="12" cy="7" r="1.6"/><path d="M12 12v3"/><path d="M9.5 18.5h5"/>',
  check: '<path d="m5 12.5 4.5 4.5L19 6.5"/>',
  cross: '<path d="M6 6l12 12M18 6 6 18"/>',
  play: '<path d="M9 6.5v11l9-5.5-9-5.5Z"/>',
  download: '<path d="M12 3v11"/><path d="m7.5 10 4.5 4.5L16.5 10"/><path d="M4.5 19.5h15"/>',
  github: '',
  arrow: '<path d="M5 12h13"/><path d="m13 7 5 5-5 5"/>',
  chevron: '<path d="m6 9 6 6 6-6"/>',
  menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
  close: '<path d="M6 6l12 12M18 6 6 18"/>',
  pin: '<circle cx="6" cy="12" r="1.4"/><circle cx="10" cy="12" r="1.4"/><circle cx="14" cy="12" r="1.4"/><circle cx="18" cy="12" r="1.4"/>',
  spark: '<path d="M12 3.5 13.7 9l5.5 1.7-5.5 1.7L12 18l-1.7-5.6L4.8 10.7 10.3 9 12 3.5Z"/>',
};

const GITHUB_PATH =
  'M12 .5C5.73.5.5 5.73.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.56v-2.17c-3.2.7-3.88-1.54-3.88-1.54-.53-1.34-1.29-1.7-1.29-1.7-1.05-.72.08-.71.08-.71 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.55-.29-5.23-1.28-5.23-5.7 0-1.26.45-2.29 1.19-3.1-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11.1 11.1 0 0 1 5.8 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.12 3.05.74.81 1.18 1.84 1.18 3.1 0 4.43-2.69 5.41-5.25 5.69.41.36.78 1.06.78 2.14v3.17c0 .31.2.68.8.56A11.5 11.5 0 0 0 23.5 12C23.5 5.73 18.27.5 12 .5Z';

function icon(name: IconName, className = 'icon'): string {
  if (name === 'github') {
    return `<svg class="${className}" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="${GITHUB_PATH}"/></svg>`;
  }
  return `<svg class="${className}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[name]}</svg>`;
}

export function formatNumber(value: number, lang: Lang): string {
  return new Intl.NumberFormat(LOCALE[lang]).format(value);
}

export function formatDuration(seconds: number): string {
  const total = Math.max(0, Math.round(seconds));
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const secs = total % 60;
  return hours > 0
    ? `${hours}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
    : `${minutes}:${String(secs).padStart(2, '0')}`;
}

function formatDate(iso: string, lang: Lang, withTime: boolean): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  const day = new Intl.DateTimeFormat(LOCALE[lang], {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'Asia/Jakarta',
  }).format(date);
  if (!withTime) return day;
  const time = new Intl.DateTimeFormat(LOCALE[lang], {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: 'Asia/Jakarta',
  }).format(date);
  return `${day}, ${time} WIB`;
}

function thumbnailUrl(videoId: string): string {
  return `https://i.ytimg.com/vi/${videoId}/mqdefault.jpg`;
}

export function totalVideos(catalog: CatalogData): number {
  return catalog.channels.reduce((sum, channel) => sum + channel.videos.length, 0);
}

/** One recent video per channel, so the hero collage shows every approved channel. */
export function heroVideos(catalog: CatalogData, limit = 8) {
  const picks: { id: string; title: string; duration: number; channel: string }[] = [];
  for (const channel of catalog.channels) {
    const video = channel.videos[0];
    if (video) picks.push({ ...video, channel: channel.name });
    if (picks.length === limit) return picks;
  }
  // Fewer channels than slots: top up with the second video of each channel.
  for (const channel of catalog.channels) {
    for (const video of channel.videos.slice(1)) {
      picks.push({ ...video, channel: channel.name });
      if (picks.length === limit) return picks;
    }
  }
  return picks;
}

function renderHeader(c: LandingContent, lang: Lang, base: string): string {
  const switchHref = lang === 'id' ? `${base}en/` : base;
  const switchLang = lang === 'id' ? 'en' : 'id';
  return `<header class="site-header" data-header>
  <div class="wrap header-inner">
    <a class="brand" href="${base}" aria-label="YouStrict">
      <img class="brand-mark" src="${base}assets/logo.svg" alt="" width="34" height="38" decoding="async">
      <span class="brand-name">YouStrict</span>
    </a>
    <nav class="site-nav" id="site-nav" aria-label="${escapeHtml(c.nav.label)}">
      <a href="#features">${escapeHtml(c.nav.features)}</a>
      <a href="#how">${escapeHtml(c.nav.how)}</a>
      <a href="#catalog">${escapeHtml(c.nav.catalog)}</a>
      <a href="#install">${escapeHtml(c.nav.install)}</a>
      <a href="#faq">${escapeHtml(c.nav.faq)}</a>
      <a class="nav-source" href="${REPO_URL}" target="_blank" rel="noreferrer">${icon('github')}<span>${escapeHtml(c.nav.source)}</span></a>
    </nav>
    <div class="header-actions">
      <a class="lang-switch" href="${switchHref}" hreflang="${switchLang}" lang="${switchLang}" title="${escapeHtml(c.switchName)}">${escapeHtml(c.switchLabel)}</a>
      <a class="btn btn-primary btn-sm header-cta" href="${RELEASES_URL}">${icon('download')}<span>${escapeHtml(c.nav.download)}</span></a>
      <button class="menu-btn" type="button" data-menu aria-expanded="false" aria-controls="site-nav" aria-label="${escapeHtml(c.nav.menu)}" data-label-open="${escapeHtml(c.nav.menu)}" data-label-close="${escapeHtml(c.nav.close)}">${icon('menu', 'icon icon-menu')}${icon('close', 'icon icon-close')}</button>
    </div>
  </div>
</header>`;
}

function renderHero(c: LandingContent, lang: Lang, catalog: CatalogData): string {
  const channels = catalog.channels.length;
  const videos = totalVideos(catalog);
  const date = formatDate(catalog.generatedAt, lang, false);
  const thumbs = heroVideos(catalog, 8)
    .map(
      (video) => `<figure class="thumb">
          <img src="${escapeHtml(thumbnailUrl(video.id))}" alt="" width="320" height="180" loading="eager" decoding="async" referrerpolicy="no-referrer">
          <figcaption>${formatDuration(video.duration)}</figcaption>
        </figure>`,
    )
    .join('');
  const pills = [c.hero.tv.all, ...catalog.channels.slice(0, 3).map((channel) => channel.name)]
    .map(
      (name, index) =>
        `<span class="tv-chip${index === 0 ? ' is-active' : ''}">${escapeHtml(name)}</span>`,
    )
    .join('');

  return `<section class="hero">
  <div class="hero-glow" aria-hidden="true"></div>
  <div class="wrap hero-grid">
    <div class="hero-copy" data-reveal>
      <p class="eyebrow"><span class="eyebrow-dot" aria-hidden="true"></span>${escapeHtml(c.hero.eyebrow)}</p>
      <h1 class="hero-title">${c.hero.titleHtml}</h1>
      <p class="lead">${escapeHtml(c.hero.lead)}</p>
      <div class="cta-row">
        <a class="btn btn-primary btn-lg" href="${RELEASES_URL}">${icon('download')}<span>${escapeHtml(c.hero.ctaPrimary)}</span></a>
        <a class="btn btn-ghost btn-lg" href="${REPO_URL}" target="_blank" rel="noreferrer">${icon('github')}<span>${escapeHtml(c.hero.ctaSecondary)}</span></a>
      </div>
      <p class="micro">${escapeHtml(c.hero.note)}</p>
      <ul class="hero-stats">
        <li><strong>${formatNumber(channels, lang)}</strong><span>${escapeHtml(c.hero.stats.channels)}</span></li>
        <li><strong>${formatNumber(videos, lang)}</strong><span>${escapeHtml(c.hero.stats.videos)}</span></li>
        <li class="hero-updated"><span class="pulse" aria-hidden="true"></span><span>${escapeHtml(c.hero.stats.updated)} ${escapeHtml(date)}</span></li>
      </ul>
    </div>
    <div class="hero-art" data-reveal>
      <div class="tv-wrap" aria-hidden="true">
        <div class="tv">
          <div class="tv-bar">
            <span class="tv-live">${escapeHtml(c.hero.tv.label)}</span>
            <div class="tv-chips">${pills}</div>
          </div>
          <div class="tv-grid">${thumbs}</div>
          <div class="tv-foot">
            <div class="tv-timer"><span>${escapeHtml(c.hero.tv.timerLabel)}</span><strong>${escapeHtml(c.hero.tv.timer)}</strong></div>
            <div class="tv-progress"><i style="width:38%"></i></div>
          </div>
        </div>
        <div class="lock-card">
          <span class="lock-badge">${icon('lock')}</span>
          <p class="lock-kicker">${escapeHtml(c.hero.tv.lockKicker)}</p>
          <strong>${escapeHtml(c.hero.tv.lockTitle)}</strong>
          <p>${escapeHtml(c.hero.tv.lockBody)}</p>
          <div class="pin-dots" aria-hidden="true"><i></i><i></i><i></i><i></i></div>
        </div>
      </div>
    </div>
  </div>
</section>`;
}

function renderCompare(c: LandingContent): string {
  const list = (items: string[], iconName: IconName) =>
    items.map((item) => `<li>${icon(iconName, 'icon icon-sm')}<span>${escapeHtml(item)}</span></li>`).join('');
  return `<section class="section compare" id="why">
  <div class="wrap">
    <header class="section-head" data-reveal>
      <p class="eyebrow">${escapeHtml(c.compare.eyebrow)}</p>
      <h2>${escapeHtml(c.compare.title)}</h2>
      <p class="section-lead">${escapeHtml(c.compare.lead)}</p>
    </header>
    <div class="compare-grid">
      <article class="compare-card is-bad" data-reveal>
        <h3>${icon('cross')}<span>${escapeHtml(c.compare.badTitle)}</span></h3>
        <ul>${list(c.compare.badItems, 'cross')}</ul>
      </article>
      <article class="compare-card is-good" data-reveal>
        <h3>${icon('check')}<span>${escapeHtml(c.compare.goodTitle)}</span></h3>
        <ul>${list(c.compare.goodItems, 'check')}</ul>
      </article>
    </div>
    <p class="compare-note" data-reveal>${escapeHtml(c.compare.footnote)}</p>
  </div>
</section>`;
}

function renderFeatures(c: LandingContent): string {
  const cards = c.features.items
    .map(
      (feature) => `<article class="feature-card" data-reveal>
        <span class="feature-icon">${icon(feature.icon)}</span>
        <h3>${escapeHtml(feature.title)}</h3>
        <p>${escapeHtml(feature.body)}</p>
      </article>`,
    )
    .join('');
  return `<section class="section features" id="features">
  <div class="wrap">
    <header class="section-head" data-reveal>
      <p class="eyebrow">${escapeHtml(c.features.eyebrow)}</p>
      <h2>${escapeHtml(c.features.title)}</h2>
      <p class="section-lead">${escapeHtml(c.features.lead)}</p>
    </header>
    <div class="feature-grid">${cards}</div>
  </div>
</section>`;
}

function renderWatchMock(c: LandingContent): string {
  const mock = c.parents.mock;
  return `<div class="mock mock-watch">
      <div class="mock-head"><b>${escapeHtml(mock.watchTitle)}</b><span>${escapeHtml(mock.watchSubtitle)}</span></div>
      <div class="mock-chips"><i>15</i><i class="is-on">30</i><i>60</i></div>
      <p class="mock-big">30 <small>min</small></p>
      <p class="mock-note">${escapeHtml(mock.watchEnds)}</p>
      <div class="mock-toggle"><i class="switch is-on"></i><span>${escapeHtml(mock.watchFinish)}</span></div>
      <div class="mock-start">${icon('play', 'icon icon-xs')}<span>${escapeHtml(mock.watchStart)}</span></div>
    </div>`;
}

function renderChannelsMock(c: LandingContent, catalog: CatalogData): string {
  const mock = c.parents.mock;
  const channels = catalog.channels.slice(0, 12);
  const rows = channels
    .map(
      (channel, index) => `<li><span class="mock-name">${escapeHtml(channel.name)}</span><i class="switch${index < 3 ? ' is-on' : ''}"></i></li>`,
    )
    .join('');
  const subtitle = mock.channelsSubtitle
    .replace('{on}', String(Math.min(3, channels.length)))
    .replace('{total}', String(catalog.channels.length));
  return `<div class="mock mock-channels">
      <div class="mock-head"><b>${escapeHtml(mock.channelsTitle)}</b><span>${escapeHtml(subtitle)}</span></div>
      <ul class="mock-list">${rows}</ul>
    </div>`;
}

function renderHistoryMock(c: LandingContent, catalog: CatalogData): string {
  const mock = c.parents.mock;
  const videos = catalog.channels
    .flatMap((channel) => {
      const video = channel.videos[0];
      return video ? [{ ...video, channel: channel.name }] : [];
    })
    .slice(0, 8);
  const row = (video: (typeof videos)[number], index: number) => `<li>
        <i class="mock-thumb tone-${(index % 3) + 1}"></i>
        <span class="mock-name">${escapeHtml(video.title)}</span>
        <small>${formatDuration(video.duration)}</small>
      </li>`;
  return `<div class="mock mock-history">
      <div class="mock-head"><b>${escapeHtml(mock.historyTitle)}</b><span>${escapeHtml(mock.historyTotal)}</span></div>
      <p class="mock-day">${escapeHtml(mock.historyDay)}</p>
      <ul class="mock-list">${videos.slice(0, 4).map(row).join('')}</ul>
      <p class="mock-day">${escapeHtml(mock.historyYesterday)}</p>
      <ul class="mock-list">${videos.slice(4, 8).map(row).join('')}</ul>
    </div>`;
}

function renderPhone(content: string, shot: string | null, alt: string, className = ''): string {
  const screen = shot
    ? `<img class="phone-shot" src="${escapeHtml(shot)}" alt="${escapeHtml(alt)}" loading="lazy" decoding="async" width="390" height="844">`
    : content;
  return `<figure class="phone ${className}">
      <div class="phone-frame">
        <span class="phone-notch" aria-hidden="true"></span>
        <div class="phone-screen">${screen}</div>
      </div>
    </figure>`;
}

function renderParents(c: LandingContent, catalog: CatalogData, shots: Screenshots): string {
  const bullets = c.parents.bullets
    .map(
      (bullet) => `<li>${icon('check', 'icon icon-sm')}<span><strong>${escapeHtml(bullet.title)}</strong>${escapeHtml(bullet.body)}</span></li>`,
    )
    .join('');
  return `<section class="section parents" id="parents">
  <div class="wrap parents-grid">
    <div class="parents-copy" data-reveal>
      <p class="eyebrow is-light">${escapeHtml(c.parents.eyebrow)}</p>
      <h2>${escapeHtml(c.parents.title)}</h2>
      <p class="section-lead">${escapeHtml(c.parents.lead)}</p>
      <ul class="bullets">${bullets}</ul>
    </div>
    <div class="phones" data-reveal>
      ${renderPhone(renderChannelsMock(c, catalog), shots.channels, c.parents.screens.channels, 'phone-left')}
      ${renderPhone(renderWatchMock(c), shots.timer, c.parents.screens.timer, 'phone-center')}
      ${renderPhone(renderHistoryMock(c, catalog), shots.history, c.parents.screens.history, 'phone-right')}
    </div>
  </div>
</section>`;
}

function renderSteps(c: LandingContent): string {
  const items = c.steps.items
    .map(
      (item, index) => `<li data-reveal>
        <span class="step-num" aria-hidden="true">${String(index + 1).padStart(2, '0')}</span>
        <h3>${escapeHtml(item.title)}</h3>
        <p>${escapeHtml(item.body)}</p>
      </li>`,
    )
    .join('');
  return `<section class="section steps" id="how">
  <div class="wrap">
    <header class="section-head" data-reveal>
      <p class="eyebrow">${escapeHtml(c.steps.eyebrow)}</p>
      <h2>${escapeHtml(c.steps.title)}</h2>
      <p class="section-lead">${escapeHtml(c.steps.lead)}</p>
    </header>
    <ol class="step-list">${items}</ol>
  </div>
</section>`;
}

function renderCatalog(c: LandingContent, lang: Lang, base: string, catalog: CatalogData): string {
  const channels = catalog.channels.length;
  const videos = totalVideos(catalog);
  const date = formatDate(catalog.generatedAt, lang, true);
  const chips = catalog.channels
    .map(
      (channel) => `<li><span>${escapeHtml(channel.name)}</span><b>${formatNumber(channel.videos.length, lang)}</b></li>`,
    )
    .join('');
  return `<section class="section catalog" id="catalog">
  <div class="wrap">
    <header class="section-head" data-reveal>
      <p class="eyebrow">${escapeHtml(c.catalog.eyebrow)}</p>
      <h2>${escapeHtml(c.catalog.title)}</h2>
      <p class="section-lead">${escapeHtml(c.catalog.lead)}</p>
    </header>
    <div class="catalog-panel" data-reveal>
      <div class="catalog-stats">
        <div class="catalog-stat"><strong>${formatNumber(channels, lang)}</strong><span>${escapeHtml(c.catalog.channelLabel)}</span></div>
        <div class="catalog-stat"><strong>${formatNumber(videos, lang)}</strong><span>${escapeHtml(c.catalog.videoLabel)}</span></div>
        <p class="catalog-updated">${escapeHtml(c.catalog.updatedLabel)} <time datetime="${escapeHtml(catalog.generatedAt)}">${escapeHtml(date)}</time></p>
        <p class="catalog-auto">${escapeHtml(c.catalog.autoNote)}</p>
        <a class="text-link" href="${base}catalog/index.json" target="_blank" rel="noreferrer">${escapeHtml(c.catalog.jsonLink)}${icon('arrow')}</a>
      </div>
      <ul class="channel-chips">${chips}</ul>
    </div>
    <p class="catalog-version">${escapeHtml(c.catalog.versionLabel)} <code>${escapeHtml(catalog.version.slice(0, 12))}</code></p>
  </div>
</section>`;
}

function renderInstall(c: LandingContent): string {
  const steps = c.install.steps
    .map(
      (step, index) => `<li><span aria-hidden="true">${index + 1}</span><div><strong>${escapeHtml(step.title)}</strong><p>${escapeHtml(step.body)}</p></div></li>`,
    )
    .join('');
  return `<section class="section install" id="install">
  <div class="wrap">
    <div class="install-card" data-reveal>
      <div class="install-copy">
        <p class="eyebrow">${escapeHtml(c.install.eyebrow)}</p>
        <h2>${escapeHtml(c.install.title)}</h2>
        <p class="section-lead">${escapeHtml(c.install.lead)}</p>
        <a class="btn btn-dark btn-lg" href="${RELEASES_URL}" target="_blank" rel="noreferrer">${icon('download')}<span>${escapeHtml(c.install.cta)}</span></a>
        <p class="install-note">${escapeHtml(c.install.ctaNote)}</p>
        <p class="install-android">${escapeHtml(c.install.androidNote)}</p>
      </div>
      <ol class="install-steps">${steps}</ol>
    </div>
    <div class="build-card" data-reveal>
      <div>
        <h3>${escapeHtml(c.install.buildTitle)}</h3>
        <p>${escapeHtml(c.install.buildBody)}</p>
      </div>
      <a class="btn btn-ghost" href="${README_URL}" target="_blank" rel="noreferrer">${escapeHtml(c.install.buildLink)}${icon('arrow')}</a>
    </div>
  </div>
</section>`;
}

function renderFaq(c: LandingContent): string {
  const items = c.faq.items
    .map(
      (item) => `<details class="faq-item" data-reveal>
        <summary><span>${escapeHtml(item.q)}</span>${icon('chevron', 'icon icon-chevron')}</summary>
        <div class="faq-body"><p>${escapeHtml(item.a)}</p></div>
      </details>`,
    )
    .join('');
  return `<section class="section faq" id="faq">
  <div class="wrap faq-wrap">
    <header class="section-head" data-reveal>
      <p class="eyebrow">${escapeHtml(c.faq.eyebrow)}</p>
      <h2>${escapeHtml(c.faq.title)}</h2>
    </header>
    <div class="faq-list">${items}</div>
  </div>
</section>`;
}

function renderFooter(c: LandingContent, lang: Lang, base: string): string {
  const switchHref = lang === 'id' ? `${base}en/` : base;
  const switchLang = lang === 'id' ? 'en' : 'id';
  return `<footer class="site-footer">
  <div class="wrap footer-grid">
    <div class="footer-brand">
      <a class="brand" href="${base}" aria-label="YouStrict">
        <img class="brand-mark" src="${base}assets/logo.svg" alt="" width="34" height="38" loading="lazy" decoding="async">
        <span class="brand-name">YouStrict</span>
      </a>
      <p>${escapeHtml(c.footer.tagline)}</p>
      <a class="footer-release" href="${RELEASES_URL}" target="_blank" rel="noreferrer">${icon('download')}<span>${escapeHtml(c.footer.links.releases)}</span></a>
    </div>
    <nav class="footer-col" aria-label="${escapeHtml(c.footer.productTitle)}">
      <h3>${escapeHtml(c.footer.productTitle)}</h3>
      <ul>
        <li><a href="#features">${escapeHtml(c.footer.links.features)}</a></li>
        <li><a href="#how">${escapeHtml(c.footer.links.how)}</a></li>
        <li><a href="#install">${escapeHtml(c.footer.links.install)}</a></li>
      </ul>
    </nav>
    <nav class="footer-col" aria-label="${escapeHtml(c.footer.sourceTitle)}">
      <h3>${escapeHtml(c.footer.sourceTitle)}</h3>
      <ul>
        <li><a href="${REPO_URL}" target="_blank" rel="noreferrer">${escapeHtml(c.footer.links.github)}</a></li>
        <li><a href="${RELEASES_URL}" target="_blank" rel="noreferrer">${escapeHtml(c.footer.links.releases)}</a></li>
        <li><a href="${README_URL}" target="_blank" rel="noreferrer">${escapeHtml(c.footer.links.readme)}</a></li>
      </ul>
    </nav>
    <nav class="footer-col" aria-label="${escapeHtml(c.footer.catalogTitle)}">
      <h3>${escapeHtml(c.footer.catalogTitle)}</h3>
      <ul>
        <li><a href="${base}catalog/index.json" target="_blank" rel="noreferrer">${escapeHtml(c.footer.links.catalogIndex)}</a></li>
        <li><a href="${base}catalog/">${escapeHtml(c.footer.links.catalogStatus)}</a></li>
        <li><a href="${switchHref}" hreflang="${switchLang}" lang="${switchLang}">${escapeHtml(c.switchName)}</a></li>
      </ul>
    </nav>
  </div>
  <div class="wrap footer-bottom">
    <p>© ${new Date().getUTCFullYear()} YouStrict · ${escapeHtml(c.footer.madeWith)}</p>
    <p>${escapeHtml(c.footer.disclaimer)}</p>
  </div>
</footer>`;
}

function renderJsonLd(c: LandingContent): string {
  const data = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'SoftwareApplication',
        name: 'YouStrict',
        applicationCategory: 'EntertainmentApplication',
        operatingSystem: 'Android, Android TV',
        url: SITE_URL,
        downloadUrl: RELEASES_URL,
        inLanguage: c.htmlLang,
        description: c.meta.description,
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      },
      {
        '@type': 'FAQPage',
        inLanguage: c.htmlLang,
        mainEntity: c.faq.items.map((item) => ({
          '@type': 'Question',
          name: item.q,
          acceptedAnswer: { '@type': 'Answer', text: item.a },
        })),
      },
    ],
  };
  return JSON.stringify(data).replace(/</g, '\\u003c');
}

export function renderLanding(lang: Lang, catalog: CatalogData, shots: Screenshots): string {
  const c = CONTENT[lang];
  const base = lang === 'id' ? './' : '../';
  const screenshots: Screenshots = {
    timer: shots.timer ? `${base}${shots.timer}` : null,
    channels: shots.channels ? `${base}${shots.channels}` : null,
    history: shots.history ? `${base}${shots.history}` : null,
  };
  const canonical = lang === 'id' ? SITE_URL : `${SITE_URL}en/`;
  const ogImage = `${SITE_URL}assets/og-${lang}.png`;
  const description = escapeHtml(c.meta.description);

  return `<!doctype html>
<html lang="${c.htmlLang}" class="no-js">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(c.meta.title)}</title>
  <meta name="description" content="${description}">
  <meta name="theme-color" content="#d9649a">
  <meta name="color-scheme" content="light">
  <link rel="canonical" href="${canonical}">
  <link rel="alternate" hreflang="id" href="${SITE_URL}">
  <link rel="alternate" hreflang="en" href="${SITE_URL}en/">
  <link rel="alternate" hreflang="x-default" href="${SITE_URL}">
  <link rel="icon" href="${base}assets/favicon.svg" type="image/svg+xml">
  <link rel="icon" href="${base}assets/favicon-32.png" sizes="32x32">
  <link rel="apple-touch-icon" href="${base}assets/apple-touch-icon.png">
  <link rel="manifest" href="${base}site.webmanifest">
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="YouStrict">
  <meta property="og:title" content="${escapeHtml(c.meta.ogTitle)}">
  <meta property="og:description" content="${escapeHtml(c.meta.ogDescription)}">
  <meta property="og:url" content="${canonical}">
  <meta property="og:image" content="${ogImage}">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:locale" content="${lang === 'id' ? 'id_ID' : 'en_US'}">
  <meta property="og:locale:alternate" content="${lang === 'id' ? 'en_US' : 'id_ID'}">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${escapeHtml(c.meta.ogTitle)}">
  <meta name="twitter:description" content="${escapeHtml(c.meta.ogDescription)}">
  <meta name="twitter:image" content="${ogImage}">
  <link rel="stylesheet" href="${base}styles.css">
  <script>document.documentElement.classList.replace('no-js','js');</script>
  <script defer src="${base}app.js"></script>
  <script type="application/ld+json">${renderJsonLd(c)}</script>
</head>
<body>
  <a class="skip-link" href="#main">${escapeHtml(c.skip)}</a>
  ${renderHeader(c, lang, base)}
  <main id="main">
    ${renderHero(c, lang, catalog)}
    ${renderCompare(c)}
    ${renderFeatures(c)}
    ${renderParents(c, catalog, screenshots)}
    ${renderSteps(c)}
    ${renderCatalog(c, lang, base, catalog)}
    ${renderInstall(c)}
    ${renderFaq(c)}
  </main>
  ${renderFooter(c, lang, base)}
</body>
</html>
`;
}

export function renderCatalogIndexPage(catalog: CatalogData): string {
  const c = CONTENT.id;
  const rows = catalog.channels
    .map(
      (channel) => `<tr>
        <td>${escapeHtml(channel.name)}</td>
        <td>@${escapeHtml(channel.handle)}</td>
        <td>${formatNumber(channel.videos.length, 'id')}</td>
        <td><a href="channels/${escapeHtml(channel.id)}.json">JSON</a></td>
      </tr>`,
    )
    .join('');
  const date = formatDate(catalog.generatedAt, 'id', true);
  return `<!doctype html>
<html lang="id">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(c.catalog.indexTitle)} — YouStrict</title>
  <meta name="robots" content="noindex">
  <meta name="theme-color" content="#d9649a">
  <link rel="icon" href="../assets/favicon.svg" type="image/svg+xml">
  <link rel="stylesheet" href="../styles.css">
</head>
<body class="doc-page">
  <header class="doc-header">
    <div class="wrap doc-header-inner">
      <a class="brand" href="../"><img class="brand-mark" src="../assets/logo.svg" alt="" width="30" height="34"><span class="brand-name">YouStrict</span></a>
      <a class="text-link" href="../">${escapeHtml(c.catalog.indexBack)}${icon('arrow')}</a>
    </div>
  </header>
  <main class="wrap doc">
    <h1>${escapeHtml(c.catalog.indexTitle)}</h1>
    <p class="doc-lead">${escapeHtml(c.catalog.indexLead)}</p>
    <div class="doc-stats">
      <span><strong>${formatNumber(catalog.channels.length, 'id')}</strong> ${escapeHtml(c.catalog.channelLabel)}</span>
      <span><strong>${formatNumber(totalVideos(catalog), 'id')}</strong> ${escapeHtml(c.catalog.videoLabel)}</span>
      <span>${escapeHtml(c.catalog.updatedLabel)} ${escapeHtml(date)}</span>
    </div>
    <table class="doc-table">
      <thead><tr><th>Channel</th><th>Handle</th><th>${escapeHtml(c.catalog.videoLabel)}</th><th>Data</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>
    <p class="doc-note">${escapeHtml(c.catalog.versionLabel)}: <code>${escapeHtml(catalog.version.slice(0, 12))}</code> · <a href="index.json">catalog/index.json</a></p>
  </main>
</body>
</html>
`;
}

export function render404Page(): string {
  const id = CONTENT.id.notFound;
  const en = CONTENT.en.notFound;
  return `<!doctype html>
<html lang="id">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>404 — YouStrict</title>
  <meta name="robots" content="noindex">
  <meta name="theme-color" content="#d9649a">
  <link rel="icon" href="${SITE_BASE}/assets/favicon.svg" type="image/svg+xml">
  <link rel="stylesheet" href="${SITE_BASE}/styles.css">
</head>
<body class="doc-page">
  <main class="wrap doc doc-center">
    <a class="brand" href="${SITE_BASE}/"><img class="brand-mark" src="${SITE_BASE}/assets/logo.svg" alt="" width="44" height="49"><span class="brand-name">YouStrict</span></a>
    <p class="doc-code">404</p>
    <h1>${escapeHtml(id.title)}</h1>
    <p class="doc-lead">${escapeHtml(id.body)}</p>
    <p class="doc-lead" lang="en">${escapeHtml(en.title)}. ${escapeHtml(en.body)}</p>
    <div class="cta-row">
      <a class="btn btn-primary" href="${SITE_BASE}/">${escapeHtml(id.back)}</a>
      <a class="btn btn-ghost" href="${SITE_BASE}/en/" lang="en">${escapeHtml(en.back)}</a>
    </div>
  </main>
</body>
</html>
`;
}

export function renderSitemap(): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
  <url>
    <loc>${SITE_URL}</loc>
    <xhtml:link rel="alternate" hreflang="id" href="${SITE_URL}"/>
    <xhtml:link rel="alternate" hreflang="en" href="${SITE_URL}en/"/>
    <xhtml:link rel="alternate" hreflang="x-default" href="${SITE_URL}"/>
  </url>
  <url>
    <loc>${SITE_URL}en/</loc>
    <xhtml:link rel="alternate" hreflang="id" href="${SITE_URL}"/>
    <xhtml:link rel="alternate" hreflang="en" href="${SITE_URL}en/"/>
    <xhtml:link rel="alternate" hreflang="x-default" href="${SITE_URL}"/>
  </url>
</urlset>
`;
}

export const MANIFEST = JSON.stringify(
  {
    name: 'YouStrict',
    short_name: 'YouStrict',
    description: 'YouTube for kids, without the algorithm.',
    start_url: './',
    scope: './',
    display: 'standalone',
    background_color: '#fff8f6',
    theme_color: '#d9649a',
    icons: [
      { src: 'assets/favicon-192.png', sizes: '192x192', type: 'image/png' },
      { src: 'assets/favicon-512.png', sizes: '512x512', type: 'image/png' },
      { src: 'assets/logo.svg', sizes: 'any', type: 'image/svg+xml' },
    ],
  },
  null,
  2,
);

export const ROBOTS = `User-agent: *\nAllow: /\n\nSitemap: ${SITE_URL}sitemap.xml\n`;
