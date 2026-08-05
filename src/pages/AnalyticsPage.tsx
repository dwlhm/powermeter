import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, Download } from 'lucide-react';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Legend, RadialBarChart, RadialBar } from 'recharts';
import { PageHeader } from '@/components/PageHeader';
import { Card } from '@/components/ui/Card';
import { GridSkeleton } from '@/components/ui/Skeleton';
import { ErrorState } from '@/components/ui/ErrorState';
import { analyticsService } from '@/services/api/systemStatusService';
import type { EnergyRecord } from '@/types';
import { formatCompactCurrency, formatNumber } from '@/utils/format';

type Range = 'daily' | 'weekly' | 'monthly' | 'yearly';

const PIE_COLORS = ['#3b82f6', '#0891b2', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export const AnalyticsPage = () => {
  const [range, setRange] = useState<Range>('daily');
  const [data, setData] = useState<EnergyRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      try {
        const d = await (range === 'daily' ? analyticsService.getDaily() : range === 'weekly' ? analyticsService.getWeekly() : range === 'monthly' ? analyticsService.getMonthly() : analyticsService.getYearly());
        if (cancelled) return;
        setData(d); setLoading(false); setError(false);
      } catch {
        if (!cancelled) { setError(true); setLoading(false); }
      }
    };
    load();
    return () => { cancelled = true; };
  }, [range]);

  const totalKwh = data.reduce((s, d) => s + d.kwh, 0);
  const totalCost = data.reduce((s, d) => s + d.cost, 0);
  const peak = data.reduce((m, d) => Math.max(m, d.kwh), 0);

  const pieData = data.slice(0, 7).map((d) => ({ name: d.label, value: d.kwh }));
  const gaugeData = [{ name: 'utilization', value: Math.min(100, (peak / (Math.max(...data.map((d) => d.kwh), 1))) * 80), fill: '#3b82f6' }];

  return (
    <div>
      <PageHeader title="Energy Analytics" subtitle="Consumption trends and insights"
        actions={
          <div className="flex rounded-xl bg-slate-100 dark:bg-slate-800 p-1">
            {(['daily', 'weekly', 'monthly', 'yearly'] as Range[]).map((r) => (
              <button key={r} onClick={() => setRange(r)} className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors ${range === r ? 'bg-white dark:bg-slate-700 text-brand-600 shadow-sm' : 'text-slate-400'}`}>{r}</button>
            ))}
          </div>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-6">
        <Card className="p-5"><p className="text-xs text-slate-500 uppercase tracking-wide">Total Energy</p><p className="text-2xl font-semibold text-slate-800 dark:text-white mt-1">{formatNumber(totalKwh, 0)} <span className="text-sm text-slate-400">kWh</span></p></Card>
        <Card className="p-5"><p className="text-xs text-slate-500 uppercase tracking-wide">Total Cost</p><p className="text-2xl font-semibold text-success-600 mt-1">{formatCompactCurrency(totalCost)}</p></Card>
        <Card className="p-5"><p className="text-xs text-slate-500 uppercase tracking-wide">Peak Demand</p><p className="text-2xl font-semibold text-slate-800 dark:text-white mt-1">{formatNumber(peak, 1)} <span className="text-sm text-slate-400">kWh</span></p></Card>
      </div>

      {loading ? <><GridSkeleton count={4} /></> : error ? <ErrorState message="Failed to load analytics." /> : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <ChartCard title="Line Chart — Energy (kWh)">
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={data}><CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:opacity-20" /><XAxis dataKey="label" tick={{ fontSize: 10 }} stroke="#94a3b8" /><YAxis tick={{ fontSize: 10 }} stroke="#94a3b8" /><Tooltip contentStyle={tooltipStyle} /><Line type="monotone" dataKey="kwh" stroke="#3b82f6" strokeWidth={2} dot={false} /></LineChart>
            </ResponsiveContainer>
          </ChartCard>
          <ChartCard title="Area Chart — Cost (Rp)">
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={data}><defs><linearGradient id="aCost" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#10b981" stopOpacity={0.4} /><stop offset="100%" stopColor="#10b981" stopOpacity={0} /></linearGradient></defs><CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:opacity-20" /><XAxis dataKey="label" tick={{ fontSize: 10 }} stroke="#94a3b8" /><YAxis tick={{ fontSize: 10 }} stroke="#94a3b8" /><Tooltip contentStyle={tooltipStyle} /><Area type="monotone" dataKey="cost" stroke="#10b981" fill="url(#aCost)" strokeWidth={2} /></AreaChart>
            </ResponsiveContainer>
          </ChartCard>
          <ChartCard title="Bar Chart — Energy (kWh)">
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={data}><CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:opacity-20" /><XAxis dataKey="label" tick={{ fontSize: 10 }} stroke="#94a3b8" /><YAxis tick={{ fontSize: 10 }} stroke="#94a3b8" /><Tooltip contentStyle={tooltipStyle} /><Bar dataKey="kwh" fill="#3b82f6" radius={[4, 4, 0, 0]} /></BarChart>
            </ResponsiveContainer>
          </ChartCard>
          <ChartCard title="Pie Chart — Distribution">
            <ResponsiveContainer width="100%" height={260}>
              <PieChart><Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label={{ fontSize: 10 }}>{pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}</Pie><Tooltip contentStyle={tooltipStyle} /><Legend wrapperStyle={{ fontSize: 10 }} /></PieChart>
            </ResponsiveContainer>
          </ChartCard>
          <ChartCard title="Gauge — Peak Utilization">
            <ResponsiveContainer width="100%" height={260}>
              <RadialBarChart innerRadius="60%" outerRadius="100%" data={gaugeData} startAngle={180} endAngle={0}><RadialBar background dataKey="value" cornerRadius={10} fill="#3b82f6" /></RadialBarChart>
            </ResponsiveContainer>
          </ChartCard>
          <ChartCard title="Combined — Energy & Cost">
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={data}><CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:opacity-20" /><XAxis dataKey="label" tick={{ fontSize: 10 }} stroke="#94a3b8" /><YAxis yAxisId="l" tick={{ fontSize: 10 }} stroke="#94a3b8" /><YAxis yAxisId="r" orientation="right" tick={{ fontSize: 10 }} stroke="#94a3b8" /><Tooltip contentStyle={tooltipStyle} /><Legend wrapperStyle={{ fontSize: 11 }} /><Bar yAxisId="l" dataKey="kwh" fill="#3b82f6" radius={[4, 4, 0, 0]} /><Line yAxisId="r" type="monotone" dataKey="cost" stroke="#10b981" strokeWidth={2} dot={false} /></BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>
      )}
    </div>
  );
};

const tooltipStyle = { backgroundColor: 'rgba(15,23,42,0.92)', border: 'none', borderRadius: 12, fontSize: 12, color: '#e2e8f0' } as const;

const ChartCard = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <Card className="p-5"><h4 className="text-sm font-medium text-slate-700 dark:text-slate-200 mb-3">{title}</h4>{children}</Card>
);
