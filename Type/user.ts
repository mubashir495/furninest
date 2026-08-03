export type UserRole = 'ADMIN' | 'SELLER' | 'CUSTOMER';

export interface User {
  id: string;
  _id?: string;
  fullName: string;
  email: string;
  phone?: string;
  role: UserRole;
  isActive?: boolean;
  isEmailVerified?: boolean;
  lastLogin?: string;
  createdAt?: string;
  created_date?: string;
}

export interface PaginatedMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaginatedUsers {
  data: User[];
  meta: PaginatedMeta;
}
