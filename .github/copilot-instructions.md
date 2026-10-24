# Instructions for AI assistants working on YouStrict

YouStrict is a kid-safe YouTube app for Android TV (and Android phones/tablets). See README.md for the
architecture. Key rules:

## Stack
Expo SDK 54, `react-native-tvos` 0.81, Expo Router 6 (typed routes), Drizzle ORM + expo-sqlite,
**uniwind 1.0.5** + Tailwind 4 (not NativeWind), FlashList 2, react-native-youtube-bridge, Bun.
Targets: Android TV + Android phone/tablet. No web, no Apple TV.

## Data
- Video data is **never** bundled or committed. `catalog/channels.json` is the only input; the GitHub
  Action builds and publishes the catalog; `lib/catalog.ts` syncs it into SQLite.
- `catalog/schema.ts` is shared by Bun scripts and the app: keep it free of runtime-specific imports.
- The expo-sqlite Drizzle driver is synchronous: inside `db.transaction()` use `.run()/.all()/.get()`,
  never `await`.
- Use `useDbQuery` (hooks/use-db-query.ts) for reactive reads that join tables; drizzle's
  `useLiveQuery` only watches the root table.
- Parent choices (`channels.enabled`, `videos.hidden`) must survive syncs: upsert, don't delete+insert.
- After changing `db/schema.ts`, run `bunx drizzle-kit generate` and add the file to `drizzle/migrations.js`.

## Navigation & safety
- Every screen belongs to one mode from `contexts/session-context.tsx`; `app/_layout.tsx` guards them
  with `Stack.Protected`. Don't navigate imperatively between modes — change the mode.
- Anything that ends or changes a session needs the parent PIN.
- The player must keep YouTube's own controls off and the touch shield on (no links out of the app).
- The add-channel workflow must only act on issues from the repo owner, and must pass issue content via
  `env:`, never inline `${{ }}` in `run:`.

## TV UI
- uniwind 1.0.5 has no `focus:` variant on Pressable: use `components/focus-button.tsx`
  (`focusClassName`) or the `style={({ focused }) => …}` pattern.
- Every interactive element must be reachable with a D-pad; set `hasTVPreferredFocus` on the primary
  action of each screen.
- Use `Platform.isTV` ternaries with full class strings for 10-foot sizes (no `tv:` variant in 1.0.5).
- All TV scripts need `EXPO_TV=1`.
