import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { BellRing, CheckCircle2, Check, AlertTriangle, Info, ShieldAlert } from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { PageLoader } from '@/components/ui/Spinner';
import { ErrorState } from '@/components/ui/ErrorState';
import { alarmService } from '@/services/api/alarmService';
import type { Alarm, AlarmSeverity, AlarmStatus } from '@/types';
import { formatDateTime } from '@/utils/format';

const severityMeta: Record<AlarmSeverity, { variant: 'info' | 'warning' | 'danger'; icon: typeof Info }> = {
  Information: { variant: 'info', icon: Info },
  Warning: { variant: 'warning', icon: AlertTriangle },
  Critical: { variant: 'danger', icon: ShieldAlert },
};

const statusVariant: Record<AlarmStatus, 'info' | 'success' | 'neutral'> = {
  Active: 'info', Acknowledged: 'success', Cleared: 'neutral',
};

export const AlarmsPage = () => {
  const [alarms, setAlarms] = useState<Alarm[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [severity, setSeverity] = useState<'all' | AlarmSeverity>('all');
  const [status, setStatus] = useState<'all' | AlarmStatus>('all');

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const a = await alarmService.getAll();
        if (cancelled) return;
        setAlarms(a); setLoading(false);
      } catch {
        if (!cancelled) { setError(true); setLoading(false); }
      }
    };
    load();
    return () => { cancelled = true; };
  }, []);

  const filtered = useMemo(
    () => alarms.filter((a) => (severity === 'all' || a.severity === severity) && (status === 'all' || a.status === status)),
    [alarms, severity, status],
  );

  const counts = useMemo(() => ({
    active: alarms.filter((a) => a.status === 'Active').length,
    critical: alarms.filter((a) => a.severity === 'Critical' && a.status === 'Active').length,
    warning: alarms.filter((a) => a.severity === 'Warning' && a.status === 'Active').length,
  }), [alarms]);

  const ack = async (id: string) => { await alarmService.acknowledge(id); setAlarms([...(await alarmService.getAll())]); };
  const clear = async (id: string) => { await alarmService.clear(id); setAlarms([...(await alarmService.getAll())]); };

  if (loading) return <><PageHeader title="Alarm Management" /><PageLoader /></>;
  if (error) return <ErrorState message="Failed to load alarms." />;

  return (
    <div>
      <PageHeader title="Alarm Management" subtitle="Industrial alarms across all monitored devices" />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-6">
        <Card className="p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-danger-500/10 flex items-center justify-center text-danger-500"><ShieldAlert size={22} /></div>
          <div><p className="text-2xl font-semibold text-slate-800 dark:text-white">{counts.critical}</p><p className="text-xs text-slate-400">Critical Active</p></div>
        </Card>
        <Card className="p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-warning-500/10 flex items-center justify-center text-warning-500"><AlertTriangle size={22} /></div>
          <div><p className="text-2xl font-semibold text-slate-800 dark:text-white">{counts.warning}</p><p className="text-xs text-slate-400">Warning Active</p></div>
        </Card>
        <Card className="p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-brand-500/10 flex items-center justify-center text-brand-500"><BellRing size={22} /></div>
          <div><p className="text-2xl font-semibold text-slate-800 dark:text-white">{counts.active}</p><p className="text-xs text-slate-400">Total Active</p></div>
        </Card>
      </div>

      <Card className="p-4 mb-5">
        <div className="flex flex-wrap items-center gap-2">
          <select value={severity} onChange={(e) => setSeverity(e.target.value as AlarmSeverity | 'all')} className="input-field !py-2 !w-auto text-sm">
            <option value="all">All severities</option>
            <option value="Information">Information</option>
            <option value="Warning">Warning</option>
            <option value="Critical">Critical</option>
          </select>
          <select value={status} onChange={(e) => setStatus(e.target.value as AlarmStatus | 'all')} className="input-field !py-2 !w-auto text-sm">
            <option value="all">All statuses</option>
            <option value="Active">Active</option>
            <option value="Acknowledged">Acknowledged</option>
            <option value="Cleared">Cleared</option>
          </select>
        </div>
      </Card>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800/40 text-slate-500 text-xs uppercase tracking-wide">
              <tr>
                <th className="text-left px-4 py-3 font-medium">Severity</th>
                <th className="text-left px-4 py-3 font-medium">Type</th>
                <th className="text-left px-4 py-3 font-medium">Device</th>
                <th className="text-left px-4 py-3 font-medium">Message</th>
                <th className="text-left px-4 py-3 font-medium">Value</th>
                <th className="text-left px-4 py-3 font-medium">Status</th>
                <th className="text-left px-4 py-3 font-medium">Triggered</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filtered.map((a, i) => {
                const meta = severityMeta[a.severity];
                const Icon = meta.icon;
                return (
                  <motion.tr key={a.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="px-4 py-3"><Badge variant={meta.variant}><Icon size={12} /> {a.severity}</Badge></td>
                    <td className="px-4 py-3 font-medium text-slate-700 dark:text-slate-200">{a.type}</td>
                    <td className="px-4 py-3 text-slate-500">{a.deviceName}</td>
                    <td className="px-4 py-3 text-slate-500">{a.message}</td>
                    <td className="px-4 py-3 tabular-nums text-slate-500">{a.value} / {a.threshold}</td>
                    <td className="px-4 py-3"><Badge variant={statusVariant[a.status]} dot>{a.status}</Badge></td>
                    <td className="px-4 py-3 text-slate-400 whitespace-nowrap">{formatDateTime(a.triggeredAt)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        {a.status === 'Active' && <button onClick={() => ack(a.id)} className="btn-ghost !p-1.5" title="Acknowledge"><Check size={14} /></button>}
                        {a.status !== 'Cleared' && <button onClick={() => clear(a.id)} className="btn-ghost !p-1.5" title="Clear"><CheckCircle2 size={14} /></button>}
                      </div>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && <p className="text-center text-sm text-slate-400 py-12">No alarms match the current filters.</p>}
      </Card>
    </div>
  );
};
