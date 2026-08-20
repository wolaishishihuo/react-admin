import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { PERSIST_VERSION } from '@/stores/persist';

const SEARCH_HISTORY_MAX = 10;

interface SearchHistoryState {
  searchHistory: string[];
}

interface SearchHistoryStore extends SearchHistoryState {
  setSearchHistory: (searchHistory: string[]) => void;
}

export const useSearchHistoryStore = create<SearchHistoryStore>()(
  persist(
    set => ({
      searchHistory: [],
      setSearchHistory: searchHistory => set({ searchHistory })
    }),
    {
      name: 'search-history-state',
      version: PERSIST_VERSION,
      partialize: state => ({ searchHistory: state.searchHistory })
    }
  )
);

export const addSearchHistory = (path: string) => {
  const { searchHistory, setSearchHistory } = useSearchHistoryStore.getState();
  setSearchHistory([path, ...searchHistory.filter(item => item !== path)].slice(0, SEARCH_HISTORY_MAX));
};

export const removeSearchHistory = (path: string) => {
  const { searchHistory, setSearchHistory } = useSearchHistoryStore.getState();
  setSearchHistory(searchHistory.filter(item => item !== path));
};
