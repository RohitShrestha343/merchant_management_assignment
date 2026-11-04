export type UserRole = 'SALES' | 'REVIEWER' | 'ADMIN';
export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}
