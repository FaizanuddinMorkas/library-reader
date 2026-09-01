import * as SecureStore from "expo-secure-store";
import { mockUser } from "@/lib/mockUser";
import { useAuthStore, hydrateAuthStore } from "../authStore";

const SESSION_KEY = "auth_session";
const LEGACY_TOKEN_KEY = "auth_token";
const LEGACY_USER_KEY = "auth_user";

// Reset store between tests
beforeEach(() => {
  jest.resetAllMocks();
  jest.mocked(SecureStore.getItemAsync).mockResolvedValue(null);
  jest.mocked(SecureStore.setItemAsync).mockResolvedValue(undefined);
  jest.mocked(SecureStore.deleteItemAsync).mockResolvedValue(undefined);
  useAuthStore.setState({
    user: null,
    isAuthenticated: false,
    hasHydrated: false,
  });
});

jest.mock("expo-secure-store", () => ({
  setItemAsync: jest.fn(() => Promise.resolve()),
  getItemAsync: jest.fn(() => Promise.resolve(null)),
  deleteItemAsync: jest.fn(() => Promise.resolve()),
}));

function makeStoredSession(overrides?: { savedAt?: number }) {
  return JSON.stringify({
    token: "mock_token_123",
    user: mockUser,
    savedAt: overrides?.savedAt ?? Date.now(),
  });
}

describe("authStore", () => {
  it("has correct initial state", () => {
    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.isAuthenticated).toBe(false);
    expect(state.hasHydrated).toBe(false);
  });

  it("setHasHydrated updates state", () => {
    const { setHasHydrated } = useAuthStore.getState();
    setHasHydrated(true);
    expect(useAuthStore.getState().hasHydrated).toBe(true);
  });

  it("login sets user, isAuthenticated, and writes single session blob", async () => {
    const { login } = useAuthStore.getState();
    await login("test@test.com", "password123");

    const state = useAuthStore.getState();
    expect(state.user).not.toBeNull();
    expect(state.isAuthenticated).toBe(true);
    expect(state.user?.email).toBe("faizan@library.com");

    expect(SecureStore.setItemAsync).toHaveBeenCalledTimes(1);
    expect(SecureStore.setItemAsync).toHaveBeenCalledWith(
      SESSION_KEY,
      expect.any(String),
    );
  });

  it("logout clears user and deletes single session key", async () => {
    const { login, logout } = useAuthStore.getState();
    await login("test@test.com", "password123");
    expect(useAuthStore.getState().isAuthenticated).toBe(true);

    await logout();

    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.isAuthenticated).toBe(false);
    expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith(SESSION_KEY);
  });

  it("hydrates a valid saved session (single read)", async () => {
    jest.mocked(SecureStore.getItemAsync)
      .mockResolvedValueOnce(makeStoredSession());

    await hydrateAuthStore();

    const state = useAuthStore.getState();
    expect(state.user).toEqual(mockUser);
    expect(state.isAuthenticated).toBe(true);
    expect(state.hasHydrated).toBe(true);
  });

  it("expires sessions older than 24 hours", async () => {
    const twoDaysAgo = Date.now() - 2 * 24 * 60 * 60 * 1000;
    jest.mocked(SecureStore.getItemAsync)
      .mockResolvedValueOnce(makeStoredSession({ savedAt: twoDaysAgo }));

    await hydrateAuthStore();

    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.isAuthenticated).toBe(false);
    expect(state.hasHydrated).toBe(true);
    // Expired session should be cleaned up
    expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith(SESSION_KEY);
  });

  it("continues unauthenticated when no session exists", async () => {
    await hydrateAuthStore();

    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.isAuthenticated).toBe(false);
    expect(state.hasHydrated).toBe(true);
  });

  it("continues unauthenticated when session data is corrupt", async () => {
    jest.spyOn(console, "warn").mockImplementation(() => undefined);
    jest.mocked(SecureStore.getItemAsync)
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce("not-json");

    await hydrateAuthStore();

    expect(useAuthStore.getState()).toMatchObject({
      user: null,
      isAuthenticated: false,
      hasHydrated: true,
    });
  });

  it("continues unauthenticated when SecureStore fails", async () => {
    jest.spyOn(console, "warn").mockImplementation(() => undefined);
    jest.mocked(SecureStore.getItemAsync).mockRejectedValueOnce(
      new Error("SecureStore unavailable"),
    );

    await hydrateAuthStore();

    expect(useAuthStore.getState()).toMatchObject({
      user: null,
      isAuthenticated: false,
      hasHydrated: true,
    });
  });

  it("migrates from legacy two-key format", async () => {
    jest.mocked(SecureStore.getItemAsync)
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce("legacy-token")
      .mockResolvedValueOnce(JSON.stringify(mockUser));
    jest.mocked(SecureStore.setItemAsync).mockResolvedValue(undefined);
    jest.mocked(SecureStore.deleteItemAsync).mockResolvedValue(undefined);

    await hydrateAuthStore();

    // Should have migrated to single-blob format
    expect(SecureStore.setItemAsync).toHaveBeenCalledWith(
      SESSION_KEY,
      expect.any(String),
    );
    expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith(LEGACY_TOKEN_KEY);
    expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith(LEGACY_USER_KEY);
  });
});
