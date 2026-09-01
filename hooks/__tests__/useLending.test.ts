import { renderHook, waitFor } from "@testing-library/react-native";
import { useLending } from "../useLending";

jest.mock("expo-secure-store", () => ({
  setItemAsync: jest.fn(() => Promise.resolve()),
  getItemAsync: jest.fn(() => Promise.resolve(null)),
  deleteItemAsync: jest.fn(() => Promise.resolve()),
}));

describe("useLending", () => {
  it("makes local mock loans available immediately", async () => {
    const { result } = await renderHook(() => useLending());
    expect(result.current.isLoading).toBe(false);
    expect(result.current.loans.length).toBeGreaterThan(0);
  });

  it("loads mock loans after loading", async () => {
    const { result } = await renderHook(() => useLending());
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
      expect(result.current.loans.length).toBeGreaterThan(0);
    });
  });
});
