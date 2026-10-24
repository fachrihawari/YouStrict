// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');
const { withUniwindConfig } = require('uniwind/metro');

const config = getDefaultConfig(__dirname);

// drizzle: add sql to sourceExts
config.resolver.sourceExts.push('sql');
config.resolver.sourceExts.push('css');

module.exports = withUniwindConfig(config, {
  cssEntryFile: './app/globals.css'
});