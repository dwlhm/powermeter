import { useState } from 'react';
import { motion } from 'framer-motion';
import { Calculator, Zap } from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';
import { Card } from '@/components/ui/Card';
import { useSettingsStore } from '@/store/settingsStore';
import { formatCurrency, formatNumber } from '@/utils/format';

export const CostCalculatorPage = () => {
  const { tariff, setSettings } = useSettingsStore();
  const [tariffInput, setTariffInput] = useState(String(tariff));
  const [dailyKwh, setDailyKwh] = useState('634');

  const t = Number(tariffInput) || 0;
  const d = Number(dailyKwh) || 0;
  const dailyCost = d * t;
  const monthlyCost = dailyCost * 30;
  const yearlyCost = dailyCost * 365;

  const apply = () => setSettings({ tariff: t });

  return (
    <div>
      <PageHeader title="Energy Cost Calculator" subtitle="Estimate energy costs using your electricity tariff" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <Card className="p-6 lg:col-span-1">
          <h3 className="text-base font-semibold text-slate-800 dark:text-white mb-4 flex items-center gap-2"><Calculator size={18} /> Inputs</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Electricity Tariff (Rp / kWh)</label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm">Rp</span>
                <input type="number" value={tariffInput} onChange={(e) => setTariffInput(e.target.value)} className="input-field !pl-10" />
              </div>
              <p className="text-xs text-slate-400 mt-1">Default: Rp 1,445 / kWh (Indonesia)</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Daily Energy (kWh)</label>
              <input type="number" value={dailyKwh} onChange={(e) => setDailyKwh(e.target.value)} className="input-field" />
            </div>
            <button onClick={apply} className="btn-primary w-full"><Zap size={16} /> Apply tariff to system</button>
          </div>
        </Card>

        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-5">
          <CostCard label="Daily Cost" value={dailyCost} delay={0} />
          <CostCard label="Monthly Cost" value={monthlyCost} delay={0.05} />
          <CostCard label="Yearly Cost" value={yearlyCost} delay={0.1} />
          <Card className="p-6 sm:col-span-3">
            <h4 className="text-sm font-medium text-slate-700 dark:text-slate-200 mb-3">Breakdown</h4>
            <div className="space-y-2 text-sm">
              <Row label="Tariff" value={`${formatCurrency(t)} / kWh`} />
              <Row label="Daily energy" value={`${formatNumber(d, 1)} kWh`} />
              <Row label="Monthly energy" value={`${formatNumber(d * 30, 0)} kWh`} />
              <Row label="Yearly energy" value={`${formatNumber(d * 365, 0)} kWh`} />
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

const CostCard = ({ label, value, delay }: { label: string; value: number; delay: number }) => (
  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}>
    <Card className="p-6 h-full flex flex-col justify-between">
      <p className="text-xs text-slate-500 uppercase tracking-wide">{label}</p>
      <p className="text-2xl font-semibold text-slate-800 dark:text-white mt-2">{formatCurrency(value)}</p>
    </Card>
  </motion.div>
);

const Row = ({ label, value }: { label: string; value: string }) => (
  <div className="flex items-center justify-between py-1.5 border-b border-slate-100 dark:border-slate-800 last:border-0">
    <span className="text-slate-500">{label}</span>
    <span className="font-medium text-slate-700 dark:text-slate-200 tabular-nums">{value}</span>
  </div>
);
