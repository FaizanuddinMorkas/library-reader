export type UserRole = "super_admin" | "library_admin" | "branch_admin" | "reader";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  libraryId?: string;
  branchId?: string;
  readerId?: string;
  createdAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: "info" | "warning" | "success" | "error";
  read: boolean;
  createdAt: string;
}
