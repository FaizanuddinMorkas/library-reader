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
  fineAmount?: number;
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
