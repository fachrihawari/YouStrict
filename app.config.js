// Dynamic Expo config: app.json holds everything; this only narrows the
// native ABIs and enables release shrinking when a caller asks for it.
//
//   BUILD_ARCHS=arm64-v8a,armeabi-v7a eas build --profile release
//
// The release profiles set BUILD_ARCHS in eas.json, so sideloaded APKs skip the
// x86/x86_64 libraries (about half the APK) and R8 + resource shrinking strip
// unused Java/Kotlin code and resources. Local `expo run:android` and
// `expo prebuild` leave it unset and still build every ABI unshrunk, which
// keeps the emulator working and debug builds fast.
const appJson = require('./app.json');

/**
 * Android refuses an update whose versionCode is not higher than the installed
 * one. EAS bumps it through `autoIncrement`, but a plain Gradle build would
 * always produce versionCode 1 — so the Gradle workflow passes VERSION_CODE
 * (derived from the GitHub run number) and it always moves forward.
 */
const versionCode = Number(process.env.VERSION_CODE ?? 0);

/** @type {import('expo/config').ExpoConfig} */
module.exports = () => {
  const config = { ...appJson.expo };
  const archs = (process.env.BUILD_ARCHS ?? '')
    .split(',')
    .map((arch) => arch.trim())
    .filter(Boolean);

  if (Number.isInteger(versionCode) && versionCode > 0) {
    config.android = { ...config.android, versionCode };
  }

  if (archs.length > 0) {
    config.plugins = config.plugins.map((plugin) =>
      plugin === 'expo-build-properties'
        ? [
            'expo-build-properties',
            {
              android: {
                buildArchs: archs,
                enableMinifyInReleaseBuilds: true,
                enableShrinkResourcesInReleaseBuilds: true,
              },
            },
          ]
        : plugin,
    );
  }

  return config;
};
