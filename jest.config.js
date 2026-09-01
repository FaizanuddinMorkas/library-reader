module.exports = {
  preset: "jest-expo",
  transformIgnorePatterns: [
    "node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@sentry/react-native|native-base|react-native-svg|react-native-reanimated|react-native-gesture-handler|react-native-safe-area-context|react-native-screens|@gorhom/bottom-sheet|lucide-react-native|zustand|@tanstack/react-query|nativewind|react-native-css-interop)",
  ],
  setupFilesAfterEnv: ["./jest.setup.ts"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
    "^lucide-react-native$": "<rootDir>/test/mocks/lucide-react-native.js",
    "^lucide-react-native/icons/.*$": "<rootDir>/test/mocks/lucide-react-native.js",
  },
  collectCoverageFrom: [
    "**/*.{ts,tsx}",
    "!**/node_modules/**",
    "!**/*.d.ts",
    "!app/_layout.tsx",
    "!app/(auth)/_layout.tsx",
    "!app/(tabs)/_layout.tsx",
  ],
};
