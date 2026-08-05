import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, Search, FileDown, FileSpreadsheet, File as FileIcon, Printer, ChevronLeft, ChevronRight } from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { analyticsService } from '@/services/api/systemStatusService';
import type { EnergyRecord } from '@/types';
import { formatCompactCurrency, formatNumber } from '@/utils/format';
import { useEffect } from 'react';

const PAGE_SIZE = 10;

export const ReportsPage = () => {
  const [data, setData] = useState<EnergyRecord[]>([]);
  const [query, setQuery] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    analyticsService.getDaily().then(setData);
  }, []);

  const filtered = useMemo(() => data.filter((d) => {
    const matchQuery = !query || d.label.toLowerCase().includes(query.toLowerCase());
    return matchQuery;
  }), [data, query]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const exportPlaceholder = (fmt: string) => () => {
    alert(`Export to ${fmt} — placeholder. Wire to a report service in production.`);
  };

  return (
    <div>
      <PageHeader title="Reports" subtitle="Energy consumption reports and exports"
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <button onClick={exportPlaceholder('PDF')} className="btn-ghost"><FileDown size={16} /> PDF</button>
            <button onClick={exportPlaceholder('Excel')} className="btn-ghost"><FileSpreadsheet size={16} /> Excel</button>
            <button onClick={exportPlaceholder('CSV')} className="btn-ghost"><FileIcon size={16} /> CSV</button>
            <button onClick={() => window.print()} className="btn-ghost"><Printer size={16} /> Print</button>
          </div>
        }
      />

      <Card className="p-4 mb-5">
        <div className="flex flex-col lg:flex-row gap-3 lg:items-center">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input value={query} onChange={(e) => { setQuery(e.target.value); setPage(1); }} placeholder="Search reports…" className="input-field !pl-9" />
          </div>
          <div className="flex items-center gap-2">
            <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="input-field !py-2 text-sm" />
            <span className="text-slate-400">to</span>
            <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="input-field !py-2 text-sm" />
          </div>
        </div>
      </Card>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800/40 text-slate-500 text-xs uppercase tracking-wide">
              <tr>
                <th className="text-left px-4 py-3 font-medium">#</th>
                <th className="text-left px-4 py-3 font-medium">Period</th>
                <th className="text-right px-4 py-3 font-medium">Energy (kWh)</th>
                <th className="text-right px-4 py-3 font-medium">Cost</th>
                <th className="text-left px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {pageItems.map((d, i) => (
                <motion.tr key={d.label} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <td className="px-4 py-3 text-slate-400 tabular-nums">{(page - 1) * PAGE_SIZE + i + 1}</td>
                  <td className="px-4 py-3 font-medium text-slate-700 dark:text-slate-200">{d.label}</td>
                  <td className="px-4 py-3 text-right tabular-nums text-slate-600 dark:text-slate-300">{formatNumber(d.kwh, 1)}</td>
                  <td className="px-4 py-3 text-right tabular-nums text-slate-600 dark:text-slate-300">{formatCompactCurrency(d.cost)}</td>
                  <td className="px-4 py-3"><Badge variant="success" dot>Completed</Badge></td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <div className="flex items-center justify-between mt-6">
        <p className="text-sm text-slate-500">Page {page} of {totalPages} · {filtered.length} records</p>
        <div className="flex items-center gap-1">
          <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="btn-ghost !p-2 disabled:opacity-40"><ChevronLeft size={16} /></button>
          <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="btn-ghost !p-2 disabled:opacity-40"><ChevronRight size={16} /></button>
        </div>
      </div>
    </div>
  );
};
