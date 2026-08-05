import { SEED_SITES } from '@/data/seed';
import type { Site } from '@/types';
import { delay } from '@/utils/async';

// Location service — repository pattern entry point.
//
// Current: returns seeded dummy data.
// Future:  return apiClient.get('/sites').then(r => r.data)
//          or subscribe to an MQTT topic publishing site aggregates.

export const locationService = {
  async getSites(): Promise<Site[]> {
    await delay(250);
    // Refresh the dynamic fields so the map feels live.
    return SEED_SITES.map((s) => ({
      ...s,
      lastUpdate: new Date().toISOString(),
      averageVoltage: 228 + Math.random() * 4,
      averageCurrent: 20 + Math.random() * 50,
      totalActivePower: 15 + Math.random() * 35,
      totalEnergyToday: s.totalEnergyToday + Math.random() * 2,
    }));
  },

  async getSiteById(id: string): Promise<Site | undefined> {
    await delay(120);
    return SEED_SITES.find((s) => s.id === id);
  },
};
