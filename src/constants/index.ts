import type { Role } from '@/types';

export const APP_NAME = 'SI-MOLIS';
export const APP_TAGLINE = 'Industrial Energy Management System';

export const STORAGE_KEYS = {
  auth: 'voltiq.auth',
  settings: 'voltiq.settings',
  theme: 'voltiq.theme',
} as const;

export const REFRESH_INTERVAL_MS = 2000;

export const ROLE_PERMISSIONS: Record<Role, string[]> = {
  Administrator: ['*'],
  Engineer: ['dashboard', 'maps', 'measurement', 'detail', 'alarms', 'events', 'analytics', 'cost', 'reports', 'settings'],
  Operator: ['dashboard', 'maps', 'measurement', 'detail', 'alarms', 'events', 'analytics', 'reports'],
  Viewer: ['dashboard', 'maps', 'measurement', 'detail', 'alarms', 'events', 'analytics', 'reports'],
};

export const NAV_ITEMS = [
  { key: 'dashboard', label: 'Dashboard', icon: 'LayoutDashboard' },
  { key: 'maps', label: 'Sites Map', icon: 'MapPin' },
  { key: 'measurement', label: 'Measurement Points', icon: 'Gauge' },
  { key: 'alarms', label: 'Alarms', icon: 'BellRing' },
  { key: 'events', label: 'Event Log', icon: 'History' },
  { key: 'analytics', label: 'Energy Analytics', icon: 'BarChart3' },
  { key: 'cost', label: 'Cost Calculator', icon: 'Calculator' },
  { key: 'reports', label: 'Reports', icon: 'FileText' },
  { key: 'settings', label: 'Settings', icon: 'Settings' },
] as const;

export const DEFAULT_TARIFF = 1445; // Rp / kWh

export const CURRENCY_LOCALE = 'id-ID';
export const CURRENCY_CODE = 'IDR';
