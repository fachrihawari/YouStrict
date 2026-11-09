// Dynamic Expo config: app.json holds everything; this only narrows the
// native ABIs when a caller asks for it.
//
//   BUILD_ARCHS=arm64-v8a,armeabi-v7a eas build --profile release
//
// The release profile sets BUILD_ARCHS in eas.json, so sideloaded APKs skip the
// x86/x86_64 libraries (about half the APK). Local `expo run:android` and
// `expo prebuild` leave it unset and still build every ABI, which keeps the
// emulator working.
const appJson = require('./app.json');

/** @type {import('expo/config').ExpoConfig} */
module.exports = () => {
  const config = { ...appJson.expo };
  const archs = (process.env.BUILD_ARCHS ?? '')
    .split(',')
    .map((arch) => arch.trim())
    .filter(Boolean);

  if (archs.length > 0) {
    config.plugins = config.plugins.map((plugin) =>
      plugin === 'expo-build-properties'
        ? ['expo-build-properties', { android: { buildArchs: archs } }]
        : plugin,
    );
  }

  return config;
};
