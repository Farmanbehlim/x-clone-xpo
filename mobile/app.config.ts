import type { ConfigContext, ExpoConfig } from '@expo/config';



const path = require('path');

require('dotenv').config({ 
  path: path.resolve(__dirname, `.env.${process.env.APP_ENV || 'development'}`)
});

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,

  name: "mobile",
  slug: "xclone",
  version: "1.0.0",
  orientation: "portrait",
  icon: "./assets/images/icon.png",
  scheme: "mobile",
  userInterfaceStyle: "automatic",
  jsEngine: "hermes",
  ios: {
    supportsTablet: true
  },
  android: {
    adaptiveIcon: {
      foregroundImage: "./assets/images/adaptive-icon.png",
      backgroundColor: "#ffffff"
    },
    package: "com.anonymous.mobile",
    permissions: [
      "ACCESS_COARSE_LOCATION",
      "ACCESS_FINE_LOCATION"
    ]
  },
  web: {
    bundler: "metro",
    output: "static",
    favicon: "./assets/images/favicon.png"
  },
  plugins: [
    "expo-router",
    "expo-notifications",
    [
      "expo-splash-screen",
      {
        "image": "./assets/images/splash-icon.png",
        "imageWidth": 200,
        "resizeMode": "contain",
        "backgroundColor": "#ffffff"
      }
    ],
    [
      "expo-location",
      {
        "locationAlwaysAndWhenInUserPermission": "Allow location app to use your location"
      }
    ],
    "expo-font",
    "expo-secure-store"
  ],
  experiments: {
    typedRoutes: true
  },
  extra: {
    API_BASE_URL: process.env.API_BASE_URL,
    ENVIRONMENT:process.env.ENVIRONMENT,
    PROJECT_ID:process.env.PROJECT_ID,
    EXPO_OWNER:process.env.EXPO_OWNER,
    CLERK_PUBLISHABLE_KEY:process.env.CLERK_PUBLISHABLE_KEY,

    // Preserve existing extras
    router: {
      origin: false
    },
    eas: {
      projectId: process.env.PROJECT_ID
    }
  },
  owner: process.env.EXPO_OWNER

})

