export interface User {
  id: string;
  email: string;
  role?: string;
  is_admin?: boolean;
  [key: string]: any;
}
