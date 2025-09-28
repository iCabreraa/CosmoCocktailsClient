// Tipos para el nuevo sistema de usuarios unificado
export type UserRole = 'super_admin' | 'admin' | 'manager' | 'staff' | 'customer' | 'guest';
export type UserStatus = 'active' | 'inactive' | 'suspended' | 'pending' | 'banned';
export type AddressType = 'shipping' | 'billing' | 'both';

export interface User {
  id: string;
  email: string;
  full_name?: string;
  phone?: string;
  avatar_url?: string;
  role: UserRole;
  status: UserStatus;
  preferences: Record<string, any>;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
  last_login_at?: string;
}

export interface UserAddress {
  id: string;
  user_id: string;
  type: AddressType;
  name: string;
  street: string;
  city: string;
  postal_code: string;
  country: string;
  phone?: string;
  is_default: boolean;
  created_at: string;
}

export interface UserPreferences {
  user_id: string;
  newsletter: boolean;
  notifications: Record<string, any>;
  language: string;
  currency: string;
  created_at: string;
  updated_at: string;
}

export interface CreateUserData {
  email: string;
  full_name?: string;
  phone?: string;
  role?: UserRole;
  status?: UserStatus;
  preferences?: Record<string, any>;
  metadata?: Record<string, any>;
}

export interface UserFilters {
  role?: UserRole;
  status?: UserStatus;
  search?: string;
  created_after?: string;
  created_before?: string;
}

export interface PaginatedUsers {
  users: User[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}
