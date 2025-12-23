import { create } from "zustand";

interface SearchState {
  isOpen: boolean;
  searchTerm: string;
  shouldSearch: boolean;
  openSearch: (term?: string) => void;
  closeSearch: () => void;
  triggerSearch: (term: string) => void;
  clearShouldSearch: () => void;
}

export const useSearchStore = create<SearchState>((set) => ({
  isOpen: false,
  searchTerm: "",
  shouldSearch: false,
  openSearch: (term = "") =>
    set({ isOpen: true, searchTerm: term, shouldSearch: term.length > 0 }),
  closeSearch: () =>
    set({ isOpen: false, searchTerm: "" }),
  triggerSearch: (term: string) =>
    set({ isOpen: true, searchTerm: term, shouldSearch: true }),
  clearShouldSearch: () =>
    set({ shouldSearch: false }),
}));
