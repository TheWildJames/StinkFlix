import { createContext, useContext, useState, useCallback, ReactNode } from 'react';

export interface HistoryItem {
  id: number;
  type: 'movie' | 'tv';
  title: string;
  poster_path: string | null;
  timestamp: number;
  episode?: number;
  season?: number;
}

interface HistoryContextType {
  history: HistoryItem[];
  addToHistory: (item: Omit<HistoryItem, 'timestamp'>) => void;
  removeFromHistory: (id: number) => void;
  clearHistory: () => void;
  getRecentViews: (limit?: number) => HistoryItem[];
  isInHistory: (id: number) => boolean;
}

const HistoryContext = createContext<HistoryContextType | undefined>(undefined);

export function HistoryProvider({ children }: { children: ReactNode }) {
  const [history, setHistory] = useState<HistoryItem[]>(() => {
    try {
      const stored = localStorage.getItem('stinkflix-history');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const addToHistory = useCallback((item: Omit<HistoryItem, 'timestamp'>) => {
    setHistory(prev => {
      const filtered = prev.filter(h => !(h.id === item.id && h.type === item.type));
      const newItem: HistoryItem = { ...item, timestamp: Date.now() };
      const next = [newItem, ...filtered].slice(0, 100);
      localStorage.setItem('stinkflix-history', JSON.stringify(next));
      return next;
    });
  }, []);

  const removeFromHistory = useCallback((id: number) => {
    setHistory(prev => {
      const next = prev.filter(h => h.id !== id);
      localStorage.setItem('stinkflix-history', JSON.stringify(next));
      return next;
    });
  }, []);

  const clearHistory = useCallback(() => {
    setHistory([]);
    localStorage.removeItem('stinkflix-history');
  }, []);

  const getRecentViews = useCallback((limit = 10) => {
    return history.slice(0, limit);
  }, [history]);

  const isInHistory = useCallback((id: number) => {
    return history.some(h => h.id === id);
  }, [history]);

  return (
    <HistoryContext.Provider value={{ history, addToHistory, removeFromHistory, clearHistory, getRecentViews, isInHistory }}>
      {children}
    </HistoryContext.Provider>
  );
}

export function useHistory() {
  const context = useContext(HistoryContext);
  if (!context) throw new Error('useHistory must be used within HistoryProvider');
  return context;
}
