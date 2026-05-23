import { createContext, useContext, useState, useCallback, ReactNode } from 'react';

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: number;
}

const DEFAULT_ACHIEVEMENTS: Achievement[] = [
  { id: 'first_stream', name: 'First Stream', description: 'Watched your first stream', icon: '▶️', unlocked: false },
  { id: 'movie_marathon', name: 'Movie Marathon', description: 'Watched 10 movies', icon: '🎬', unlocked: false },
  { id: 'binge_watcher', name: 'Binge Watcher', description: 'Watched 5 episodes in a row', icon: '📺', unlocked: false },
  { id: 'anime_explorer', name: 'Anime Explorer', description: 'Streamed your first anime', icon: '⚡', unlocked: false },
  { id: 'watchlist_collector', name: 'Watchlist Collector', description: 'Added 20 items to watchlist', icon: '🔖', unlocked: false },
  { id: 'search_master', name: 'Search Master', description: 'Performed 50 searches', icon: '🔍', unlocked: false },
  { id: 'night_owl', name: 'Night Owl', description: 'Streamed at 3 AM', icon: '🦉', unlocked: false },
  { id: 'variety_king', name: 'Variety King', description: 'Watched movies, TV, and anime', icon: '👑', unlocked: false },
  { id: 'share_shark', name: 'Share Shark', description: 'Shared content 10 times', icon: '🦈', unlocked: false },
  { id: 'streak_starter', name: 'Streak Starter', description: 'Used the app 7 days in a row', icon: '🔥', unlocked: false },
];

interface AchievementsContextType {
  achievements: Achievement[];
  unlockAchievement: (id: string) => void;
  getUnlockedCount: () => number;
  isUnlocked: (id: string) => boolean;
}

const AchievementsContext = createContext<AchievementsContextType | undefined>(undefined);

export function AchievementsProvider({ children }: { children: ReactNode }) {
  const [achievements, setAchievements] = useState<Achievement[]>(() => {
    try {
      const stored = localStorage.getItem('stinkflix-achievements');
      if (stored) {
        const parsed = JSON.parse(stored);
        return DEFAULT_ACHIEVEMENTS.map(def => {
          const found = parsed.find((a: Achievement) => a.id === def.id);
          return found || def;
        });
      }
    } catch {}
    return DEFAULT_ACHIEVEMENTS;
  });

  const unlockAchievement = useCallback((id: string) => {
    setAchievements(prev => {
      const updated = prev.map(a => {
        if (a.id === id && !a.unlocked) {
          return { ...a, unlocked: true, unlockedAt: Date.now() };
        }
        return a;
      });
      localStorage.setItem('stinkflix-achievements', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const getUnlockedCount = useCallback(() => {
    return achievements.filter(a => a.unlocked).length;
  }, [achievements]);

  const isUnlocked = useCallback((id: string) => {
    return achievements.some(a => a.id === id && a.unlocked);
  }, [achievements]);

  return (
    <AchievementsContext.Provider value={{ achievements, unlockAchievement, getUnlockedCount, isUnlocked }}>
      {children}
    </AchievementsContext.Provider>
  );
}

export function useAchievements() {
  const context = useContext(AchievementsContext);
  if (!context) throw new Error('useAchievements must be used within AchievementsProvider');
  return context;
}
