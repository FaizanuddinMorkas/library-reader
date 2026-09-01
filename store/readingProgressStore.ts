import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";

const STORAGE_KEY = "reading_progress";

export interface ReadingProgress {
  [bookId: string]: {
    page: number;
    lastRead: string;
    totalPages: number;
  };
}

interface ReadingProgressState {
  progress: ReadingProgress;
  hasHydrated: boolean;
  hydrate: () => Promise<void>;
  saveProgress: (bookId: string, page: number, totalPages: number) => Promise<void>;
}

let hydrationPromise: Promise<void> | null = null;

export const useReadingProgressStore = create<ReadingProgressState>((set, get) => ({
  progress: {},
  hasHydrated: false,

  hydrate: async () => {
    if (get().hasHydrated) return;
    if (hydrationPromise) return hydrationPromise;

    hydrationPromise = (async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored) set({ progress: JSON.parse(stored) as ReadingProgress });
      } catch (error) {
        console.warn("Failed to load reading progress:", error);
      } finally {
        set({ hasHydrated: true });
        hydrationPromise = null;
      }
    })();

    return hydrationPromise;
  },

  saveProgress: async (bookId, page, totalPages) => {
    const progress: ReadingProgress = {
      ...get().progress,
      [bookId]: { page, lastRead: new Date().toISOString(), totalPages },
    };

    set({ progress });

    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    } catch (error) {
      console.warn("Failed to save reading progress:", error);
    }
  },
}));
