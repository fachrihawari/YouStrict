// Points the release build at a real keystore, for CI builds that call Gradle
// directly instead of EAS.
//
// EAS injects signing credentials itself, but a plain `./gradlew assembleRelease`
// on a freshly prebuilt project signs with the *debug* key. This rewrites
// android/app/build.gradle so the release build uses a release keystore when
// these environment variables are present, and falls back to the debug key when
// they are not (so local builds keep working):
//
//   ANDROID_KEYSTORE_PATH, ANDROID_KEYSTORE_PASSWORD,
//   ANDROID_KEY_ALIAS, ANDROID_KEY_PASSWORD
//
// Run after `expo prebuild`; it is idempotent.
//
//   bun scripts/patch-android-signing.ts [android/app/build.gradle]
import { existsSync } from 'node:fs';

const path = process.argv[2] ?? `${import.meta.dir}/../android/app/build.gradle`;
if (!existsSync(path)) {
  console.error(`No build.gradle at ${path}. Run "expo prebuild" first.`);
  process.exit(1);
}

let gradle = await Bun.file(path).text();
const marker = 'ANDROID_KEYSTORE_PATH';

if (gradle.includes(marker)) {
  console.log(`${path} is already patched.`);
  process.exit(0);
}

// 1. Declare the config next to the generated `debug` one.
const debugConfig = /(\n(\s+)debug \{\n(?:.*\n)*?\2\}\n)/;
const match = gradle.match(debugConfig);
if (!match) {
  console.error('Could not find the signingConfigs/debug block; the template changed.');
  process.exit(1);
}
const indent = match[2];
const releaseConfig =
  `\n${indent}release {\n` +
  `${indent}    storeFile file(System.getenv("${marker}"))\n` +
  `${indent}    storePassword System.getenv("ANDROID_KEYSTORE_PASSWORD")\n` +
  `${indent}    keyAlias System.getenv("ANDROID_KEY_ALIAS")\n` +
  `${indent}    keyPassword System.getenv("ANDROID_KEY_PASSWORD")\n` +
  `${indent}}\n`;
gradle = gradle.replace(debugConfig, `$1${releaseConfig}`);

// 2. Point the release buildType at it. Anchor on `buildTypes {` first: a bare
//    /release \{/ scan can match the signingConfigs block declared above.
const buildTypesAt = gradle.search(/\n\s+buildTypes \{/);
if (buildTypesAt === -1) {
  console.error('Could not find the buildTypes block; the template changed.');
  process.exit(1);
}
const head = gradle.slice(0, buildTypesAt);
let tail = gradle.slice(buildTypesAt);
if (!/release \{[\s\S]*?signingConfig signingConfigs\.debug/.test(tail)) {
  console.error('Could not find the release buildType signing line; the template changed.');
  process.exit(1);
}
tail = tail.replace(
  /(release \{[\s\S]*?signingConfig signingConfigs)\.debug/,
  '$1.debug\n' +
    `${indent}    // CI passes a real keystore; local builds keep the debug key.\n` +
    `${indent}    if (System.getenv("${marker}")) signingConfig signingConfigs.release`,
);
gradle = head + tail;

await Bun.write(path, gradle);
console.log(`Patched ${path} for release signing.`);
