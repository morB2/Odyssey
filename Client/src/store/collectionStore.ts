import { create } from "zustand";
import type { Collection } from "../components/user/types";

interface CollectionsState {
  collections: Collection[];
  loading: boolean;

  setCollections: (collections: Collection[]) => void;
  addCollection: (collection: Collection) => void;
  updateCollection: (collection: Collection) => void;
  removeCollection: (collectionId: string) => void;
  setLoading: (loading: boolean) => void;
}

export const useCollectionsStore = create<CollectionsState>((set) => ({
  collections: [],
  loading: false,

  setCollections: (collections) =>
    set({ collections }),

  addCollection: (collection) =>
    set((state) => ({
      collections: [collection, ...state.collections],
    })),

  updateCollection: (updated) =>
    set((state) => ({
      collections: state.collections.map((c) =>
        c._id === updated._id ? updated : c
      ),
    })),

  removeCollection: (collectionId) =>
    set((state) => ({
      collections: state.collections.filter(
        (c) => c._id !== collectionId
      ),
    })),

  setLoading: (loading) => set({ loading }),
}));
