import { renderHook, waitFor } from "@testing-library/react-native";
import { useEBooks } from "../useEBooks";

jest.mock("@/lib/api/catalogApi", () => ({
  catalogApi: {
    ebooks: jest.fn(() => Promise.resolve({
      data: [
        {
          id: "ebook_001",
          libraryId: "lib_001",
          title: "Mock e-book",
          author: "Mock Author",
          category: "Akhlaaq-o-Aadaab",
          categoryId: "global-cat-akhlaaq-o-aadaab",
          coverUrl: "https://example.com/cover.png",
          pdfUrl: "https://example.com/book.pdf",
          accessType: "free",
          isPublished: true,
          uploadedBy: "admin_001",
        },
      ],
      total: 1,
      page: 1,
      limit: 100,
    })),
    categories: jest.fn(() => Promise.resolve([
      {
        id: "global-cat-akhlaaq-o-aadaab",
        name: "Akhlaaq-o-Aadaab",
        description: "",
        scope: "global",
        status: "active",
      },
    ])),
  },
}));

jest.mock("expo-secure-store", () => ({
  setItemAsync: jest.fn(() => Promise.resolve()),
  getItemAsync: jest.fn(() => Promise.resolve(null)),
  deleteItemAsync: jest.fn(() => Promise.resolve()),
}));

describe("useEBooks", () => {
  it("loads e-books from the reader API", async () => {
    const { result } = await renderHook(() => useEBooks());
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
      expect(result.current.ebooks[0].title).toBe("Mock e-book");
    });
  });

  it("loads e-books after the request completes", async () => {
    const { result } = await renderHook(() => useEBooks());
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
      expect(result.current.ebooks.length).toBe(1);
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
