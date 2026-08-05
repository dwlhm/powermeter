import type { MeasurementPoint, Site } from '@/types';

// Seed inventory of monitoring sites and measurement points.
// In production this would come from a device registry / asset database.

export const SEED_SITES: Site[] = [
  {
    id: 'site-1',
    name: 'Hotel Horison Tasikmalaya',
    address: 'Jl. Sutisna Senjaya, Tasikmalaya, West Java',
    latitude: -7.35058,
    longitude: 108.217163,
    deviceCount: 6,
    onlineDevices: 5,
    offlineDevices: 1,
    averageVoltage: 229.8,
    averageCurrent: 38.4,
    totalActivePower: 26.4,
    totalEnergyToday: 634.2,
    lastUpdate: new Date().toISOString(),
  },
  {
    id: 'site-2',
    name: 'Factory Plant Cikarang',
    address: 'Jababeka Industrial Estate, Cikarang, West Java',
    latitude: -6.257,
    longitude: 107.144,
    deviceCount: 8,
    onlineDevices: 8,
    offlineDevices: 0,
    averageVoltage: 231.2,
    averageCurrent: 64.1,
    totalActivePower: 44.8,
    totalEnergyToday: 1075.3,
    lastUpdate: new Date().toISOString(),
  },
  {
    id: 'site-3',
    name: 'Office Tower Thamrin',
    address: 'Jl. M.H. Thamrin, Central Jakarta',
    latitude: -6.19488,
    longitude: 106.823,
    deviceCount: 4,
    onlineDevices: 3,
    offlineDevices: 1,
    averageVoltage: 228.6,
    averageCurrent: 29.7,
    totalActivePower: 19.2,
    totalEnergyToday: 461.0,
    lastUpdate: new Date().toISOString(),
  },
  {
    id: 'site-4',
    name: 'Warehouse Bandung',
    address: 'Soekarno Hatta, Bandung, West Java',
    latitude: -6.9175,
    longitude: 107.619,
    deviceCount: 3,
    onlineDevices: 3,
    offlineDevices: 0,
    averageVoltage: 230.4,
    averageCurrent: 22.3,
    totalActivePower: 15.1,
    totalEnergyToday: 362.4,
    lastUpdate: new Date().toISOString(),
  },
];

const buildings = ['Building 1', 'Building 2', 'LVMDP', 'Main Distribution Panel', 'Sub Distribution Panel Floor 1', 'Sub Distribution Panel Floor 2'];

export const SEED_MEASUREMENT_POINTS: MeasurementPoint[] = SEED_SITES.flatMap((site) => {
  const count = site.deviceCount;
  return Array.from({ length: count }, (_, i) => {
    const building = buildings[i % buildings.length];
    const status = i < site.onlineDevices ? 'online' : 'offline';
    return {
      id: `${site.id}-mp-${i + 1}`,
      deviceId: `PM-${site.id.split('-')[1]}-${String(i + 1).padStart(3, '0')}`,
      deviceName: `${site.name.split(' ')[0]} ${building}`,
      building,
      siteId: site.id,
      latitude: site.latitude + (Math.random() - 0.5) * 0.004,
      longitude: site.longitude + (Math.random() - 0.5) * 0.004,
      status,
      favorite: i === 0,
      lastUpdate: new Date(Date.now() - Math.random() * 60_000).toISOString(),
    } satisfies MeasurementPoint;
  });
});
