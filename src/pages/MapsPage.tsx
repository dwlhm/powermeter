import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, CircleMarker } from 'react-leaflet';
import L from 'leaflet';
import { motion } from 'framer-motion';
import { MapPin, ArrowRight, Radio } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/PageHeader';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { PageLoader } from '@/components/ui/Spinner';
import { ErrorState } from '@/components/ui/ErrorState';
import { locationService } from '@/services/api/locationService';
import { measurementPointService } from '@/services/api/measurementPointService';
import type { Site, MeasurementPoint } from '@/types';
import { formatNumber, timeAgo } from '@/utils/format';

// Custom marker icon (using a divIcon so we get a styled pin).
const makeIcon = (online: number, total: number) =>
  L.divIcon({
    className: 'voltiq-marker',
    html: `<div style="background:${online === total ? '#10b981' : online === 0 ? '#ef4444' : '#f59e0b'};width:22px;height:22px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3)"></div>`,
    iconSize: [22, 22],
    iconAnchor: [11, 22],
  });

export const MapsPage = () => {
  const navigate = useNavigate();
  const [sites, setSites] = useState<Site[]>([]);
  const [points, setPoints] = useState<MeasurementPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const [s, p] = await Promise.all([locationService.getSites(), measurementPointService.getAll()]);
        if (cancelled) return;
        setSites(s);
        setPoints(p);
        setLoading(false);
      } catch {
        if (!cancelled) { setError(true); setLoading(false); }
      }
    };
    load();
    const t = setInterval(load, 10000);
    return () => { cancelled = true; clearInterval(t); };
  }, []);

  if (loading) return <><PageHeader title="Sites Map" subtitle="Geographic overview of all monitoring locations" /><PageLoader /></>;
  if (error) return <ErrorState message="Failed to load site data." />;

  const center: [number, number] = sites.length > 0 ? [sites[0].latitude, sites[0].longitude] : [-7.35058, 108.217163];

  return (
    <div>
      <PageHeader title="Sites Map" subtitle="Geographic overview of all monitoring locations" />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
        <Card className="lg:col-span-3 p-1 overflow-hidden">
          <div className="h-[600px] rounded-xl overflow-hidden">
            <MapContainer center={center} zoom={6} scrollWheelZoom className="h-full w-full">
              <TileLayer
                attribution='&copy; OpenStreetMap'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {sites.map((site, index) => (
                <Marker key={site.id} position={[site.latitude, site.longitude]} icon={makeIcon(site.onlineDevices, site.deviceCount)}>
                  <Popup>
                    <div className="min-w-[220px] p-1">
                      <div className="flex items-center gap-2 mb-2">
                        <MapPin size={14} className="text-brand-600" />
                        <span className="font-semibold text-slate-800">{site.name}</span>
                      </div>
                      <div className="space-y-1 text-xs text-slate-600">
                        <Row label="Devices" value={`${site.onlineDevices}/${site.deviceCount} online`} />
                        <Row label="Offline" value={String(site.offlineDevices)} />
                        <Row label="Avg Voltage" value={`${formatNumber(site.averageVoltage)} V`} />
                        <Row label="Avg Current" value={`${formatNumber(site.averageCurrent)} A`} />
                        <Row label="Active Power" value={`${formatNumber(site.totalActivePower)} kW`} />
                        <Row label="Energy Today" value={`${formatNumber(site.totalEnergyToday)} kWh`} />
                        <Row label="Last Update" value={timeAgo(site.lastUpdate)} />
                      </div>
                      <button
                        onClick={() => navigate(`/detail/${points[index]?.id}`)}
                        className="mt-3 w-full inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-600 text-white text-xs font-medium hover:bg-brand-700 transition-colors"
                      >
                        Open Dashboard <ArrowRight size={12} />
                      </button>
                    </div>
                  </Popup>
                </Marker>
              ))}
              {/* Pulse ring on each site */}
              {sites.map((site) => (
                <CircleMarker key={`ring-${site.id}`} center={[site.latitude, site.longitude]} radius={20} pathOptions={{ color: '#3b82f6', weight: 1, fillOpacity: 0.05 }} />
              ))}
            </MapContainer>
          </div>
        </Card>

        <div className="space-y-4">
          <Card className="p-5">
            <h3 className="text-sm font-semibold text-slate-800 dark:text-white mb-3 flex items-center gap-2">
              <Radio size={16} className="text-brand-500" /> Site List
            </h3>
            <div className="space-y-2 max-h-[540px] overflow-y-auto pr-1">
              {sites.map((site) => (
                <motion.div
                  key={site.id}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  onClick={() => navigate('/measurement')}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-200 truncate">{site.name}</span>
                    <Badge variant={site.offlineDevices > 0 ? 'warning' : 'success'} dot>
                      {site.onlineDevices}/{site.deviceCount}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">{formatNumber(site.totalActivePower)} kW · {formatNumber(site.totalEnergyToday, 0)} kWh today</p>
                </motion.div>
              ))}
            </div>
          </Card>
          <Card className="p-5">
            <h3 className="text-sm font-semibold text-slate-800 dark:text-white mb-2">Total Devices</h3>
            <p className="text-3xl font-bold text-slate-800 dark:text-white">{points.length}</p>
            <p className="text-xs text-slate-400 mt-1">{points.filter((p) => p.status === 'online').length} online across {sites.length} sites</p>
          </Card>
        </div>
      </div>
    </div>
  );
};

const Row = ({ label, value }: { label: string; value: string }) => (
  <div className="flex items-center justify-between">
    <span className="text-slate-500">{label}</span>
    <span className="font-medium text-slate-700">{value}</span>
  </div>
);
