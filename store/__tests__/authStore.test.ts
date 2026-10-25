import * as SecureStore from "expo-secure-store";
import { mockUser } from "@/lib/mockUser";
import { authApi } from "@/lib/api/authApi";
import { useAuthStore, hydrateAuthStore } from "../authStore";

const SESSION_KEY = "auth_session";
const LEGACY_TOKEN_KEY = "auth_token";
const LEGACY_USER_KEY = "auth_user";

jest.mock("@/lib/api/authApi", () => ({
  authApi: {
    login: jest.fn(),
    logout: jest.fn(() => Promise.resolve()),
  },
}));

jest.mock("expo-secure-store", () => ({
  setItemAsync: jest.fn(() => Promise.resolve()),
  getItemAsync: jest.fn(() => Promise.resolve(null)),
  deleteItemAsync: jest.fn(() => Promise.resolve()),
}));

const loginResponse = {
  user: {
    id: mockUser.id,
    name: mockUser.name,
    email: mockUser.email,
    role: "reader",
    libraryId: mockUser.libraryId,
    branchId: mockUser.branchId,
    status: "active" as const,
  },
  accessToken: "access-token",
  refreshToken: "refresh-token",
};

beforeEach(() => {
  jest.resetAllMocks();
  jest.mocked(authApi.login).mockResolvedValue(loginResponse);
  jest.mocked(authApi.logout).mockResolvedValue(undefined);
  jest.mocked(SecureStore.getItemAsync).mockResolvedValue(null);
  jest.mocked(SecureStore.setItemAsync).mockResolvedValue(undefined);
  jest.mocked(SecureStore.deleteItemAsync).mockResolvedValue(undefined);
  useAuthStore.setState({ user: null, isAuthenticated: false, hasHydrated: false });
});

function makeStoredSession(overrides?: { savedAt?: number }) {
  return JSON.stringify({
    accessToken: "access-token",
    refreshToken: "refresh-token",
    user: mockUser,
    savedAt: overrides?.savedAt ?? Date.now(),
  });
}

describe("authStore", () => {
  it("logs in through the API and persists the native session", async () => {
    await useAuthStore.getState().login("test@test.com", "password123");

    expect(authApi.login).toHaveBeenCalledWith({ email: "test@test.com", password: "password123" });
    expect(useAuthStore.getState()).toMatchObject({ user: expect.objectContaining({ email: mockUser.email }), isAuthenticated: true });
    expect(SecureStore.setItemAsync).toHaveBeenCalledWith(SESSION_KEY, expect.any(String));
  });

  it("logs out through the API and clears the session", async () => {
    await useAuthStore.getState().login("test@test.com", "password123");
    await useAuthStore.getState().logout();

    expect(authApi.logout).toHaveBeenCalled();
    expect(useAuthStore.getState()).toMatchObject({ user: null, isAuthenticated: false });
    expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith(SESSION_KEY);
  });

  it("hydrates a valid saved session", async () => {
    jest.mocked(SecureStore.getItemAsync).mockResolvedValueOnce(makeStoredSession());
    await hydrateAuthStore();

    expect(useAuthStore.getState()).toMatchObject({ user: mockUser, isAuthenticated: true, hasHydrated: true });
  });

  it("expires sessions older than 24 hours", async () => {
    jest.mocked(SecureStore.getItemAsync).mockResolvedValueOnce(
      makeStoredSession({ savedAt: Date.now() - 2 * 24 * 60 * 60 * 1000 }),
    );
    await hydrateAuthStore();

    expect(useAuthStore.getState()).toMatchObject({ user: null, isAuthenticated: false, hasHydrated: true });
    expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith(SESSION_KEY);
  });

  it("continues unauthenticated when no session exists", async () => {
    await hydrateAuthStore();
    expect(useAuthStore.getState()).toMatchObject({ user: null, isAuthenticated: false, hasHydrated: true });
  });

  it("migrates the legacy session blob", async () => {
    jest.mocked(SecureStore.getItemAsync)
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce("legacy-token")
      .mockResolvedValueOnce(JSON.stringify(mockUser));

    await hydrateAuthStore();

    expect(SecureStore.setItemAsync).toHaveBeenCalledWith(SESSION_KEY, expect.any(String));
    expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith(LEGACY_TOKEN_KEY);
    expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith(LEGACY_USER_KEY);
  });
});
