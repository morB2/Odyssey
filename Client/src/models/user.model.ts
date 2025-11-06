// src/types/User.ts

export type UserRole = "user" | "admin";

export interface User {
  _id?: string; // יגיע אוטומטית מהשרת
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  birthday?: string; // בצד הלקוח תאריך לרוב נשלח כמחרוזת
  preferences: any[]; // אפשר להחליף ל-type מפורט יותר אם תדעי מה יש שם
  googleId?: string;
  avatar?: string;
  password?: string; // נכלל רק אם משתמשת תומכת בזה
  createdAt?: string;
  updatedAt?: string;
}
