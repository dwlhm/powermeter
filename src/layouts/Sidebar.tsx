import { NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { LogOut, X } from 'lucide-react';
import { Logo } from '@/components/Logo';
import { NAV_ICONS } from '@/components/navIcons';
import { NAV_ITEMS } from '@/constants';
import { useAuthStore } from '@/store/authStore';

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export const Sidebar = ({ open, onClose }: SidebarProps) => {
  const { user, hasPermission, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const items = NAV_ITEMS.filter((item) => hasPermission(item.key));

  const content = (
    <div className="h-full flex flex-col bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-r border-slate-200/60 dark:border-slate-800/60">
      <div className="flex items-center justify-between px-5 h-16 border-b border-slate-200/60 dark:border-slate-800/60">
        <Logo />
        <button onClick={onClose} className="lg:hidden btn-ghost !p-2">
          <X size={18} />
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {items.map((item) => {
          const Icon = NAV_ICONS[item.icon] ?? NAV_ICONS.LayoutDashboard;
          return (
            <NavLink
              key={item.key}
              to={item.key === 'dashboard' ? '/dashboard' : `/${item.key}`}
              className={({ isActive }) => `nav-link ${isActive ? 'nav-link-active' : ''}`}
              onClick={onClose}
            >
              <Icon size={18} />
              {item.label}
            </NavLink>
          );
        })}
      </nav>

      <div className="p-3 border-t border-slate-200/60 dark:border-slate-800/60">
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-semibold" style={{ background: user?.avatarColor }}>
            {user?.displayName.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-800 dark:text-white truncate">{user?.displayName}</p>
            <p className="text-xs text-slate-400 truncate">{user?.role}</p>
          </div>
          <button onClick={handleLogout} className="btn-ghost !p-2" title="Sign out">
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop */}
      <aside className="hidden lg:block w-64 shrink-0 h-screen sticky top-0">{content}</aside>

      {/* Mobile drawer */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm lg:hidden"
            />
            <motion.aside
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: 'spring', damping: 30, stiffness: 280 }}
              className="fixed top-0 left-0 z-50 w-64 h-screen lg:hidden"
            >
              {content}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
};
