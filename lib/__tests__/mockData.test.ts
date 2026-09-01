import {
  mockUser,
  mockLoans,
  mockEbooks,
  mockBooks,
  mockBorrowingHistory,
  CATEGORIES,
  DONATION_PRESETS,
  findMockBookByBarcode,
  searchMockEbooks,
} from "../mockData";

describe("mockData", () => {
  describe("mockUser", () => {
    it("has required user fields", () => {
      expect(mockUser).toHaveProperty("id");
      expect(mockUser).toHaveProperty("name");
      expect(mockUser).toHaveProperty("email");
      expect(mockUser).toHaveProperty("role");
    });

    it("has a valid email", () => {
      expect(mockUser.email).toMatch(/@/);
    });

    it("has a non-empty name", () => {
      expect(mockUser.name.length).toBeGreaterThan(0);
    });
  });

  describe("mockLoans", () => {
    it("is an array", () => {
      expect(Array.isArray(mockLoans)).toBe(true);
    });

    it("has at least one loan", () => {
      expect(mockLoans.length).toBeGreaterThan(0);
    });

    it("each loan has required fields", () => {
      mockLoans.forEach((loan) => {
        expect(loan).toHaveProperty("id");
        expect(loan).toHaveProperty("bookTitle");
        expect(loan).toHaveProperty("status");
      });
    });

    it("each loan has a valid status", () => {
      const validStatuses = ["active", "checked-out", "returned", "overdue"];
      mockLoans.forEach((loan) => {
        expect(validStatuses).toContain(loan.status);
      });
    });

    it("keeps reading progress within the linked book's page count", () => {
      mockLoans.forEach((loan) => {
        const book = mockBooks.find((item) => item.id === loan.bookId);
        expect(book).toBeDefined();
        expect(loan.currentPage ?? 0).toBeLessThanOrEqual(book!.totalPages);
      });
    });
  });

  describe("mockEbooks", () => {
    it("is an array", () => {
      expect(Array.isArray(mockEbooks)).toBe(true);
    });

    it("has at least one ebook", () => {
      expect(mockEbooks.length).toBeGreaterThan(0);
    });

    it("each ebook has required fields", () => {
      mockEbooks.forEach((ebook) => {
        expect(ebook).toHaveProperty("id");
        expect(ebook).toHaveProperty("title");
        expect(ebook).toHaveProperty("author");
      });
    });

    it("each ebook has a non-empty title", () => {
      mockEbooks.forEach((ebook) => {
        expect(ebook.title.length).toBeGreaterThan(0);
      });
    });
  });

  describe("mockBorrowingHistory", () => {
    it("is an array", () => {
      expect(Array.isArray(mockBorrowingHistory)).toBe(true);
    });

    it("each entry has required fields", () => {
      mockBorrowingHistory.forEach((entry) => {
        expect(entry).toHaveProperty("id");
        expect(entry).toHaveProperty("bookTitle");
      });
    });
  });

  describe("mock scanner lookup", () => {
    it("finds a book by its master barcode", () => {
      expect(findMockBookByBarcode("bk-001-001")?.id).toBe("book_001");
    });

    it("finds a book by a matching copy barcode", () => {
      expect(findMockBookByBarcode("CP-002-001")?.id).toBe("book_002");
    });

    it("returns undefined for an unknown code", () => {
      expect(findMockBookByBarcode("UNKNOWN-123")).toBeUndefined();
    });

    it("keeps every mock book API-shaped", () => {
      mockBooks.forEach((book) => {
        expect(book.barcode).toBeTruthy();
        expect(book).toHaveProperty("availableCopies");
        expect(book).toHaveProperty("shelfNumber");
      });
    });
  });

  describe("mock catalog search", () => {
    it("filters by title or author without case sensitivity", () => {
      expect(searchMockEbooks("qasim attari").map((book) => book.id)).toContain("eb_003");
      expect(searchMockEbooks("speaking less").map((book) => book.id)).toContain("eb_001");
    });

    it("combines text and category filters", () => {
      expect(searchMockEbooks("speaking", "Akhlaaq-o-Aadaab")).toHaveLength(1);
      expect(searchMockEbooks("speaking", "Seerah")).toHaveLength(0);
    });
  });

  describe("CATEGORIES", () => {
    it("is a non-empty array of strings", () => {
      expect(Array.isArray(CATEGORIES)).toBe(true);
      expect(CATEGORIES.length).toBeGreaterThan(0);
    });

    it("each category is a non-empty string", () => {
      CATEGORIES.forEach((cat) => {
        expect(typeof cat).toBe("string");
        expect(cat.length).toBeGreaterThan(0);
      });
    });

    it("includes 'All' as the first category", () => {
      expect(CATEGORIES[0]).toBe("All");
    });
  });

  describe("DONATION_PRESETS", () => {
    it("is a non-empty array of numbers", () => {
      expect(Array.isArray(DONATION_PRESETS)).toBe(true);
      expect(DONATION_PRESETS.length).toBeGreaterThan(0);
    });

    it("each preset is a positive number", () => {
      DONATION_PRESETS.forEach((amount) => {
        expect(typeof amount).toBe("number");
        expect(amount).toBeGreaterThan(0);
      });
    });
  });
});
