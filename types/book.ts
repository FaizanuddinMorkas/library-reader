import type { ImageSourcePropType } from "react-native";

export interface Book {
  id: string;
  branchId: string;
  parentBookId?: string;
  volumeNo?: string;
  volumes?: BookVolumeSummary[];
  name: string;
  isbn?: string;
  category: string;
  categoryId?: string;
  totalPages: number;
  publisher: string;
  authorName: string;
  authorDob?: string;
  authorDod?: string;
  description?: string;
  copies: number;
  availableCopies: number;
  coverColor?: string;
  coverUrl?: string;
  shelfNumber: string;
  barcode: string;
  status: "available" | "low-stock" | "out-of-stock";
  isArchived?: boolean;
  createdAt: string;
}

export interface BookVolumeSummary {
  id: string;
  volumeNo?: string;
  copies: number;
  availableCopies: number;
  shelfNumber: string;
  branchId: string;
}

export interface BookCopy {
  id: string;
  bookId: string;
  branchId: string;
  barcode: string;
  shelfLocation: string;
  condition: "excellent" | "good" | "minor_wear" | "worn" | "damaged" | "unusable";
  status: "available" | "on_hold" | "checked-out" | "in_repair" | "lost" | "withdrawn";
  addedAt: string;
}

export interface EBook {
  id: string;
  libraryId: string;
  branchId?: string;
  title: string;
  author: string;
  category: string;
  categoryId?: string;
  coverUrl: string | ImageSourcePropType;
  pdfUrl: string;
  accessType: "free" | "members-only";
  isPublished: boolean;
  uploadedBy: string;
  uploaderScope?: string;
  description?: string;
  totalPages?: number;
  publishedYear?: number;
}

export interface BookStats {
  totalTitles: number;
  totalCopies: number;
  availableCopies: number;
  outOfStock: number;
}

export type CopyCondition = BookCopy["condition"];
export type CopyStatus = BookCopy["status"];
