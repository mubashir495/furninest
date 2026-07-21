export type UserRole = 'ADMIN' | 'SELLER' | 'CUSTOMER';

export interface User {
  id: string;
  _id?: string;
  fullName: string;
  email: string;
  role: UserRole;
  isActive?: boolean;
  isEmailVerified?: boolean;
  lastLogin?: string;
  createdAt?: string;
  created_date?: string;
}
