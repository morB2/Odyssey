import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { UserRole } from '../models/user.model';

interface UserMinimal {
  _id?: string;
  firstName?: string;
  googleId?: string;
  avatar?: string;
  role?: UserRole;
}

interface UserStore {
  user: UserMinimal | null;
  token: string | null;
  setUser: (user: UserMinimal, token?: string) => void;
  clearUser: () => void;
}

export const useUserStore = create<UserStore>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      setUser: (user: UserMinimal, token?: string) =>
        set({ user, token: token || null }),
      clearUser: () => set({ user: null, token: null }),
    }),
    {
      name: 'user-storage',
    }
  )
);
