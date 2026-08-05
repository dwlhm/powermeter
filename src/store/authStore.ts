import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, Role } from '@/types';
import { STORAGE_KEYS, ROLE_PERMISSIONS } from '@/constants';
import { delay } from '@/utils/async';

// Auth store.
//
// Today: simulate login against a hardcoded user table.
// Tomorrow: replace `login` body with `apiClient.post('/auth/login')`
// and store the returned JWT. The store shape (user + role) stays the same,
// so no component needs to change.

const DUMMY_USERS: Record<string, { password: string; user: Omit<User, 'id'> }> = {
  admin: { password: 'admin', user: { username: 'admin', displayName: 'System Administrator', role: 'Administrator', avatarColor: '#0ea5e9' } },
  engineer: { password: 'engineer', user: { username: 'engineer', displayName: 'Jane Engineer', role: 'Engineer', avatarColor: '#10b981' } },
  operator: { password: 'operator', user: { username: 'operator', displayName: 'Bob Operator', role: 'Operator', avatarColor: '#f59e0b' } },
  viewer: { password: 'viewer', user: { username: 'viewer', displayName: 'Ann Viewer', role: 'Viewer', avatarColor: '#64748b' } },
};

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (username: string, password: string, remember: boolean) => Promise<boolean>;
  logout: () => void;
  hasPermission: (resource: string) => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (username, password, remember) => {
        set({ isLoading: true, error: null });
        await delay(900); // simulate network round-trip
        const entry = DUMMY_USERS[username.toLowerCase()];
        if (!entry || entry.password !== password) {
          set({ isLoading: false, error: 'Invalid username or password' });
          return false;
        }
        const user: User = { id: crypto.randomUUID(), ...entry.user };
        set({ user, isAuthenticated: true, isLoading: false, error: null });
        // `remember` controls storage persistence; zustand persist already
        // keeps state in localStorage, so we only clear it when not remembered.
        if (!remember) sessionStorage.setItem(STORAGE_KEYS.auth, 'session');
        return true;
      },

      logout: () => set({ user: null, isAuthenticated: false, error: null }),

      hasPermission: (resource: string) => {
        const { user } = get();
        if (!user) return false;
        const perms: string[] = ROLE_PERMISSIONS[user.role];
        return perms.includes('*') || perms.includes(resource);
      },
    }),
    { name: STORAGE_KEYS.auth },
  ),
);

export const ROLES: Role[] = ['Administrator', 'Engineer', 'Operator', 'Viewer'];
