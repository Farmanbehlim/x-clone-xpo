


// metro.config.js

const { getDefaultConfig } = require("@expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

// Extend Expo's Metro config
const config = getDefaultConfig(__dirname);

// Add NativeWind support
module.exports = withNativeWind(config, {
  input: "./global.css",
});
