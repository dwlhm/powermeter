import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { History, LogIn, LogOut, Plug, PlugZap, BellRing, CheckCircle2, Settings as SettingsIcon } from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { PageLoader } from '@/components/ui/Spinner';
import { ErrorState } from '@/components/ui/ErrorState';
import { eventService } from '@/services/api/alarmService';
import type { EventType, SystemEvent } from '@/types';
import { formatDateTime } from '@/utils/format';

const eventMeta: Record<EventType, { icon: typeof LogIn; variant: 'info' | 'success' | 'warning' | 'danger' | 'neutral' }> = {
  Login: { icon: LogIn, variant: 'success' },
  Logout: { icon: LogOut, variant: 'neutral' },
  'Device Connected': { icon: PlugZap, variant: 'success' },
  'Device Disconnected': { icon: Plug, variant: 'danger' },
  'Alarm Triggered': { icon: BellRing, variant: 'warning' },
  'Alarm Cleared': { icon: CheckCircle2, variant: 'info' },
  'Configuration Updated': { icon: SettingsIcon, variant: 'neutral' },
};

export const EventsPage = () => {
  const [events, setEvents] = useState<SystemEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [query, setQuery] = useState('');
  const [type, setType] = useState<'all' | EventType>('all');
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 12;

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const e = await eventService.getAll();
        if (cancelled) return;
        setEvents(e); setLoading(false);
      } catch {
        if (!cancelled) { setError(true); setLoading(false); }
      }
    };
    load();
    return () => { cancelled = true; };
  }, []);

  const filtered = useMemo(() => events.filter((e) => {
    const matchQuery = !query || e.message.toLowerCase().includes(query.toLowerCase()) || e.user.toLowerCase().includes(query.toLowerCase());
    const matchType = type === 'all' || e.type === type;
    return matchQuery && matchType;
  }), [events, query, type]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  if (loading) return <><PageHeader title="Event Log" /><PageLoader /></>;
  if (error) return <ErrorState message="Failed to load events." />;

  return (
    <div>
      <PageHeader title="Event Log" subtitle="Audit trail of system and user activity" />

      <Card className="p-4 mb-5">
        <div className="flex flex-col sm:flex-row gap-3">
          <input value={query} onChange={(e) => { setQuery(e.target.value); setPage(1); }} placeholder="Search events…" className="input-field flex-1" />
          <select value={type} onChange={(e) => { setType(e.target.value as EventType | 'all'); setPage(1); }} className="input-field !py-2 !w-auto text-sm">
            <option value="all">All event types</option>
            {(Object.keys(eventMeta) as EventType[]).map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
      </Card>

      <Card className="overflow-hidden">
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {pageItems.map((e, i) => {
            const meta = eventMeta[e.type];
            const Icon = meta.icon;
            return (
              <motion.div key={e.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.02 }} className="flex items-center gap-4 px-5 py-3.5 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center bg-${meta.variant === 'neutral' ? 'slate' : meta.variant === 'info' ? 'brand' : meta.variant === 'success' ? 'success' : meta.variant === 'warning' ? 'warning' : 'danger'}-500/10`}>
                  <Icon size={16} className={meta.variant === 'neutral' ? 'text-slate-500' : meta.variant === 'info' ? 'text-brand-500' : meta.variant === 'success' ? 'text-success-600' : meta.variant === 'warning' ? 'text-warning-600' : 'text-danger-600'} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{e.message}</p>
                  <p className="text-xs text-slate-400">{e.type} · by {e.user}</p>
                </div>
                <Badge variant={meta.variant}>{e.type}</Badge>
                <span className="text-xs text-slate-400 whitespace-nowrap hidden sm:block">{formatDateTime(e.timestamp)}</span>
              </motion.div>
            );
          })}
        </div>
      </Card>

      <div className="flex items-center justify-between mt-6">
        <p className="text-sm text-slate-500">Page {page} of {totalPages} · {filtered.length} events</p>
        <div className="flex items-center gap-1">
          <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="btn-ghost disabled:opacity-40">Prev</button>
          <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="btn-ghost disabled:opacity-40">Next</button>
        </div>
      </div>
    </div>
  );
};
