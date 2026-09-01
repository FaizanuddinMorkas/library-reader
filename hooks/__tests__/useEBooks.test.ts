import { renderHook, waitFor } from "@testing-library/react-native";
import { useEBooks } from "../useEBooks";

jest.mock("expo-secure-store", () => ({
  setItemAsync: jest.fn(() => Promise.resolve()),
  getItemAsync: jest.fn(() => Promise.resolve(null)),
  deleteItemAsync: jest.fn(() => Promise.resolve()),
}));

describe("useEBooks", () => {
  it("makes local mock ebooks available immediately", async () => {
    const { result } = await renderHook(() => useEBooks());
    expect(result.current.isLoading).toBe(false);
    expect(result.current.ebooks.length).toBeGreaterThan(0);
  });

  it("loads mock ebooks after loading", async () => {
    const { result } = await renderHook(() => useEBooks());
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
      expect(result.current.ebooks.length).toBeGreaterThan(0);
    });
  });

  it("provides categories", async () => {
    const { result } = await renderHook(() => useEBooks());
    await waitFor(() => {
      expect(result.current.categories).toContain("All");
      expect(result.current.categories.length).toBeGreaterThan(1);
    });
  });
});
