/// <reference types="jest" />

// Mock expo-secure-store
jest.mock("expo-secure-store", () => ({
  setItemAsync: jest.fn(() => Promise.resolve()),
  getItemAsync: jest.fn(() => Promise.resolve(null)),
  deleteItemAsync: jest.fn(() => Promise.resolve()),
}));

jest.mock("@react-native-async-storage/async-storage", () =>
  require("@react-native-async-storage/async-storage/jest/async-storage-mock")
);

// Mock expo-router
jest.mock("expo-router", () => ({
  router: {
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    canGoBack: jest.fn(() => true),
  },
  Redirect: jest.fn(() => null),
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    canGoBack: jest.fn(() => true),
  }),
  useLocalSearchParams: () => ({}),
  Stack: {
    Screen: ({ children }: { children: React.ReactNode }) => children,
  },
  Link: ({ children }: { children: React.ReactNode }) => children,
}));

// Mock expo-font
jest.mock("expo-font", () => ({
  useFonts: () => [true, null],
  loadAsync: jest.fn(() => Promise.resolve()),
}));

// Mock expo-splash-screen
jest.mock("expo-splash-screen", () => ({
  preventAutoHideAsync: jest.fn(() => Promise.resolve()),
  hideAsync: jest.fn(() => Promise.resolve()),
}));

// Mock react-native-gesture-handler
jest.mock("react-native-gesture-handler", () => {
  const View = require("react-native").View;
  return {
    GestureHandlerRootView: View,
    Gesture: {
      Pan: () => ({}),
      Tap: () => ({}),
    },
    GestureDetector: View,
    ScrollView: require("react-native").ScrollView,
    NativeViewGestureHandler: View,
    State: {},
  };
});

// Mock @gorhom/bottom-sheet
jest.mock("@gorhom/bottom-sheet", () => {
  const View = require("react-native").View;
  return {
    __esModule: true,
    default: View,
    BottomSheetModal: View,
    BottomSheetScrollView: View,
    BottomSheetView: View,
  };
});

// Mock nativewind
jest.mock("nativewind", () => ({
  styled: (component: unknown) => component,
}));

// Silence the warning: Animated: `useNativeDriver` is not supported
jest.mock("react-native/Libraries/Animated/NativeAnimatedModule");
