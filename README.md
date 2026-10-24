# YouStrict 📺

A kid-safe YouTube app for **Android TV** (and Android phones/tablets). Children only see videos from
channels a parent has approved, for a time limit the parent sets. No search, no recommendations, no links
out to YouTube.

## How it works

```
catalog/channels.json ──▶ GitHub Action (daily, yt-dlp) ──▶ GitHub Pages: catalog/index.json
                                                                     │
                     TV app ◀── syncs on launch / every 6 h ◀────────┘
                       │
         PIN gate ─▶ Parent area ─▶ Watch (grid + player) ─▶ Time's up ─▶ PIN gate
```

- **Catalog pipeline.** `.github/workflows/catalog.yml` runs `scripts/build-catalog.ts` every day at 03:00 WIB.
  It makes one `yt-dlp` call per channel and publishes `index.json` plus one JSON file per channel to GitHub
  Pages. If a channel fails, its previous data is kept, and an empty catalog is never published.
- **App sync** (`lib/catalog.ts`). The app downloads only the channels whose hash changed and writes them in a
  single SQLite transaction. The parent's choices (channel on/off, hidden videos) survive every sync. The app
  works offline from its cache; playback needs internet.
- **Parent area** (PIN protected):
  - Start a session (5–180 min).
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
- **Settings → Actions → General → Workflow permissions:** Read and write
- Run **Actions → Publish catalog → Run workflow** once to publish the first catalog.

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

### Shipping a JS fix (OTA)

The preview APK checks EAS Update on launch (`expo-updates`, channel `preview`) and applies a new update on
the next app start, so a running session is never interrupted.

```bash
bun run update             # eas update --channel preview, with EXPO_TV=1
```

`runtimeVersion` uses the `fingerprint` policy: an update only reaches builds with the same native code.
After adding or upgrading a native module, build and install a new APK.

### Tests & CI

`.github/workflows/ci.yml` runs on every PR and push to `main`: typecheck, `bun test`, `expo-doctor`, and a
check that `drizzle/` matches `db/schema.ts`. Tests sit next to the code (`*.test.ts`). `test/setup.ts`
replaces `@/db` with an in-memory `bun:sqlite` database migrated from `./drizzle`, and replaces SecureStore,
expo-crypto and expo-constants with in-memory stand-ins.

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
scripts/                 build-catalog.ts, add-channel.ts, yt.ts (yt-dlp wrapper)
components/              focus-button, pin-pad, video-card, session-timer
contexts/session-context App mode + watch session (SecureStore)
db/, drizzle/            Drizzle schema + migrations (local cache of the catalog)
helpers/                 pin (salted SHA-256 + lockout), session, formatting
hooks/                   use-database-init, use-db-query, use-videos, use-channels
lib/                     catalog sync, settings
```

## Tech stack

Expo SDK 58 · React Native TV 0.88 (`react-native-tvos`) · Expo Router 58 · Drizzle ORM + expo-sqlite ·
uniwind 1.13 + Tailwind 4 · FlashList 2 · react-native-youtube-bridge · Bun · yt-dlp (CI only).
