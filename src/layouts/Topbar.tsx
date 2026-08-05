import { Menu, Sun, Moon, Bell, Search } from 'lucide-react';
import { useSettingsStore } from '@/store/settingsStore';
import { useAuthStore } from '@/store/authStore';

interface TopbarProps {
  onMenuClick: () => void;
}

export const Topbar = ({ onMenuClick }: TopbarProps) => {
  const { theme, toggleTheme } = useSettingsStore();
  const { user } = useAuthStore();

  return (
    <header className="sticky top-0 z-30 h-16 flex items-center gap-3 px-4 sm:px-6 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border-b border-slate-200/60 dark:border-slate-800/60">
      <button onClick={onMenuClick} className="lg:hidden btn-ghost !p-2">
        <Menu size={20} />
      </button>

      <div className="hidden md:flex items-center gap-2 flex-1 max-w-md">
        <div className="relative w-full">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search devices, sites, alarms…"
            className="input-field !py-2 !pl-9 text-sm"
          />
        </div>
      </div>

      <div className="flex items-center gap-1.5 ml-auto">
        <button className="btn-ghost !p-2 relative">
          <Bell size={18} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-danger-500" />
        </button>
        <button onClick={toggleTheme} className="btn-ghost !p-2" title="Toggle theme">
          {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
        </button>
        <div className="hidden sm:flex items-center gap-2 ml-2 pl-3 border-l border-slate-200 dark:border-slate-700">
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-semibold" style={{ background: user?.avatarColor }}>
            {user?.displayName.charAt(0)}
          </div>
          <div className="leading-tight">
            <p className="text-sm font-medium text-slate-800 dark:text-white">{user?.displayName}</p>
            <p className="text-[11px] text-slate-400">{user?.role}</p>
          </div>
        </div>
      </div>
    </header>
  );
};
