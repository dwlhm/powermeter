// Central icon map so nav items can reference icons by name without
// importing every lucide icon into the layout module.
import {
  LayoutDashboard, MapPin, Gauge, BellRing, History, BarChart3,
  Calculator, FileText, Settings, type LucideIcon,
} from 'lucide-react';

export const NAV_ICONS: Record<string, LucideIcon> = {
  LayoutDashboard,
  MapPin,
  Gauge,
  BellRing,
  History,
  BarChart3,
  Calculator,
  FileText,
  Settings,
};
