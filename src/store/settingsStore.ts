import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AppSettings } from '@/types';
import { STORAGE_KEYS, DEFAULT_TARIFF } from '@/constants';

interface SettingsState extends AppSettings {
  setSettings: (partial: Partial<AppSettings>) => void;
  toggleTheme: () => void;
}

const defaults: AppSettings = {
  companyName: 'PT Energy Solutions',
  plantName: 'Tasikmalaya Plant',
  siteName: 'Hotel Horison Tasikmalaya',
  refreshInterval: 2000,
  theme: 'light',
  tariff: DEFAULT_TARIFF,
  language: 'English',
  timezone: 'Asia/Jakarta (WIB, UTC+7)',
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      ...defaults,
      setSettings: (partial) => set(partial),
      toggleTheme: () => set((s) => ({ theme: s.theme === 'light' ? 'dark' : 'light' })),
    }),
    { name: STORAGE_KEYS.settings },
  ),
);
