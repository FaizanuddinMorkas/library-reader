export interface ReaderAddress {
  line: string;
  city: string;
  state: string;
  pincode: string;
  district?: string;
}

export interface ReaderKyc {
  idType: string;
  idNumber?: string;
  idNumberLast4?: string;
}

export interface Reader {
  id: string;
  readerId: string;
  userId?: string;
  branchId: string;
  libraryId?: string;
  fullName: string;
  email: string;
  phone: string;
  address: ReaderAddress;
  kyc?: ReaderKyc;
  cardNumber?: string;
  status: "active" | "inactive";
  createdAt: string;
  libraryName?: string;
  branchName?: string;
}

export interface LendingRecord {
  id: string;
  readerId: string;
  readerName: string;
  bookId: string;
  bookTitle: string;
  bookBarcode: string;
  copyId?: string;
  copyBarcode?: string;
  branchId: string;
  issueDate: string;
  dueDate: string;
  returnDate?: string;
  status: "checked-out" | "returned" | "overdue";
  currentPage?: number;
  pagesReadFrom?: number;
  pagesReadTo?: number;
  pagesReadCount?: number;
  currentLendingPagesReadCount?: number;
  fineAmount?: number;
  book?: LoanBook | null;
}

export interface ReadingProgressEntry {
  id: string;
  loanId: string;
  pagesReadFrom?: number;
  pagesReadTo?: number;
  pagesReadCount: number;
  createdAt: string;
}

export interface LendingReadingPeriod {
  loanId: string;
  issueDate: string;
  dueDate?: string;
  returnDate?: string;
  status: LendingRecord["status"];
  pagesReadCount: number;
  legacySummary: boolean;
}

export interface BookReadingHistory {
  data: ReadingProgressEntry[];
  lendingPeriods: LendingReadingPeriod[];
  bookPagesReadTotal: number;
  total: number;
  page: number;
  limit: number;
}

export interface LoanBook {
  id: string;
  name: string;
  isbn?: string;
  category?: string;
  categoryId?: string;
  totalPages?: number;
  publisher?: string;
  authorId?: string;
  authorName?: string;
  description?: string;
  coverUrl?: string;
}

export type BorrowRequestStatus = "pending" | "issued" | "rejected" | "cancelled" | "expired";
export interface BorrowRequest {
  id: string;
  bookId: string;
  bookTitle: string;
  requestedCopyId: string;
  requestedCopyBarcode: string;
  issuedCopyId?: string;
  issuedCopyBarcode?: string;
  status: BorrowRequestStatus;
  expiresAt: string;
  rejectionReason?: string;
  createdAt: string;
}

export interface VisitorLog {
  id: string;
  branchId: string;
  readerId?: string;
  readerName: string;
  type: "reader" | "guest";
  entryTime: string;
  exitTime?: string;
  date: string;
}
