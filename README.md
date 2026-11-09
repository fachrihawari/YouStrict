# YouStrict 📺

A kid-safe YouTube app for **Android TV** (and Android phones/tablets). Children only see videos from
channels a parent has approved, for a time limit the parent sets. No search, no recommendations, no links
out to YouTube.

## How it works

```
catalog/channels.json ──▶ GitHub Action (daily, yt-dlp) ──▶ GitHub Pages: catalog/index.json
                                                                     │
                     TV app ◀── syncs on launch / on foreground after 6 h ◀────────┘
                       │
         PIN gate ─▶ Parent area ─▶ Watch (grid + player) ─▶ Time's up ─▶ PIN gate
```

- **Catalog pipeline.** `.github/workflows/catalog.yml` runs `scripts/build-catalog.ts` every day at 03:00 WIB.
  It makes one `yt-dlp` call per channel and publishes `index.json` plus one JSON file per channel to GitHub
  Pages. If a channel fails, its previous data is kept, and an empty catalog is never published.
  The Pages site root is the landing page (see [Website](#website-github-pages)); `catalog/` is a
  human-readable status page and the TV app consumes `catalog/index.json`.
- **App sync** (`lib/catalog.ts`). The app downloads only the channels whose hash changed and writes them in a
  single SQLite transaction. The parent's choices (channel on/off, hidden videos) survive every sync. The app
  works offline from its cache; playback needs internet.
- **Parent area** (PIN protected):
  - Start a session (5–180 min), optionally letting the last video finish when time runs out mid-video
    (up to 10 extra minutes).
  - Turn channels on or off. New channels start **off**.
  - Hide individual videos.
  - Filters: hide videos whose title contains a blocked word, or that are longer than a limit.
  - History: what was watched over the last 30 days, grouped by day, with quick "hide video" and "turn off
    channel" actions.
  - Request a new channel.
  - Sync status and changing the PIN.
- **Kid area:**
  - A channel rail and a video grid (4 columns on TV, 1–3 on phone/tablet).
  - A player with its own remote-friendly controls.
  - A banner warns at 5 minutes and 1 minute left.
  - Back can't leave the session. When time is up, the app locks until the PIN is entered.

## Adding a channel (no code, no laptop)

1. On the TV: **Parent → Channels → Request a channel**, then type the `@handle`.
2. Scan the QR code with your phone and submit the prefilled GitHub issue.
3. `.github/workflows/add-channel.yml` checks the channel with yt-dlp, adds it to `catalog/channels.json`, and
   republishes the catalog. Only issues opened by the **repo owner** are processed.
4. After the next sync, the channel shows up (turned off) under **Channels**. Turn it on.

You can also run `bun run catalog:add <handle>` and push, or edit `catalog/channels.json` on GitHub.

### One-time GitHub setup

- **Settings → Pages → Source:** GitHub Actions
- **Settings → Actions → General → Workflow permissions:** Read and write (`contents:write` is required
  only by the add-channel workflow; the catalog job uses `contents:read, pages:write, id-token:write`).
- Run **Actions → Publish catalog → Run workflow** once to publish the first catalog.

## Website (GitHub Pages)

The root of `fachrihawari.github.io/YouStrict` is now a bilingual, hand-written landing page
(Indonesian at `/`, English at `/en/`) with a language toggle, a parent-area showcase, and the real catalog
stats baked in at build time. JavaScript is optional — the pages are static HTML.

```
site/content/id.ts            Indonesian copy
site/content/en.ts            English copy (shared shape — a missing key is a type error)
site/content/types.ts         shared copy shape
site/static/styles.css        (no CSS framework, no web fonts)
site/static/app.js            tiny header/scroll/script behaviour
site/assets-src/              source SVGs for logo, favicons and OG images, rasterised at build time
scripts/landing.ts            typed renderer: escaping, relative asset paths, canonical/OG URLs, JSON-LD
scripts/preview-landing.ts    load the published catalog and serve .site-preview/ locally
scripts/landing.test.ts       tests (content shape, escaping, asset existence, sitemap)
scripts/publish-site.ts       shared "copy site/static + write every static file" glue
```

- **Where the site lives.** `.github/workflows/catalog.yml` builds `dist/` from `site/**` and `catalog/**` and
  deploys it to Pages. The landing numbers come from the same run that publishes `catalog/index.json`, so they
  can never drift apart. Any change that touches `site/**` must be committed to `main` and kick off a catalog
  build (the `site/**` path trigger).
- **Bilingual.** `/index.html` is Indonesian and is the canonical URL. `/en/index.html` is English, linked via
  `hreflang="en"`. The footer and the header both carry a language toggle.
- **Screenshots.** Drop real app screenshots into `site/static/assets/shots/`:
  `timer.png`, `channels.png`, `history.png` (png, webp or jpg). The landing reads them if they exist; there is
  a compact CSS mockup as a fallback until real screenshots arrive. Capturing them needs a device or an
  Android TV emulator (see the [Development](#development) commands).
- **Preview locally.** `bun run site:preview` loads the published `catalog/index.json`, copies `site/static/`,
  writes the HTML pages, and serves them on port 4173. Output goes to `.site-preview/` in `.gitignore`.
- **OG images.** `site/assets-src/og-id.svg` and `og-en.svg` are the sources for the committed
  `site/static/assets/og-*.png` (1200×630); regenerate them with
  `rsvg-convert -w 1200 -h 630 site/assets-src/og-id.svg -o site/static/assets/og-id.png` after editing the copy.

## Build & release (APK)

```bash
# Same dev commands as before (see Development below).
bun run catalog:build      # builds the catalog into dist/ (needs yt-dlp)
bun run site:preview       # preview the landing with the published catalog
```

Two workflows can build a release; **use the Gradle one by default**.

#### Default: `Release APK (Gradle)` — no EAS quota

Actions tab → **Release APK (Gradle)** → *Run workflow* → pick `arm64-v8a` or `armeabi-v7a`.
It runs `expo prebuild`, verifies that `gradle.properties` got the right ABI/R8/shrink settings, decodes the
keystore from secrets, patches the generated `build.gradle`, and runs `./gradlew assembleRelease`. The APK is
uploaded as a run artifact with its size breakdown in the run summary. Roughly 8–10 minutes per architecture,
and nothing is charged to EAS.

Signing comes from the existing EAS keystore (same certificate as builds 21/22), so the APK upgrades an
installed build in place. The four secrets it needs — `ANDROID_KEYSTORE_BASE64`, `ANDROID_KEYSTORE_PASSWORD`,
`ANDROID_KEY_ALIAS`, `ANDROID_KEY_PASSWORD` — are already set; `bash scripts/export-signing-secrets.sh`
re-creates them from `credentials.json` if you ever rotate the key.

`versionCode` is `1000 + github.run_number`. It has to be higher than every previously installed build
(EAS stopped at 22) and higher on every run, otherwise Android refuses the update — the workflow asserts this
before assembling.

#### Fallback: `Release APK` — EAS

The `release-arm64` / `release-armv7` profiles still exist and build the same two APKs on EAS, then create the
release themselves. Keep this as a backup for when the runner environment breaks, since EAS maintains the
Android image. It costs one EAS build per architecture (free plan: 15/month), so it is not the default.

Either way the release ends up on GitHub Releases, so the **Download APK** button on the landing page always
points to a real file. The EAS workflow deliberately does **not** trigger on tags: its own release would start
another build, and each release bumps the version counter, so the chain would never stop.

The EAS workflow reuses an existing release: a rerun that yields the same build number uploads the APKs to
that release instead of creating a second one.

`bun run update` (OTA, channel `preview`) publishes to both architectures — see
[Shipping a JS fix](#shipping-a-js-fix-ota). OTA publishing is an EAS Update call, not an EAS build, so it does
not consume the build quota.

## Development

```bash
bun install
bun run prebuild:tv        # or `bun run prebuild` for phone/tablet
bun run android:tv         # build & run on an Android TV device/emulator
bun run start              # dev server (TV mode)

bun run catalog:build      # build the catalog locally into dist/ (needs yt-dlp)
bunx drizzle-kit generate  # after changing db/schema.ts

bun test                   # unit tests (Bun; Expo modules are stubbed in test/setup.ts)
bun run typecheck          # generates Expo Router's typed routes, then tsc
```

Builds: `eas build --profile preview --platform android` (APK).

### APK size and ABIs

A universal APK carries native code for every Android architecture. On this app the `.so` files were 98 MB
of a 106 MB APK, and the x86/x86_64 pair alone was ~54 MB — dead weight, since real TVs and phones are ARM.

The release workflow therefore builds **one APK per architecture**, which is about half the size each:

| Profile | `BUILD_ARCHS` | Device |
|---|---|---|
| `release-arm64` | `arm64-v8a` | most Android TV boxes, phones and tablets since ~2016 |
| `release-armv7` | `armeabi-v7a` | older 32-bit TVs and cheap TV boxes |
| `release` | `arm64-v8a,armeabi-v7a` | both in one APK, for a quick manual build |

`app.config.js` turns `BUILD_ARCHS` into `expo-build-properties` → `android.buildArchs`. The setting
deliberately stays out of `app.json`: `bun run android:tv`, `bun run prebuild` and `expo run:android` leave
`BUILD_ARCHS` unset and keep building x86/x86_64, so the emulator still works.

`bun run update` (OTA) publishes to every architecture, and each one has its own runtime version — see
[Shipping a JS fix](#shipping-a-js-fix-ota).

Because ABIs are native code, changing them changes the `fingerprint` runtime version: publish a new APK
and reinstall, OTA updates for the old build will not apply.

### Shipping a JS fix (OTA)

JS updates ride on `expo-updates` config: channel `preview` (`eas.json`) with the `fingerprint`
`runtimeVersion` policy (`app.json`). A published update applies on the next app start, so a running session
is never interrupted.

```bash
bun run update:arm64       # app/watch screens changed -> 64-bit APK
bun run update:armv7       # ...and the 32-bit APK
```

**Publish both, or one arch stops receiving updates.** `BUILD_ARCHS` is part of the Expo config, which the
fingerprint hashes, so each architecture has its own `runtimeVersion`. An update only reaches builds whose
runtime version matches — that is also why a universal APK (`release` profile) is a third, separate track.
The scripts set `BUILD_ARCHS` for you; running a bare `eas update` would compute a fingerprint matching none
of the published APKs.

`runtimeVersion` uses the `fingerprint` policy: an update only reaches builds with the same native code.
After adding or upgrading a native module, build and install a new APK.

### Tests & CI

`.github/workflows/ci.yml` runs on every PR and push to `main`: typecheck, `bun test`, `expo-doctor`, and a
check that `drizzle/` matches `db/schema.ts`. Pushes to `main` skip CI for channel-only changes
(`paths-ignore: catalog/channels.json`). Tests sit next to the code (`*.test.ts`). `test/setup.ts`
replaces `@/db` with an in-memory `bun:sqlite` database migrated from `./drizzle`, replaces SecureStore,
expo-crypto and expo-constants with in-memory stand-ins, and stubs the expo-sqlite change listener with a
no-op.

## Project structure

```
app/
  _layout.tsx            Data init + Stack.Protected per mode (setup/locked/time-up, parent, watching)
  index.tsx              PIN gate (create PIN on first launch, time's up)
  parent/                Parent area: home (start session), channels, channel/[id], request-channel, settings
  watch/                 Kid area: grid, [id] player, unlock (PIN to stop early)
catalog/
  channels.json          Channel list (source of truth for the pipeline)
  schema.ts              Catalog types + validators shared by the scripts and the app
scripts/                 build-catalog.ts, landing.ts, publish-site.ts, preview-landing.ts,
                         add-channel.ts, typegen.ts, yt.ts (yt-dlp wrapper)
site/                    Landing page (content/, static/, assets-src/) rendered into dist/
components/              focus-button, pin-pad, video-card, session-timer, time-warning
contexts/session-context App mode + watch session (SecureStore)
db/, drizzle/            Drizzle schema + migrations (local cache of the catalog)
helpers/                 pin (salted SHA-256 + lockout), session, filters, video
hooks/                   use-database-init, use-db-query, use-videos, use-channels, use-now, use-watch-recorder
lib/                     catalog sync, settings, history
```

## Tech stack

Expo SDK 58 · React Native TV 0.88 (`react-native-tvos`) · Expo Router 58 · Drizzle ORM + expo-sqlite ·
uniwind 1.13 + Tailwind 4 · FlashList 2 · react-native-youtube-bridge · Bun · yt-dlp (CI only).
