import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Zap, Activity, Gauge, Waves, Battery, Radio, DollarSign, TrendingUp, Server, Database, Wifi, Cpu, Plug, CheckCircle2, AlertTriangle, XCircle,
} from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';
import { MetricCard } from '@/components/MetricCard';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { GridSkeleton } from '@/components/ui/Skeleton';
import { ErrorState } from '@/components/ui/ErrorState';
import { powerMeterService } from '@/services/api/powerMeterService';
import { systemStatusService } from '@/services/api/systemStatusService';
import { measurementPointService } from '@/services/api/measurementPointService';
import type { PowerReading, SystemStatus, MeasurementPoint } from '@/types';
import { useSettingsStore } from '@/store/settingsStore';
import { formatCompactCurrency, formatNumber, timeAgo } from '@/utils/format';

const statusMeta = {
  operational: { variant: 'success' as const, icon: CheckCircle2, label: 'Operational' },
  degraded: { variant: 'warning' as const, icon: AlertTriangle, label: 'Degraded' },
  down: { variant: 'danger' as const, icon: XCircle, label: 'Down' },
};

export const DashboardPage = () => {
  const { tariff } = useSettingsStore();
  const [reading, setReading] = useState<PowerReading | null>(null);
  const [status, setStatus] = useState<SystemStatus | null>(null);
  const [points, setPoints] = useState<MeasurementPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const [pts, st] = await Promise.all([
          measurementPointService.getAll(),
          systemStatusService.getStatus(),
        ]);
        if (cancelled) return;
        setPoints(pts);
        setStatus(st);
        const ids = pts.map((p) => p.deviceId);
        const r = await powerMeterService.getDashboardAggregate(ids, tariff);
        if (cancelled) return;
        setReading(r);
        setLoading(false);
      } catch {
        if (!cancelled) { setError(true); setLoading(false); }
      }
    };
    load();
    const t = setInterval(load, 5000);
    return () => { cancelled = true; clearInterval(t); };
  }, [tariff]);

  if (loading) return <><PageHeader title="Dashboard Overview" subtitle="Real-time energy metrics across all sites" /><GridSkeleton count={8} /></>;
  if (error || !reading || !status) return <ErrorState message="Failed to load dashboard data." />;

  const spark = (key: keyof PowerReading) => [{ v: reading[key] as number * 0.97 }, { v: reading[key] as number * 0.99 }, { v: reading[key] as number * 1.0 }, { v: reading[key] as number * 0.98 }, { v: reading[key] as number }];
  const nowIso = new Date().toISOString();

  const metrics = [
    { label: 'Avg Voltage', value: (reading.voltageAN + reading.voltageBN + reading.voltageCN) / 3, unit: 'V', icon: <Zap size={18} />, trend: 1.2, series: spark('voltageAN') },
    { label: 'Avg Current', value: (reading.currentA + reading.currentB + reading.currentC) / 3, unit: 'A', icon: <Activity size={18} />, accent: 'text-accent-600', trend: -0.4, series: spark('currentA') },
    { label: 'Active Power', value: reading.totalActivePower, unit: 'kW', icon: <Gauge size={18} />, accent: 'text-success-600', trend: 2.1, series: spark('totalActivePower') },
    { label: 'Reactive Power', value: reading.totalReactivePower, unit: 'kVAR', icon: <Waves size={18} />, accent: 'text-warning-600', trend: -1.1, series: spark('totalReactivePower') },
    { label: 'Apparent Power', value: reading.totalApparentPower, unit: 'kVA', icon: <Battery size={18} />, accent: 'text-brand-500', trend: 0.8, series: spark('totalApparentPower') },
    { label: 'Power Factor', value: reading.averagePowerFactor, unit: '', decimals: 3, icon: <TrendingUp size={18} />, accent: 'text-accent-600', trend: 0.2, series: spark('averagePowerFactor') },
    { label: 'Frequency', value: reading.frequency, unit: 'Hz', decimals: 2, icon: <Radio size={18} />, accent: 'text-accent-600', trend: 0.05, series: spark('frequency') },
    { label: 'Energy', value: reading.energyKwh, unit: 'kWh', decimals: 0, icon: <Cpu size={18} />, accent: 'text-success-600', trend: 3.4, series: spark('energyKwh') },
    { label: "Today's Cost", value: reading.energyCost * 0.0035, unit: '', decimals: 0, icon: <DollarSign size={18} />, accent: 'text-warning-600', trend: 3.4, series: spark('energyCost'), raw: true },
    { label: 'Monthly Cost', value: reading.energyCost * 0.1, unit: '', decimals: 0, icon: <DollarSign size={18} />, accent: 'text-brand-500', trend: 2.8, series: spark('energyCost'), raw: true },
    { label: 'Yearly Cost', value: reading.energyCost * 1.2, unit: '', decimals: 0, icon: <DollarSign size={18} />, accent: 'text-success-600', trend: 1.9, series: spark('energyCost'), raw: true },
  ];

  const services = [
    { key: 'api', icon: Server }, { key: 'database', icon: Database }, { key: 'mqtt', icon: Radio },
    { key: 'websocket', icon: Wifi }, { key: 'server', icon: Cpu }, { key: 'devices', icon: Plug },
  ] as const;

  return (
    <div>
      <PageHeader title="Dashboard Overview" subtitle="Real-time energy metrics across all sites" />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 mb-8">
        {metrics.map((m, i) => (
          <motion.div key={m.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
            <MetricCard
              label={m.label}
              value={m.raw ? m.value : m.value}
              unit={m.raw ? '' : m.unit}
              decimals={m.decimals ?? 1}
              icon={m.icon}
              accent={m.accent}
              trend={m.trend}
              series={m.series}
              lastUpdate={timeAgo(nowIso)}
            />
            {m.raw && <div className="sr-only">{formatCompactCurrency(m.value)}</div>}
          </motion.div>
        ))}
      </div>

      {/* Override the cost cards to show currency */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
        {metrics.slice(-3).map((m) => (
          <Card key={`cost-${m.label}`} className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">{m.label}</p>
              <p className="text-xl font-semibold text-slate-800 dark:text-white mt-1">{formatCompactCurrency(m.value)}</p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-warning-500/10 flex items-center justify-center text-warning-600">
              <DollarSign size={20} />
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <Card className="lg:col-span-2 p-6">
          <h3 className="text-base font-semibold text-slate-800 dark:text-white mb-4">System Status</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {services.map(({ key, icon: Icon }) => {
              const svc = status[key];
              const meta = statusMeta[svc.status];
              return (
                <div key={key} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40">
                  <div className="w-9 h-9 rounded-lg bg-white dark:bg-slate-700 flex items-center justify-center text-slate-500">
                    <Icon size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-200 truncate">{svc.name}</p>
                    <Badge variant={meta.variant} dot>{meta.label}</Badge>
                  </div>
                  <span className="text-xs text-slate-400 tabular-nums">{svc.latency}ms</span>
                </div>
              );
            })}
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-base font-semibold text-slate-800 dark:text-white mb-4">Device Summary</h3>
          <div className="space-y-3">
            <SummaryRow label="Total Devices" value={points.length} variant="info" />
            <SummaryRow label="Online" value={points.filter((p) => p.status === 'online').length} variant="success" />
            <SummaryRow label="Warning" value={points.filter((p) => p.status === 'warning').length} variant="warning" />
            <SummaryRow label="Offline" value={points.filter((p) => p.status === 'offline').length} variant="danger" />
          </div>
          <div className="mt-5 pt-4 border-t border-slate-200 dark:border-slate-700">
            <div className="flex items-baseline justify-between">
              <span className="text-sm text-slate-500">Total Energy</span>
              <span className="text-lg font-semibold text-slate-800 dark:text-white">{formatNumber(reading.energyKwh, 0)} kWh</span>
            </div>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-sm text-slate-500">Estimated Cost</span>
              <span className="text-lg font-semibold text-success-600">{formatCompactCurrency(reading.energyCost)}</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

const SummaryRow = ({ label, value, variant }: { label: string; value: number; variant: 'info' | 'success' | 'warning' | 'danger' }) => (
  <div className="flex items-center justify-between">
    <Badge variant={variant} dot>{label}</Badge>
    <span className="text-sm font-semibold text-slate-700 dark:text-slate-200 tabular-nums">{value}</span>
  </div>
);
