import { act, renderHook, waitFor } from "@testing-library/react-native";
import { booksApi } from "@/lib/api/booksApi";
import { catalogApi } from "@/lib/api/catalogApi";
import { useBooks } from "../useBooks";

jest.mock("@/lib/api/booksApi", () => ({
  booksApi: { list: jest.fn() },
}));

jest.mock("@/lib/api/catalogApi", () => ({
  catalogApi: { categories: jest.fn() },
}));

beforeEach(() => {
  jest.resetAllMocks();
  jest.mocked(booksApi.list).mockResolvedValue({ data: [], total: 0, page: 1, limit: 100 });
  jest.mocked(catalogApi.categories).mockResolvedValue([
    { id: "cat-1", name: "New category", description: "", scope: "global", status: "active" },
  ]);
});

describe("useBooks", () => {
  it("reloads books and categories when refreshed", async () => {
    const { result } = await renderHook(() => useBooks());

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.categories).toEqual(["All", "New category"]);

    jest.mocked(catalogApi.categories).mockResolvedValue([
      { id: "cat-2", name: "Recently added", description: "", scope: "global", status: "active" },
    ]);

    await act(async () => {
      await result.current.refresh();
    });

    expect(catalogApi.categories).toHaveBeenCalledTimes(2);
    expect(result.current.categories).toEqual(["All", "Recently added"]);
  });
});
