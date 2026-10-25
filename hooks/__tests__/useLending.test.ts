import { renderHook, waitFor } from "@testing-library/react-native";
import { lendingApi } from "@/lib/api/lendingApi";
import { useLending } from "../useLending";

jest.mock("@/lib/api/lendingApi", () => ({
  lendingApi: { list: jest.fn() },
}));

const activeLoan = {
  id: "loan-1",
  readerId: "reader-1",
  readerName: "Reader",
  bookId: "book-1",
  bookTitle: "Book",
  bookBarcode: "BK-1",
  branchId: "branch-1",
  issueDate: "2026-09-01",
  dueDate: "2026-09-15",
  status: "checked-out" as const,
};

beforeEach(() => {
  jest.resetAllMocks();
  jest.mocked(lendingApi.list).mockImplementation(async (params) => ({
    data: params?.tab === "history" ? [] : [activeLoan],
    total: params?.tab === "history" ? 0 : 1,
    page: 1,
    limit: 100,
  }));
});

describe("useLending", () => {
  it("loads active and historical loans from the API", async () => {
    const { result } = await renderHook(() => useLending());

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.loans).toEqual([activeLoan]);
    expect(result.current.activeLoans).toHaveLength(1);
    expect(result.current.returnedLoans).toHaveLength(0);
  });

  it("exposes API errors", async () => {
    jest.mocked(lendingApi.list).mockRejectedValue(new Error("offline"));
    const { result } = await renderHook(() => useLending());

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.error?.message).toBe("offline");
    expect(result.current.loans).toEqual([]);
  });
});
