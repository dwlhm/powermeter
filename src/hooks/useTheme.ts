import { useEffect } from 'react';
import { useSettingsStore } from '@/store/settingsStore';

// Applies the active theme to <html> so Tailwind's `dark:` variants work.
export const useTheme = () => {
  const theme = useSettingsStore((s) => s.theme);
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') root.classList.add('dark');
    else root.classList.remove('dark');
  }, [theme]);
  return theme;
};
