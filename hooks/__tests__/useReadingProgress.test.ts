import { act, renderHook, waitFor } from "@testing-library/react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useReadingProgress } from "../useReadingProgress";

jest.mock("@react-native-async-storage/async-storage", () =>
  require("@react-native-async-storage/async-storage/jest/async-storage-mock")
);

describe("useReadingProgress", () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
  });

  it("persists the current page using the API-shaped local record", async () => {
    const { result } = await renderHook(() => useReadingProgress("eb_001"));
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await result.current.saveProgress(48, 320);
    });

    const stored = JSON.parse((await AsyncStorage.getItem("reading_progress")) ?? "{}");
    expect(stored.eb_001.page).toBe(48);
    expect(stored.eb_001.totalPages).toBe(320);
    expect(stored.eb_001.lastRead).toEqual(expect.any(String));
  });
});
