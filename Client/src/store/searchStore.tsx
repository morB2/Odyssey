import { create } from "zustand";

interface SearchState {
  isOpen: boolean;
  searchTerm: string;
  openSearch: (term?: string) => void;
  closeSearch: () => void;
}

export const useSearchStore = create<SearchState>((set) => ({
  isOpen: false,
  searchTerm: "",
  openSearch: (term = "") =>
    set({ isOpen: true, searchTerm: term }),
  closeSearch: () =>
    set({ isOpen: false, searchTerm: "" }),
}));
