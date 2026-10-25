import { act, renderHook, waitFor } from "@testing-library/react-native";
import { lendingApi } from "@/lib/api/lendingApi";
import { useLoan } from "../useLoan";

jest.mock("@/lib/api/lendingApi", () => ({
  lendingApi: {
    getById: jest.fn(),
    getBookReadingHistory: jest.fn(),
    updateProgress: jest.fn(),
  },
}));

const loan = {
  id: "loan-2",
  readerId: "reader-1",
  readerName: "Reader",
  bookId: "book-1",
  bookTitle: "Book",
  bookBarcode: "BK-1",
  branchId: "branch-1",
  issueDate: "2026-10-10",
  dueDate: "2026-10-20",
  status: "checked-out" as const,
  currentLendingPagesReadCount: 0,
};

const history = {
  data: [],
  lendingPeriods: [
    { loanId: "loan-1", issueDate: "2026-09-01", returnDate: "2026-09-10", status: "returned" as const, pagesReadCount: 30, legacySummary: false },
    { loanId: "loan-2", issueDate: "2026-10-10", status: "checked-out" as const, pagesReadCount: 20, legacySummary: false },
  ],
  bookPagesReadTotal: 50,
  total: 0,
  page: 1,
  limit: 20,
};

beforeEach(() => {
  jest.resetAllMocks();
  jest.mocked(lendingApi.getById).mockResolvedValue(loan);
  jest.mocked(lendingApi.getBookReadingHistory).mockResolvedValue(history);
});

describe("useLoan reading history", () => {
  it("loads the book history while keeping the active lending subtotal separate", async () => {
    const { result } = await renderHook(() => useLoan("loan-2"));

    await waitFor(() => expect(result.current.readingHistory?.bookPagesReadTotal).toBe(50));
    expect(result.current.loan?.currentLendingPagesReadCount).toBe(0);
    expect(result.current.readingHistory?.lendingPeriods[1].pagesReadCount).toBe(20);
  });

  it("saves an individual session then refreshes the book history", async () => {
    jest.mocked(lendingApi.updateProgress).mockResolvedValue({
      ...loan,
      pagesReadFrom: undefined,
      pagesReadTo: undefined,
      pagesReadCount: 5,
      currentLendingPagesReadCount: 25,
      readingProgressEntry: {
        id: "entry-3",
        loanId: "loan-2",
        pagesReadCount: 5,
        createdAt: "2026-10-25T10:00:00.000Z",
      },
    });
    const updatedHistory = { ...history, bookPagesReadTotal: 55, lendingPeriods: [history.lendingPeriods[0], { ...history.lendingPeriods[1], pagesReadCount: 25 }] };
    jest.mocked(lendingApi.getBookReadingHistory).mockResolvedValueOnce(history).mockResolvedValueOnce(updatedHistory);
    const { result } = await renderHook(() => useLoan("loan-2"));

    await waitFor(() => expect(result.current.readingHistory).not.toBeNull());
    await act(async () => {
      await result.current.saveProgress({ pagesReadCount: 5 });
    });

    expect(lendingApi.updateProgress).toHaveBeenCalledWith("loan-2", { pagesReadCount: 5 });
    expect(result.current.loan?.currentLendingPagesReadCount).toBe(25);
    expect(result.current.readingHistory?.bookPagesReadTotal).toBe(55);
  });

  it("loads another history page and appends older sessions", async () => {
    const olderEntry = {
      id: "entry-old",
      loanId: "loan-1",
      pagesReadCount: 30,
      createdAt: "2026-09-09T10:00:00.000Z",
    };
    jest.mocked(lendingApi.getBookReadingHistory)
      .mockResolvedValueOnce({ ...history, data: [], total: 2 })
      .mockResolvedValueOnce({ ...history, data: [olderEntry], total: 2, page: 2 });
    const { result } = await renderHook(() => useLoan("loan-2"));

    await waitFor(() => expect(result.current.readingHistory?.total).toBe(2));
    await act(async () => result.current.loadMoreHistory());

    expect(lendingApi.getBookReadingHistory).toHaveBeenLastCalledWith("book-1", { page: 2, limit: 20 });
    expect(result.current.readingHistory?.data).toEqual([olderEntry]);
  });
});
