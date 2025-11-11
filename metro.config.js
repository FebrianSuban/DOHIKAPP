const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add wasm to asset extensions
config.resolver.assetExts.push('wasm');

// Add wasm to source extensions
config.resolver.sourceExts.push('wasm');

module.exports = config;