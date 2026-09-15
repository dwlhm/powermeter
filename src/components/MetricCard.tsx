import { type ReactNode } from 'react';
import { ArrowDownRight, ArrowUpRight, Minus } from 'lucide-react';
import { Area, AreaChart, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';
import { Card } from './ui/Card';
import { formatNumber } from '@/utils/format';

export interface MetricCardProps {
  label: string;
  value: number;
  unit: string;
  decimals?: number;
  icon: ReactNode;
  accent?: string; // tailwind text color class for icon
  trend?: number; // percentage
  series?: { v: number }[];
  lastUpdate?: string;
}

export const MetricCard = ({ label, value, unit, decimals = 1, icon, accent = 'text-brand-500', trend, series, lastUpdate }: MetricCardProps) => {
  const trendUp = (trend ?? 0) > 0.5;
  const trendDown = (trend ?? 0) < -0.5;
  const TrendIcon = trendUp ? ArrowUpRight : trendDown ? ArrowDownRight : Minus;
  const trendColor = trendUp ? 'text-success-600' : trendDown ? 'text-danger-600' : 'text-slate-400';

  const gradientId = `grad-${label.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;

  return (
    <Card className="metric-card">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2.5">
          <div className={`w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center ${accent}`}>{icon}</div>
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">{label}</span>
        </div>
        {trend !== undefined && (
          <span className={`flex items-center gap-0.5 text-xs font-semibold ${trendColor}`}>
            <TrendIcon size={14} />
            {Math.abs(trend).toFixed(1)}%
          </span>
        )}
      </div>

      <div className="flex items-baseline gap-1.5">
        <motion.span
          key={value}
          initial={{ opacity: 0.6 }}
          animate={{ opacity: 1 }}
          className="text-2xl font-semibold text-slate-800 dark:text-white tabular-nums"
        >
          {formatNumber(value, decimals)}
        </motion.span>
        <span className="text-sm text-slate-400">{unit}</span>
      </div>

      {series && series.length > 1 && (
        <div className="h-12 -mx-1">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={series}>
              <defs>
                <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <Area type="monotone" dataKey="v" stroke="#3b82f6" strokeWidth={1.5} fill={`url(#${gradientId})`} isAnimationActive={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      {lastUpdate && <span className="text-[11px] text-slate-400">Updated {lastUpdate}</span>}
    </Card>
  );
};
