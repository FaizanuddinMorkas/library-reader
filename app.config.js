const baseConfig = require("./app.json");

const isKiosk = process.env.APP_VARIANT === "kiosk";
const xpremAppId = "d38d088f-1137-4b11-8b0d-c7285af1a1b2";
const updateChannel = process.env.OTA_CHANNEL || "UAT";

module.exports = {
  ...baseConfig,
  expo: {
    ...baseConfig.expo,
    runtimeVersion: baseConfig.expo.version,
    updates: {
      ...baseConfig.expo.updates,
      enabled: true,
      checkAutomatically: "ON_LOAD",
      fallbackToCacheTimeout: 0,
      url: "https://updates.quicktag.in/manifest",
      codeSigningMetadata: {
        keyid: "main",
        alg: "rsa-v1_5-sha256",
      },
      codeSigningCertificate: "./app-d38d088f-1137-4b11-8b0d-c7285af1a1b2-certificate.txt",
      requestHeaders: {
        "expo-channel-name": updateChannel,
        "expo-app-id": xpremAppId,
      },
    },
    name: isKiosk ? "LibraryOS Kiosk" : baseConfig.expo.name,
    slug: isKiosk ? "libraryos-kiosk" : baseConfig.expo.slug,
    scheme: isKiosk ? "libraryos-kiosk" : baseConfig.expo.scheme,
    ios: {
      ...baseConfig.expo.ios,
      bundleIdentifier: isKiosk ? "com.libraryos.kiosk" : baseConfig.expo.ios.bundleIdentifier,
      config: {
        ...baseConfig.expo.ios.config,
        usesNonExemptEncryption: false,
      },
    },
    android: {
      ...baseConfig.expo.android,
      package: isKiosk ? "com.libraryos.kiosk" : baseConfig.expo.android.package,
    },
    extra: {
      ...baseConfig.expo.extra,
      appVariant: isKiosk ? "kiosk" : "reader",
    },
    plugins: [
      ...baseConfig.expo.plugins.map((plugin) => {
        if (!Array.isArray(plugin) || plugin[0] !== "expo-camera") return plugin;

        const [pluginName, pluginOptions = {}] = plugin;
        return [pluginName, {
          ...pluginOptions,
          cameraPermission: isKiosk
            ? "Allow LibraryOS Kiosk to scan reader cards and book codes"
            : pluginOptions.cameraPermission,
        }];
      }),
      ...(!isKiosk ? [
        "@config-plugins/react-native-blob-util",
        "@config-plugins/react-native-pdf",
      ] : []),
      "expo-updates",
    ],
  },
};
