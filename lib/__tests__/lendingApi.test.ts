import { apiClient } from "@/lib/api/client";
import { lendingApi } from "../api/lendingApi";

jest.mock("@/lib/api/client", () => ({
  apiClient: {
    get: jest.fn(),
    post: jest.fn(),
    patch: jest.fn(),
  },
}));

describe("lendingApi reading history", () => {
  beforeEach(() => jest.resetAllMocks());

  it("appends a dated reading session to the active lending", async () => {
    jest.mocked(apiClient.post).mockResolvedValue({ data: { id: "loan-1", currentLendingPagesReadCount: 10 } });

    await lendingApi.updateProgress("loan-1", { pagesReadCount: 10 });

    expect(apiClient.post).toHaveBeenCalledWith("/reader/loans/loan-1/reading-progress", { pagesReadCount: 10 });
  });

  it("loads paginated reading history by exact book id", async () => {
    jest.mocked(apiClient.get).mockResolvedValue({ data: {
      data: [],
      lendingPeriods: [],
      bookPagesReadTotal: 0,
      total: 0,
      page: 2,
      limit: 10,
    } });

    await lendingApi.getBookReadingHistory("book-1", { page: 2, limit: 10 });

    expect(apiClient.get).toHaveBeenCalledWith("/reader/books/book-1/reading-history", { params: { page: 2, limit: 10 } });
  });
});
