import { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft, Zap, Activity, Gauge as GaugeIcon, Waves, Battery, Radio, TrendingUp, Clock, RefreshCw, Wifi, WifiOff, Building2, MapPin, Cpu,
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, BarChart, Bar, Area, AreaChart } from 'recharts';
import { PageHeader } from '@/components/PageHeader';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Gauge } from '@/components/Gauge';
import { PowerTriangle } from '@/components/PowerTriangle';
import { PageLoader } from '@/components/ui/Spinner';
import { ErrorState } from '@/components/ui/ErrorState';
import { measurementPointService } from '@/services/api/measurementPointService';
import { powerMeterService } from '@/services/api/powerMeterService';
import { useLiveTelemetry } from '@/hooks/useLiveTelemetry';
import { calcAverage, calcUnbalance } from '@/utils/randomPowerGenerator';
import { useSettingsStore } from '@/store/settingsStore';
import type { MeasurementPoint, PowerReading } from '@/types';
import { formatNumber, formatTime, formatCompactCurrency } from '@/utils/format';

type Period = '1m' | '5m' | '15m' | '1h' | '24h';

export const DetailDashboardPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { refreshInterval, tariff } = useSettingsStore();
  const [point, setPoint] = useState<MeasurementPoint | null>(null);
  const [loadingPoint, setLoadingPoint] = useState(true);
  const [period, setPeriod] = useState<Period>('1m');
  const [trend, setTrend] = useState<PowerReading[]>([]);

  const offline = point?.status === 'offline';
  const { reading, history } = useLiveTelemetry(point?.deviceId ?? '', 30, offline);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      if (!id) return;
      const p = await measurementPointService.getById(id);
      if (cancelled) return;
      setPoint(p ?? null);
      setLoadingPoint(false);
    };
    load();
    return () => { cancelled = true; };
  }, [id]);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      if (!point?.deviceId) return;
      const t = await powerMeterService.getTrend(point.deviceId, period, tariff);
      if (!cancelled) setTrend(t);
    };
    load();
    const timer = setInterval(load, refreshInterval);
    return () => { cancelled = true; clearInterval(timer); };
  }, [point?.deviceId, period, refreshInterval, tariff]);

  const liveSeries = useMemo(() => history.map((h) => ({
    time: formatTime(new Date(h.timestamp).toISOString()),
    vAN: +h.voltageAN.toFixed(1), vBN: +h.voltageBN.toFixed(1), vCN: +h.voltageCN.toFixed(1),
    iA: +h.currentA.toFixed(1), iB: +h.currentB.toFixed(1), iC: +h.currentC.toFixed(1),
    pA: +h.activePowerA.toFixed(2), pB: +h.activePowerB.toFixed(2), pC: +h.activePowerC.toFixed(2),
    totalP: +h.totalActivePower.toFixed(2), totalQ: +h.totalReactivePower.toFixed(2), totalS: +h.totalApparentPower.toFixed(2),
    freq: +h.frequency.toFixed(2), pf: +h.averagePowerFactor.toFixed(3),
  })), [history]);

  if (loadingPoint) return <PageLoader />;
  if (!point) return <ErrorState title="Device not found" message="The requested measurement point does not exist." action={<button onClick={() => navigate('/measurement')} className="btn-primary">Back to devices</button>} />;
  if (!reading) return <PageLoader />;

  const avgV = calcAverage(reading.voltageAN, reading.voltageBN, reading.voltageCN);
  const vUnbalance = calcUnbalance(reading.voltageAN, reading.voltageBN, reading.voltageCN);
  const avgI = calcAverage(reading.currentA, reading.currentB, reading.currentC);
  const iUnbalance = calcUnbalance(reading.currentA, reading.currentB, reading.currentC);

  const trendData = trend.length > 0 ? trend : history;
  const trendSeries = trendData.map((h) => ({
    time: formatTime(new Date(h.timestamp).toISOString()),
    vAN: +h.voltageAN.toFixed(1), vBN: +h.voltageBN.toFixed(1), vCN: +h.voltageCN.toFixed(1),
    iA: +h.currentA.toFixed(1), iB: +h.currentB.toFixed(1), iC: +h.currentC.toFixed(1),
    pA: +h.activePowerA.toFixed(2), pB: +h.activePowerB.toFixed(2), pC: +h.activePowerC.toFixed(2),
    totalP: +h.totalActivePower.toFixed(2), totalQ: +h.totalReactivePower.toFixed(2), totalS: +h.totalApparentPower.toFixed(2),
    freq: +h.frequency.toFixed(2), pf: +h.averagePowerFactor.toFixed(3),
    energy: +h.energyKwh.toFixed(1),
  }));

  return (
    <div>
      <button onClick={() => navigate(-1)} className="btn-ghost mb-4 -ml-2"><ArrowLeft size={16} /> Back</button>
      <PageHeader
        title={point.deviceName}
        subtitle={`${point.deviceId} · ${point.building}`}
        actions={
          <Badge variant={offline ? 'danger' : 'success'} dot>
            {offline ? <><WifiOff size={14} /> Disconnected</> : <><Wifi size={14} /> Connected</>}
          </Badge>
        }
      />

      {/* General info */}
      <Card className="p-5 mb-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          <InfoItem icon={<Cpu size={14} />} label="Device ID" value={point.deviceId} />
          <InfoItem icon={<Building2 size={14} />} label="Building" value={point.building} />
          <InfoItem icon={<MapPin size={14} />} label="Site" value={point.deviceName} />
          <InfoItem icon={<Wifi size={14} />} label="Comm Status" value={offline ? 'Disconnected' : 'Connected'} />
          <InfoItem icon={<Clock size={14} />} label="Last Update" value={formatTime(new Date().toISOString())} />
          <InfoItem icon={<RefreshCw size={14} />} label="Refresh" value={`${(refreshInterval / 1000).toFixed(0)}s`} />
        </div>
      </Card>

      {/* Voltage */}
      <Section title="Phase-to-Neutral Voltage" icon={<Zap size={16} />}>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
          <Card className="p-5 flex flex-col items-center justify-center">
            <Gauge value={avgV} min={200} max={260} unit="V" label="Average Voltage" color="#3b82f6" />
            <p className="text-xs text-slate-400 mt-2">Unbalance: <span className={vUnbalance > 3 ? 'text-warning-600 font-medium' : 'text-slate-500'}>{vUnbalance.toFixed(2)}%</span></p>
          </Card>
          <div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <PhaseCard label="Voltage A-N" value={reading.voltageAN} unit="V" color="text-brand-500" />
            <PhaseCard label="Voltage B-N" value={reading.voltageBN} unit="V" color="text-accent-600" />
            <PhaseCard label="Voltage C-N" value={reading.voltageCN} unit="V" color="text-success-600" />
            <PhaseCard label="Voltage A-B" value={reading.voltageAB} unit="V" color="text-brand-500" />
            <PhaseCard label="Voltage B-C" value={reading.voltageBC} unit="V" color="text-accent-600" />
            <PhaseCard label="Voltage C-A" value={reading.voltageCA} unit="V" color="text-success-600" />
          </div>
        </div>
      </Section>

      {/* Current */}
      <Section title="Current Monitoring" icon={<Activity size={16} />}>
        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-5">
          <PhaseCard label="Current A" value={reading.currentA} unit="A" color="text-brand-500" />
          <PhaseCard label="Current B" value={reading.currentB} unit="A" color="text-accent-600" />
          <PhaseCard label="Current C" value={reading.currentC} unit="A" color="text-success-600" />
          <Card className="p-5">
            <p className="text-xs text-slate-500 uppercase tracking-wide">Average Current</p>
            <p className="text-2xl font-semibold text-slate-800 dark:text-white mt-1">{formatNumber(avgI)} <span className="text-sm text-slate-400">A</span></p>
          </Card>
          <Card className="p-5">
            <p className="text-xs text-slate-500 uppercase tracking-wide">Current Unbalance</p>
            <p className={`text-2xl font-semibold mt-1 ${iUnbalance > 5 ? 'text-warning-600' : 'text-slate-800 dark:text-white'}`}>{iUnbalance.toFixed(2)}<span className="text-sm text-slate-400">%</span></p>
          </Card>
        </div>
      </Section>

      {/* Frequency + Power Factor */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-6">
        <Section title="Frequency" icon={<Radio size={16} />} noMargin>
          <div className="grid grid-cols-3 gap-4">
            <PhaseCard label="Current" value={reading.frequency} unit="Hz" decimals={2} color="text-brand-500" />
            <PhaseCard label="Minimum" value={49.8} unit="Hz" decimals={2} color="text-warning-600" />
            <PhaseCard label="Maximum" value={50.2} unit="Hz" decimals={2} color="text-danger-600" />
          </div>
        </Section>
        <Section title="Power Factor" icon={<TrendingUp size={16} />} noMargin>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <PhaseCard label="Cos φ A" value={reading.powerFactorA} unit="" decimals={3} color="text-brand-500" />
            <PhaseCard label="Cos φ B" value={reading.powerFactorB} unit="" decimals={3} color="text-accent-600" />
            <PhaseCard label="Cos φ C" value={reading.powerFactorC} unit="" decimals={3} color="text-success-600" />
            <PhaseCard label="Average" value={reading.averagePowerFactor} unit="" decimals={3} color="text-warning-600" />
          </div>
        </Section>
      </div>

      {/* Power Triangle */}
      <Section title="Power Triangle" icon={<Waves size={16} />}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <Card className="p-5 flex justify-center"><PowerTriangle active={reading.activePowerA} reactive={reading.reactivePowerA} apparent={reading.apparentPowerA} powerFactor={reading.powerFactorA} label="Phase A" color="#3b82f6" /></Card>
          <Card className="p-5 flex justify-center"><PowerTriangle active={reading.activePowerB} reactive={reading.reactivePowerB} apparent={reading.apparentPowerB} powerFactor={reading.powerFactorB} label="Phase B" color="#0891b2" /></Card>
          <Card className="p-5 flex justify-center"><PowerTriangle active={reading.activePowerC} reactive={reading.reactivePowerC} apparent={reading.apparentPowerC} powerFactor={reading.powerFactorC} label="Phase C" color="#10b981" /></Card>
          <Card className="p-5 flex justify-center"><PowerTriangle active={reading.totalActivePower} reactive={reading.totalReactivePower} apparent={reading.totalApparentPower} powerFactor={reading.averagePowerFactor} label="Total" color="#8b5cf6" /></Card>
        </div>
      </Section>

      {/* Three-phase energy */}
      <Section title="Three-Phase Energy" icon={<Battery size={16} />}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-slate-500 text-xs uppercase tracking-wide">
              <tr>
                <th className="text-left px-3 py-2 font-medium">Phase</th>
                <th className="text-right px-3 py-2 font-medium">kWh</th>
                <th className="text-right px-3 py-2 font-medium">kVARh</th>
                <th className="text-right px-3 py-2 font-medium">kVAh</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {(['A', 'B', 'C'] as const).map((ph) => (
                <tr key={ph}>
                  <td className="px-3 py-2.5 font-medium text-slate-700 dark:text-slate-200">Phase {ph}</td>
                  <td className="px-3 py-2.5 text-right tabular-nums text-slate-600 dark:text-slate-300">{formatNumber(reading.energyKwh / 3, 1)}</td>
                  <td className="px-3 py-2.5 text-right tabular-nums text-slate-600 dark:text-slate-300">{formatNumber((reading.energyKwh / 3) * 0.4, 1)}</td>
                  <td className="px-3 py-2.5 text-right tabular-nums text-slate-600 dark:text-slate-300">{formatNumber((reading.energyKwh / 3) / reading.averagePowerFactor, 1)}</td>
                </tr>
              ))}
              <tr className="bg-slate-50 dark:bg-slate-800/40 font-semibold">
                <td className="px-3 py-2.5 text-slate-800 dark:text-white">Total</td>
                <td className="px-3 py-2.5 text-right tabular-nums text-slate-800 dark:text-white">{formatNumber(reading.energyKwh, 1)}</td>
                <td className="px-3 py-2.5 text-right tabular-nums text-slate-800 dark:text-white">{formatNumber(reading.energyKwh * 0.4, 1)}</td>
                <td className="px-3 py-2.5 text-right tabular-nums text-slate-800 dark:text-white">{formatNumber(reading.energyKwh / reading.averagePowerFactor, 1)}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100 dark:border-slate-700/60">
          <span className="text-sm text-slate-500">Total Energy Cost</span>
          <span className="text-lg font-semibold text-success-600">{formatCompactCurrency(reading.energyCost)}</span>
        </div>
      </Section>

      {/* Trend monitoring */}
      <Section title="Trend Monitoring" icon={<GaugeIcon size={16} />}
        action={
          <div className="flex rounded-xl bg-slate-100 dark:bg-slate-800 p-1">
            {(['1m', '5m', '15m', '1h', '24h'] as Period[]).map((p) => (
              <button key={p} onClick={() => setPeriod(p)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${period === p ? 'bg-white dark:bg-slate-700 text-brand-600 shadow-sm' : 'text-slate-400'}`}>{p}</button>
            ))}
          </div>
        }
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <ChartCard title="Voltage (V)">
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={trendSeries}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:opacity-20" />
                <XAxis dataKey="time" tick={{ fontSize: 10 }} stroke="#94a3b8" />
                <YAxis tick={{ fontSize: 10 }} stroke="#94a3b8" />
                <Tooltip contentStyle={tooltipStyle} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Line type="monotone" dataKey="vAN" stroke="#3b82f6" dot={false} strokeWidth={1.5} isAnimationActive={false} />
                <Line type="monotone" dataKey="vBN" stroke="#0891b2" dot={false} strokeWidth={1.5} isAnimationActive={false} />
                <Line type="monotone" dataKey="vCN" stroke="#10b981" dot={false} strokeWidth={1.5} isAnimationActive={false} />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Current (A)">
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={trendSeries}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:opacity-20" />
                <XAxis dataKey="time" tick={{ fontSize: 10 }} stroke="#94a3b8" />
                <YAxis tick={{ fontSize: 10 }} stroke="#94a3b8" />
                <Tooltip contentStyle={tooltipStyle} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Line type="monotone" dataKey="iA" stroke="#3b82f6" dot={false} strokeWidth={1.5} isAnimationActive={false} />
                <Line type="monotone" dataKey="iB" stroke="#0891b2" dot={false} strokeWidth={1.5} isAnimationActive={false} />
                <Line type="monotone" dataKey="iC" stroke="#10b981" dot={false} strokeWidth={1.5} isAnimationActive={false} />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Active Power per Phase (kW)">
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={trendSeries}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:opacity-20" />
                <XAxis dataKey="time" tick={{ fontSize: 10 }} stroke="#94a3b8" />
                <YAxis tick={{ fontSize: 10 }} stroke="#94a3b8" />
                <Tooltip contentStyle={tooltipStyle} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Area type="monotone" dataKey="pA" stackId="1" stroke="#3b82f6" fill="#3b82f640" isAnimationActive={false} />
                <Area type="monotone" dataKey="pB" stackId="1" stroke="#0891b2" fill="#0891b240" isAnimationActive={false} />
                <Area type="monotone" dataKey="pC" stackId="1" stroke="#10b981" fill="#10b98140" isAnimationActive={false} />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Total Power (kW / kVAR / kVA)">
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={trendSeries}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:opacity-20" />
                <XAxis dataKey="time" tick={{ fontSize: 10 }} stroke="#94a3b8" />
                <YAxis tick={{ fontSize: 10 }} stroke="#94a3b8" />
                <Tooltip contentStyle={tooltipStyle} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Line type="monotone" dataKey="totalP" stroke="#3b82f6" dot={false} strokeWidth={1.5} isAnimationActive={false} />
                <Line type="monotone" dataKey="totalQ" stroke="#f59e0b" dot={false} strokeWidth={1.5} isAnimationActive={false} />
                <Line type="monotone" dataKey="totalS" stroke="#10b981" dot={false} strokeWidth={1.5} isAnimationActive={false} />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Frequency (Hz)">
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={trendSeries}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:opacity-20" />
                <XAxis dataKey="time" tick={{ fontSize: 10 }} stroke="#94a3b8" />
                <YAxis domain={[49.5, 50.5]} tick={{ fontSize: 10 }} stroke="#94a3b8" />
                <Tooltip contentStyle={tooltipStyle} />
                <Line type="monotone" dataKey="freq" stroke="#3b82f6" dot={false} strokeWidth={1.5} isAnimationActive={false} />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Power Factor">
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={trendSeries}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:opacity-20" />
                <XAxis dataKey="time" tick={{ fontSize: 10 }} stroke="#94a3b8" />
                <YAxis domain={[0.7, 1]} tick={{ fontSize: 10 }} stroke="#94a3b8" />
                <Tooltip contentStyle={tooltipStyle} />
                <Line type="monotone" dataKey="pf" stroke="#10b981" dot={false} strokeWidth={1.5} isAnimationActive={false} />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Energy (kWh)">
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={trendSeries}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:opacity-20" />
                <XAxis dataKey="time" tick={{ fontSize: 10 }} stroke="#94a3b8" />
                <YAxis tick={{ fontSize: 10 }} stroke="#94a3b8" />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="energy" fill="#3b82f6" radius={[4, 4, 0, 0]} isAnimationActive={false} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>
      </Section>
    </div>
  );
};

const tooltipStyle = {
  backgroundColor: 'rgba(15,23,42,0.92)',
  border: 'none',
  borderRadius: 12,
  fontSize: 12,
  color: '#e2e8f0',
} as const;

const Section = ({ title, icon, children, action, noMargin }: { title: string; icon: React.ReactNode; children: React.ReactNode; action?: React.ReactNode; noMargin?: boolean }) => (
  <div className={noMargin ? 'mb-6' : 'mb-6'}>
    <div className="flex items-center justify-between mb-3">
      <h3 className="text-base font-semibold text-slate-800 dark:text-white flex items-center gap-2">{icon} {title}</h3>
      {action}
    </div>
    {children}
  </div>
);

const InfoItem = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) => (
  <div>
    <p className="text-xs text-slate-400 flex items-center gap-1.5">{icon} {label}</p>
    <p className="text-sm font-medium text-slate-700 dark:text-slate-200 mt-1 truncate">{value}</p>
  </div>
);

const PhaseCard = ({ label, value, unit, color = 'text-brand-500', decimals = 1 }: { label: string; value: number; unit: string; color?: string; decimals?: number }) => (
  <Card className="p-5">
    <p className="text-xs text-slate-500 uppercase tracking-wide">{label}</p>
    <motion.p key={value} initial={{ opacity: 0.6 }} animate={{ opacity: 1 }} className={`text-2xl font-semibold mt-1 ${color}`}>
      {formatNumber(value, decimals)} <span className="text-sm text-slate-400">{unit}</span>
    </motion.p>
  </Card>
);

const ChartCard = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <Card className="p-5">
    <h4 className="text-sm font-medium text-slate-700 dark:text-slate-200 mb-3">{title}</h4>
    {children}
  </Card>
);
