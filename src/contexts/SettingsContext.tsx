import { createContext, useContext, useState, useCallback, ReactNode } from 'react';

export interface UserSettings {
  defaultStreamSource: string;
  autoPlayNextEpisode: boolean;
  videoQuality: string;
  playbackSpeed: number;
  showTitles: boolean;
  reducedMotion: boolean;
  compactMode: boolean;
}

const DEFAULT_SETTINGS: UserSettings = {
  defaultStreamSource: 'VidSrc Pro',
  autoPlayNextEpisode: true,
  videoQuality: 'auto',
  playbackSpeed: 1,
  showTitles: true,
  reducedMotion: false,
  compactMode: false,
};

interface SettingsContextType {
  settings: UserSettings;
  updateSetting: <K extends keyof UserSettings>(key: K, value: UserSettings[K]) => void;
  resetSettings: () => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<UserSettings>(() => {
    try {
      const stored = localStorage.getItem('stinkflix-settings');
      return stored ? { ...DEFAULT_SETTINGS, ...JSON.parse(stored) } : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  });

  const updateSetting = useCallback(<K extends keyof UserSettings>(key: K, value: UserSettings[K]) => {
    setSettings(prev => {
      const next = { ...prev, [key]: value };
      localStorage.setItem('stinkflix-settings', JSON.stringify(next));
      return next;
    });
  }, []);

  const resetSettings = useCallback(() => {
    setSettings(DEFAULT_SETTINGS);
    localStorage.removeItem('stinkflix-settings');
  }, []);

  return (
    <SettingsContext.Provider value={{ settings, updateSetting, resetSettings }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) throw new Error('useSettings must be used within SettingsProvider');
  return context;
}
