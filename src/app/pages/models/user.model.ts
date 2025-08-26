export interface User {
  id: string;
  username: string;
  email: string;
  password?: string;
  role: string;
  accountId: string | null;
  createdAt: string;
}

export enum UserRole {
  ADMIN = "admin",
  USER = "user",
  DEVELOPER = "developer",
}
