// Generates Expo Router's typed routes (.expo/types/router.d.ts) for tsc.
// Expo only writes them from `expo start`, so start the dev server, wait for
// the file, and stop it. Used by `bun run typecheck` and CI.
import { existsSync, rmSync } from 'node:fs';

const TYPES = `${import.meta.dir}/../.expo/types/router.d.ts`;
const TIMEOUT_MS = 120_000;

rmSync(TYPES, { force: true });
const proc = Bun.spawn(['bunx', 'expo', 'start', '--offline', '--port', '8099'], {
  cwd: `${import.meta.dir}/..`,
  env: { ...process.env, CI: '1', EXPO_TV: '1' },
  stdout: 'ignore',
  stderr: 'ignore',
});

const deadline = Date.now() + TIMEOUT_MS;
while (!existsSync(TYPES) && Date.now() < deadline && proc.exitCode === null) {
  await Bun.sleep(250);
}
proc.kill();

if (!existsSync(TYPES)) {
  console.error('typegen: expo start did not write .expo/types/router.d.ts');
  process.exit(1);
}
console.log('typegen: wrote .expo/types/router.d.ts');
