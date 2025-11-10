export type UserRole = "user" | "admin";

export interface User {
  _id?: string; 
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  birthday?: string; 
  preferences: any[]; 
  googleId?: string;
  avatar?: string;
  password?: string;
  createdAt?: string;
  updatedAt?: string;
}
