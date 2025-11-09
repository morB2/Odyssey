import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UserMinimal {
  _id?: string;
  firstName?: string;
  googleId?: string;
  avatar?: string;
}

interface UserStore {
  user: UserMinimal | null;
  setUser: (user: UserMinimal) => void;
  clearUser: () => void;
}

export const useUserStore = create<UserStore>()(
  persist(
    (set) => ({
      user: null,
      setUser: (user: UserMinimal) => set({ user }),
      clearUser: () => set({ user: null }),
    }),
    {
      name: 'user-storage',
    }
  )
);
