import { useState } from 'react';
import { Settings as SettingsIcon, Building2, Clock, Palette, DollarSign, Globe, Save } from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';
import { Card } from '@/components/ui/Card';
import { useSettingsStore } from '@/store/settingsStore';

export const SettingsPage = () => {
  const { setSettings, ...s } = useSettingsStore();
  const [form, setForm] = useState(s);
  const [saved, setSaved] = useState(false);

  const update = (k: keyof typeof form, v: string | number) => setForm((f) => ({ ...f, [k]: v }));

  const save = () => {
    setSettings(form);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div>
      <PageHeader title="Settings" subtitle="System configuration and preferences"
        actions={<button onClick={save} className="btn-primary"><Save size={16} /> {saved ? 'Saved!' : 'Save changes'}</button>}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Card className="p-6">
          <h3 className="text-base font-semibold text-slate-800 dark:text-white mb-4 flex items-center gap-2"><Building2 size={18} /> Organization</h3>
          <div className="space-y-4">
            <Field label="Company Name" value={form.companyName} onChange={(v) => update('companyName', v)} />
            <Field label="Plant Name" value={form.plantName} onChange={(v) => update('plantName', v)} />
            <Field label="Site Name" value={form.siteName} onChange={(v) => update('siteName', v)} />
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-base font-semibold text-slate-800 dark:text-white mb-4 flex items-center gap-2"><Clock size={18} /> Monitoring</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Refresh Interval</label>
              <select value={form.refreshInterval} onChange={(e) => update('refreshInterval', Number(e.target.value))} className="input-field">
                <option value={1000}>1 second</option>
                <option value={2000}>2 seconds</option>
                <option value={5000}>5 seconds</option>
                <option value={10000}>10 seconds</option>
              </select>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-base font-semibold text-slate-800 dark:text-white mb-4 flex items-center gap-2"><Palette size={18} /> Appearance</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Theme</label>
              <div className="flex rounded-xl bg-slate-100 dark:bg-slate-800 p-1 w-fit">
                {(['light', 'dark'] as const).map((t) => (
                  <button key={t} onClick={() => update('theme', t)} className={`px-4 py-1.5 rounded-lg text-sm font-medium capitalize transition-colors ${form.theme === t ? 'bg-white dark:bg-slate-700 text-brand-600 shadow-sm' : 'text-slate-400'}`}>{t}</button>
                ))}
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-base font-semibold text-slate-800 dark:text-white mb-4 flex items-center gap-2"><DollarSign size={18} /> Tariff & Locale</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Electricity Tariff (Rp / kWh)</label>
              <input type="number" value={form.tariff} onChange={(e) => update('tariff', Number(e.target.value))} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Language</label>
              <select value={form.language} onChange={(e) => update('language', e.target.value)} className="input-field">
                <option>English</option><option>Bahasa Indonesia</option><option>Deutsch</option><option>日本語</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Timezone</label>
              <select value={form.timezone} onChange={(e) => update('timezone', e.target.value)} className="input-field">
                <option>Asia/Jakarta (WIB, UTC+7)</option><option>Asia/Makassar (WITA, UTC+8)</option><option>Asia/Jayapura (WIT, UTC+9)</option><option>UTC</option>
              </select>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

const Field = ({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) => (
  <div>
    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">{label}</label>
    <input value={value} onChange={(e) => onChange(e.target.value)} className="input-field" />
  </div>
);
