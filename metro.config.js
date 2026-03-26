const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// @anthropic-ai/sdk has no 'react-native' export condition — only 'node' and 'browser'.
// Adding 'browser' as a fallback ensures Metro picks the browser build instead of the
// Node build, which pulls in Node-only modules that crash the React Native runtime.
config.resolver.unstable_conditionNames = ['react-native', 'browser', 'require'];

module.exports = config;
