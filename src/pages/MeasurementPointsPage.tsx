import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutGrid, Table as TableIcon, Search, Star, ChevronLeft, ChevronRight, ArrowRight, MapPin, Building2, Clock,
} from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { GridSkeleton } from '@/components/ui/Skeleton';
import { ErrorState } from '@/components/ui/ErrorState';
import { measurementPointService } from '@/services/api/measurementPointService';
import { locationService } from '@/services/api/locationService';
import type { MeasurementPoint, Site, DeviceStatus } from '@/types';
import { timeAgo } from '@/utils/format';

const statusVariant: Record<DeviceStatus, 'success' | 'warning' | 'danger'> = {
  online: 'success', warning: 'warning', offline: 'danger',
};

const PAGE_SIZE = 9;

export const MeasurementPointsPage = () => {
  const navigate = useNavigate();
  const [points, setPoints] = useState<MeasurementPoint[]>([]);
  const [sites, setSites] = useState<Site[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [view, setView] = useState<'grid' | 'table'>('grid');
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | DeviceStatus>('all');
  const [siteFilter, setSiteFilter] = useState<'all' | string>('all');
  const [sort, setSort] = useState<'name' | 'device' | 'recent'>('name');
  const [page, setPage] = useState(1);
  const [favOnly, setFavOnly] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const [p, s] = await Promise.all([measurementPointService.getAll(), locationService.getSites()]);
        if (cancelled) return;
        setPoints(p); setSites(s); setLoading(false);
      } catch {
        if (!cancelled) { setError(true); setLoading(false); }
      }
    };
    load();
    return () => { cancelled = true; };
  }, []);

  const filtered = useMemo(() => {
    let r = points;
    if (query) r = r.filter((p) => p.deviceName.toLowerCase().includes(query.toLowerCase()) || p.deviceId.toLowerCase().includes(query.toLowerCase()));
    if (statusFilter !== 'all') r = r.filter((p) => p.status === statusFilter);
    if (siteFilter !== 'all') r = r.filter((p) => p.siteId === siteFilter);
    if (favOnly) r = r.filter((p) => p.favorite);
    r = [...r].sort((a, b) => {
      if (sort === 'name') return a.deviceName.localeCompare(b.deviceName);
      if (sort === 'device') return a.deviceId.localeCompare(b.deviceId);
      return new Date(b.lastUpdate).getTime() - new Date(a.lastUpdate).getTime();
    });
    return r;
  }, [points, query, statusFilter, siteFilter, sort, favOnly]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const toggleFav = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await measurementPointService.toggleFavorite(id);
    setPoints((p) => p.map((x) => (x.id === id ? { ...x, favorite: !x.favorite } : x)));
  };

  if (loading) return <><PageHeader title="Measurement Points" /><GridSkeleton count={9} /></>;
  if (error) return <ErrorState message="Failed to load measurement points." />;

  return (
    <div>
      <PageHeader title="Measurement Points" subtitle={`${filtered.length} devices across ${sites.length} sites`} />

      {/* Toolbar */}
      <Card className="p-4 mb-5">
        <div className="flex flex-col lg:flex-row gap-3 lg:items-center">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input value={query} onChange={(e) => { setQuery(e.target.value); setPage(1); }} placeholder="Search by name or device ID…" className="input-field !pl-9" />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value as DeviceStatus | 'all'); setPage(1); }} className="input-field !py-2 !w-auto text-sm">
              <option value="all">All status</option>
              <option value="online">Online</option>
              <option value="warning">Warning</option>
              <option value="offline">Offline</option>
            </select>
            <select value={siteFilter} onChange={(e) => { setSiteFilter(e.target.value); setPage(1); }} className="input-field !py-2 !w-auto text-sm">
              <option value="all">All sites</option>
              {sites.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
            <select value={sort} onChange={(e) => setSort(e.target.value as typeof sort)} className="input-field !py-2 !w-auto text-sm">
              <option value="name">Sort: Name</option>
              <option value="device">Sort: Device ID</option>
              <option value="recent">Sort: Recent</option>
            </select>
            <button onClick={() => setFavOnly((f) => !f)} className={`btn-ghost !py-2 ${favOnly ? '!text-warning-600 !bg-warning-500/10' : ''}`}>
              <Star size={16} fill={favOnly ? 'currentColor' : 'none'} /> Favorites
            </button>
            <div className="flex rounded-xl bg-slate-100 dark:bg-slate-800 p-1">
              <button onClick={() => setView('grid')} className={`p-1.5 rounded-lg ${view === 'grid' ? 'bg-white dark:bg-slate-700 text-brand-600 shadow-sm' : 'text-slate-400'}`}><LayoutGrid size={16} /></button>
              <button onClick={() => setView('table')} className={`p-1.5 rounded-lg ${view === 'table' ? 'bg-white dark:bg-slate-700 text-brand-600 shadow-sm' : 'text-slate-400'}`}><TableIcon size={16} /></button>
            </div>
          </div>
        </div>
      </Card>

      {view === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {pageItems.map((p, i) => (
            <motion.div key={p.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
              <Card className="p-5 cursor-pointer" onClick={() => navigate(`/detail/${p.id}`)}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-xl bg-brand-500/10 flex items-center justify-center text-brand-600"><Building2 size={18} /></div>
                    <div>
                      <p className="text-sm font-semibold text-slate-800 dark:text-white">{p.deviceName}</p>
                      <p className="text-xs text-slate-400">{p.deviceId}</p>
                    </div>
                  </div>
                  <button onClick={(e) => toggleFav(p.id, e)} className="text-slate-300 hover:text-warning-500">
                    <Star size={16} fill={p.favorite ? '#f59e0b' : 'none'} className={p.favorite ? 'text-warning-500' : ''} />
                  </button>
                </div>
                <div className="space-y-1.5 text-xs text-slate-500">
                  <div className="flex items-center gap-2"><MapPin size={12} /> {p.building}</div>
                  <div className="flex items-center gap-2"><Clock size={12} /> {timeAgo(p.lastUpdate)}</div>
                </div>
                <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100 dark:border-slate-700/60">
                  <Badge variant={statusVariant[p.status]} dot>{p.status}</Badge>
                  <span className="text-xs text-brand-600 font-medium flex items-center gap-1">Open <ArrowRight size={12} /></span>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800/40 text-slate-500 text-xs uppercase tracking-wide">
                <tr>
                  <th className="text-left px-4 py-3 font-medium">Device Name</th>
                  <th className="text-left px-4 py-3 font-medium">Device ID</th>
                  <th className="text-left px-4 py-3 font-medium">Building</th>
                  <th className="text-left px-4 py-3 font-medium">Latitude</th>
                  <th className="text-left px-4 py-3 font-medium">Longitude</th>
                  <th className="text-left px-4 py-3 font-medium">Status</th>
                  <th className="text-left px-4 py-3 font-medium">Last Update</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {pageItems.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 cursor-pointer transition-colors" onClick={() => navigate(`/detail/${p.id}`)}>
                    <td className="px-4 py-3 font-medium text-slate-800 dark:text-white">{p.deviceName}</td>
                    <td className="px-4 py-3 text-slate-500 tabular-nums">{p.deviceId}</td>
                    <td className="px-4 py-3 text-slate-500">{p.building}</td>
                    <td className="px-4 py-3 text-slate-500 tabular-nums">{p.latitude.toFixed(5)}</td>
                    <td className="px-4 py-3 text-slate-500 tabular-nums">{p.longitude.toFixed(5)}</td>
                    <td className="px-4 py-3"><Badge variant={statusVariant[p.status]} dot>{p.status}</Badge></td>
                    <td className="px-4 py-3 text-slate-400">{timeAgo(p.lastUpdate)}</td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={(e) => toggleFav(p.id, e)} className="text-slate-300 hover:text-warning-500">
                        <Star size={14} fill={p.favorite ? '#f59e0b' : 'none'} className={p.favorite ? 'text-warning-500' : ''} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Pagination */}
      <div className="flex items-center justify-between mt-6">
        <p className="text-sm text-slate-500">Page {page} of {totalPages} · {filtered.length} devices</p>
        <div className="flex items-center gap-1">
          <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="btn-ghost !p-2 disabled:opacity-40"><ChevronLeft size={16} /></button>
          <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="btn-ghost !p-2 disabled:opacity-40"><ChevronRight size={16} /></button>
        </div>
      </div>
    </div>
  );
};
