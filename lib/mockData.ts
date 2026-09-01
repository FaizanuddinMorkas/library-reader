import { LendingRecord } from "@/types/reader";
import { Book, EBook } from "@/types/book";
import { Notification } from "@/types/user";

// mockUser lives in its own file to avoid pulling this 338-line module
// into the auth startup path (authStore only needs mockUser).
export { mockUser } from "@/lib/mockUser";

// Anchor "today" so all date math is reproducible in tests and stories.
// Each loan's issueDate / dueDate is offset from TODAY in days, which
// means the dataset stays valid as time advances (move the anchor to
// re-align).
const TODAY = new Date("2026-09-01T00:00:00Z");

function daysFromNow(days: number): string {
  const d = new Date(TODAY);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString();
}

const DAWAT_E_ISLAMI_CATALOG = [
  {
    title: "The Benefits of Speaking Less",
    author: "Ameer-e-Ahl-e-Sunnat",
    category: "Akhlaaq-o-Aadaab",
    coverUrl: require("../assets/books/bt3831.png"),
    pdfUrl: "https://data2.dawateislami.net/Data/Books/Download/en/pdf/2026/3831-1.pdf?fn=the-benefits-of-speaking-less",
    description: "Official English booklet from Dawat-e-Islami on the benefits of speaking less.",
    totalPages: 13,
    publishedYear: 2026,
    publisher: "Maktaba-tul-Madina",
  },
  {
    title: "Matters of Knowlegde and Action (Part 03)",
    author: "Al Madina-tul-Ilmiyah",
    category: "Akhlaaq-o-Aadaab",
    coverUrl: require("../assets/books/bt3833.png"),
    pdfUrl: "https://data2.dawateislami.net/Data/Books/Download/en/pdf/2026/3833-1.pdf?fn=matters-of-Knowlegde-and-action-part-03",
    description: "Official English booklet from Dawat-e-Islami about matters of knowledge and action.",
    totalPages: 15,
    publishedYear: 2026,
    publisher: "Maktaba-tul-Madina",
  },
  {
    title: "The Qur'anic Method of Inviting towards Islam",
    author: "Mufti Muhammad Qasim Attari",
    category: "Other",
    coverUrl: require("../assets/books/bt3834.png"),
    pdfUrl: "https://data2.dawateislami.net/Data/Books/Download/en/pdf/2026/3834-1.pdf?fn=the-quranic-method-of-inviting-towards-islam",
    description: "Official English booklet from Dawat-e-Islami on the Qur'anic method of inviting towards Islam.",
    totalPages: 13,
    publishedYear: 2026,
    publisher: "Others",
  },
  {
    title: "Attar's Fourty Hadith (Part 04)",
    author: "Ameer-e-Ahl-e-Sunnat",
    category: "Seerat",
    coverUrl: require("../assets/books/bt3827.png"),
    pdfUrl: "https://data2.dawateislami.net/Data/Books/Download/en/pdf/2026/3827-1.pdf?fn=attars-fourty-hadith-part-04",
    description: "Official English booklet from Dawat-e-Islami in the Attar's Fourty Hadith series.",
    totalPages: 44,
    publishedYear: 2026,
    publisher: "Maktaba-tul-Madina",
  },
] as const;

function catalogEntryForBookId(bookId: string) {
  const number = Number(bookId.replace("book_", ""));
  return DAWAT_E_ISLAMI_CATALOG[(number - 1) % DAWAT_E_ISLAMI_CATALOG.length];
}

export const mockLoans: LendingRecord[] = [
  // 1. Active, future due date (due in 14 days) — green "Days to return"
  {
    id: "loan_001",
    readerId: "usr_001",
    readerName: "Faizan Morkas",
    bookId: "book_001",
    bookTitle: catalogEntryForBookId("book_001").title,
    bookBarcode: "BK-001-001",
    copyId: "copy_001",
    copyBarcode: "CP-001-001",
    branchId: "branch_001",
    issueDate: daysFromNow(-7),
    dueDate: daysFromNow(7),
    status: "checked-out",
    currentPage: 5,
  },
  // 2. Active, due today (0 days) — orange "Today"
  {
    id: "loan_002",
    readerId: "usr_001",
    readerName: "Faizan Morkas",
    bookId: "book_002",
    bookTitle: catalogEntryForBookId("book_002").title,
    bookBarcode: "BK-002-001",
    copyId: "copy_002",
    copyBarcode: "CP-002-001",
    branchId: "branch_001",
    issueDate: daysFromNow(-14),
    dueDate: daysFromNow(0),
    status: "checked-out",
    currentPage: 12,
  },
  // 3. Active, due in 2 days (due soon) — green "Days to return"
  {
    id: "loan_003",
    readerId: "usr_001",
    readerName: "Faizan Morkas",
    bookId: "book_003",
    bookTitle: catalogEntryForBookId("book_003").title,
    bookBarcode: "BK-003-001",
    copyId: "copy_003",
    copyBarcode: "CP-003-001",
    branchId: "branch_001",
    issueDate: daysFromNow(-12),
    dueDate: daysFromNow(2),
    status: "checked-out",
    currentPage: 0,
  },
  // 4. Active but past due (status stale) — red "Overdue days"
  {
    id: "loan_004",
    readerId: "usr_001",
    readerName: "Faizan Morkas",
    bookId: "book_004",
    bookTitle: catalogEntryForBookId("book_004").title,
    bookBarcode: "BK-004-001",
    copyId: "copy_004",
    copyBarcode: "CP-004-001",
    branchId: "branch_001",
    issueDate: daysFromNow(-25),
    dueDate: daysFromNow(-5),
    status: "checked-out",
    currentPage: 30,
    fineAmount: 25,
  },
  // 5. Officially overdue with fine — red status, fine > 0
  {
    id: "loan_005",
    readerId: "usr_001",
    readerName: "Faizan Morkas",
    bookId: "book_005",
    bookTitle: catalogEntryForBookId("book_005").title,
    bookBarcode: "BK-005-001",
    copyId: "copy_005",
    copyBarcode: "CP-005-001",
    branchId: "branch_001",
    issueDate: daysFromNow(-28),
    dueDate: daysFromNow(-14),
    status: "overdue",
    currentPage: 10,
    fineAmount: 140,
  },
  // 6. Heavy overdue with high fine (edge case for big numbers)
  {
    id: "loan_006",
    readerId: "usr_001",
    readerName: "Faizan Morkas",
    bookId: "book_006",
    bookTitle: catalogEntryForBookId("book_006").title,
    bookBarcode: "BK-006-001",
    copyId: "copy_006",
    copyBarcode: "CP-006-001",
    branchId: "branch_001",
    issueDate: daysFromNow(-45),
    dueDate: daysFromNow(-31),
    status: "overdue",
    currentPage: 14,
    fineAmount: 310,
  },
  // 7. Returned on time — green "Days held", no fine
  {
    id: "loan_007",
    readerId: "usr_001",
    readerName: "Faizan Morkas",
    bookId: "book_007",
    bookTitle: catalogEntryForBookId("book_007").title,
    bookBarcode: "BK-007-001",
    copyId: "copy_007",
    copyBarcode: "CP-007-001",
    branchId: "branch_001",
    issueDate: daysFromNow(-30),
    dueDate: daysFromNow(-16),
    returnDate: daysFromNow(-18),
    status: "returned",
    currentPage: 13,
  },
  // 8. Returned late but fine was waived — no fineAmount on the loan
  {
    id: "loan_008",
    readerId: "usr_001",
    readerName: "Faizan Morkas",
    bookId: "book_008",
    bookTitle: catalogEntryForBookId("book_008").title,
    bookBarcode: "BK-008-001",
    copyId: "copy_008",
    copyBarcode: "CP-008-001",
    branchId: "branch_001",
    issueDate: daysFromNow(-22),
    dueDate: daysFromNow(-8),
    returnDate: daysFromNow(-3),
    status: "returned",
    currentPage: 32,
  },
  // 9. Near-complete reading progress (95%)
  {
    id: "loan_009",
    readerId: "usr_001",
    readerName: "Faizan Morkas",
    bookId: "book_009",
    bookTitle: catalogEntryForBookId("book_009").title,
    bookBarcode: "BK-009-001",
    copyId: "copy_009",
    copyBarcode: "CP-009-001",
    branchId: "branch_001",
    issueDate: daysFromNow(-10),
    dueDate: daysFromNow(4),
    status: "checked-out",
    currentPage: 12,
  },
  // 10. Just started, no reading yet (currentPage = 0)
  {
    id: "loan_010",
    readerId: "usr_001",
    readerName: "Faizan Morkas",
    bookId: "book_010",
    bookTitle: catalogEntryForBookId("book_010").title,
    bookBarcode: "BK-010-001",
    copyId: "copy_010",
    copyBarcode: "CP-010-001",
    branchId: "branch_001",
    issueDate: daysFromNow(-2),
    dueDate: daysFromNow(12),
    status: "checked-out",
    currentPage: 0,
  },
  // 11. Active, very long loan (60 days) — tests big numbers
  {
    id: "loan_011",
    readerId: "usr_001",
    readerName: "Faizan Morkas",
    bookId: "book_011",
    bookTitle: catalogEntryForBookId("book_011").title,
    bookBarcode: "BK-011-001",
    copyId: "copy_011",
    copyBarcode: "CP-011-001",
    branchId: "branch_001",
    issueDate: daysFromNow(-45),
    dueDate: daysFromNow(15),
    status: "checked-out",
    currentPage: 6,
  },
  // 12. Returned late WITH fine recorded (paid) — tests fine history
  {
    id: "loan_012",
    readerId: "usr_001",
    readerName: "Faizan Morkas",
    bookId: "book_012",
    bookTitle: catalogEntryForBookId("book_012").title,
    bookBarcode: "BK-012-001",
    copyId: "copy_012",
    copyBarcode: "CP-012-001",
    branchId: "branch_001",
    issueDate: daysFromNow(-40),
    dueDate: daysFromNow(-26),
    returnDate: daysFromNow(-22),
    status: "returned",
    currentPage: 44,
    fineAmount: 40,
  },
  // 13. Long-overdue, low progress (worst case for fine + read %)
  {
    id: "loan_013",
    readerId: "usr_001",
    readerName: "Faizan Morkas",
    bookId: "book_013",
    bookTitle: catalogEntryForBookId("book_013").title,
    bookBarcode: "BK-013-001",
    copyId: "copy_013",
    copyBarcode: "CP-013-001",
    branchId: "branch_001",
    issueDate: daysFromNow(-60),
    dueDate: daysFromNow(-46),
    status: "overdue",
    currentPage: 3,
    fineAmount: 460,
  },
  // 14. Returned early, no reading
  {
    id: "loan_014",
    readerId: "usr_001",
    readerName: "Faizan Morkas",
    bookId: "book_014",
    bookTitle: catalogEntryForBookId("book_014").title,
    bookBarcode: "BK-014-001",
    copyId: "copy_014",
    copyBarcode: "CP-014-001",
    branchId: "branch_001",
    issueDate: daysFromNow(-20),
    dueDate: daysFromNow(-6),
    returnDate: daysFromNow(-12),
    status: "returned",
    currentPage: 5,
  },
];

export const mockEbooks: EBook[] = DAWAT_E_ISLAMI_CATALOG.map((book, index) => ({
  id: `eb_${String(index + 1).padStart(3, "0")}`,
  libraryId: "lib_001",
  ...book,
  accessType: index % 2 === 0 ? "free" : "members-only",
  isPublished: true,
  uploadedBy: "admin_001",
}));

export const mockBooks: Book[] = Array.from({ length: 14 }, (_, index) => {
  const bookNumber = index + 1;
  const catalogBook = DAWAT_E_ISLAMI_CATALOG[index % DAWAT_E_ISLAMI_CATALOG.length];
  const copies = 2 + (index % 5);
  const availableCopies = index % 4 === 1 ? 0 : index % 4 === 2 ? 1 : copies;

  return {
    id: `book_${String(bookNumber).padStart(3, "0")}`,
    branchId: "branch_001",
    name: catalogBook.title,
    category: catalogBook.category,
    totalPages: catalogBook.totalPages,
    publisher: catalogBook.publisher,
    authorName: catalogBook.author,
    description: catalogBook.description,
    copies,
    availableCopies,
    shelfNumber: `DI-${String(bookNumber).padStart(3, "0")}`,
    barcode: `BK-${String(bookNumber).padStart(3, "0")}-001`,
    coverColor: ["#065F46", "#1E3A5F", "#7C2D12", "#5B21B6"][index % 4],
    status: availableCopies === 0 ? "out-of-stock" : availableCopies === 1 ? "low-stock" : "available",
    createdAt: `2026-${String((index % 8) + 1).padStart(2, "0")}-01T00:00:00Z`,
  };
});

export function findMockBookByBarcode(value: string) {
  const barcode = value.trim().toUpperCase();
  return mockBooks.find(
    (book) =>
      book.barcode.toUpperCase() === barcode ||
      mockLoans.some(
        (loan) =>
          loan.bookId === book.id && loan.copyBarcode?.toUpperCase() === barcode
      )
  );
}

export function searchMockEbooks(query: string, category = "All") {
  const normalized = query.trim().toLowerCase();
  return mockEbooks.filter((ebook) => {
    const matchesQuery =
      !normalized ||
      ebook.title.toLowerCase().includes(normalized) ||
      ebook.author.toLowerCase().includes(normalized);
    const matchesCategory = category === "All" || ebook.category === category;
    return matchesQuery && matchesCategory;
  });
}

export const mockBorrowingHistory: LendingRecord[] = [
  {
    id: "loan_004",
    readerId: "usr_001",
    readerName: "Faizan Morkas",
    bookId: "book_004",
    bookTitle: catalogEntryForBookId("book_004").title,
    bookBarcode: "BK-004-001",
    branchId: "branch_001",
    issueDate: "2026-06-10T00:00:00Z",
    dueDate: "2026-06-24T00:00:00Z",
    returnDate: "2026-06-22T00:00:00Z",
    status: "returned",
    currentPage: catalogEntryForBookId("book_004").totalPages,
  },
  {
    id: "loan_005",
    readerId: "usr_001",
    readerName: "Faizan Morkas",
    bookId: "book_005",
    bookTitle: catalogEntryForBookId("book_005").title,
    bookBarcode: "BK-005-001",
    branchId: "branch_001",
    issueDate: "2026-05-20T00:00:00Z",
    dueDate: "2026-06-03T00:00:00Z",
    returnDate: "2026-06-01T00:00:00Z",
    status: "returned",
    currentPage: catalogEntryForBookId("book_005").totalPages,
  },
  {
    id: "loan_006",
    readerId: "usr_001",
    readerName: "Faizan Morkas",
    bookId: "book_006",
    bookTitle: catalogEntryForBookId("book_006").title,
    bookBarcode: "BK-006-001",
    branchId: "branch_001",
    issueDate: "2026-05-01T00:00:00Z",
    dueDate: "2026-05-15T00:00:00Z",
    returnDate: "2026-05-14T00:00:00Z",
    status: "returned",
    currentPage: catalogEntryForBookId("book_006").totalPages,
  },
];

export const mockNotifications: Notification[] = [
  {
    id: "notif_001",
    userId: "usr_001",
    title: "Book due tomorrow",
    message: `\"${catalogEntryForBookId("book_001").title}\" is due for return tomorrow. Please return it to avoid fines.`,
    type: "warning",
    read: false,
    createdAt: "2026-08-31T10:00:00Z",
  },
  {
    id: "notif_002",
    userId: "usr_001",
    title: "New ebook added",
    message: `\"${DAWAT_E_ISLAMI_CATALOG[1].title}\" by ${DAWAT_E_ISLAMI_CATALOG[1].author} has been added to the e-library.`,
    type: "info",
    read: false,
    createdAt: "2026-08-30T14:30:00Z",
  },
  {
    id: "notif_003",
    userId: "usr_001",
    title: "Overdue fine updated",
    message: `A fine of INR 50 has been applied for overdue return of \"${catalogEntryForBookId("book_005").title}\".`,
    type: "error",
    read: true,
    createdAt: "2026-08-28T09:15:00Z",
  },
  {
    id: "notif_004",
    userId: "usr_001",
    title: "Book returned successfully",
    message: `\"${catalogEntryForBookId("book_007").title}\" has been returned. Thank you!`,
    type: "success",
    read: true,
    createdAt: "2026-08-25T16:00:00Z",
  },
  {
    id: "notif_005",
    userId: "usr_001",
    title: "Welcome to LibraryOS",
    message: "Your account has been created. Start exploring our Islamic collection!",
    type: "info",
    read: true,
    createdAt: "2026-08-20T08:00:00Z",
  },
];

export const CATEGORIES = [
  "All",
  "Akhlaaq-o-Aadaab",
  "Seerah",
  "Other",
];

export const DONATION_PRESETS = [100, 250, 500, 1000];
