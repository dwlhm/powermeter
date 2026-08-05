import { SEED_MEASUREMENT_POINTS } from '@/data/seed';
import type { MeasurementPoint } from '@/types';
import { delay } from '@/utils/async';

// Measurement point repository.
// Future: apiClient.get('/measurement-points') or OPC UA browse call.

export const measurementPointService = {
  async getAll(): Promise<MeasurementPoint[]> {
    await delay(300);
    return SEED_MEASUREMENT_POINTS.map((p) => ({
      ...p,
      lastUpdate: new Date(Date.now() - Math.random() * 30_000).toISOString(),
    }));
  },

  async getBySite(siteId: string): Promise<MeasurementPoint[]> {
    await delay(200);
    return SEED_MEASUREMENT_POINTS.filter((p) => p.siteId === siteId);
  },

  async getById(id: string): Promise<MeasurementPoint | undefined> {
    await delay(150);
    return SEED_MEASUREMENT_POINTS.find((p) => p.id === id);
  },

  async toggleFavorite(id: string): Promise<void> {
    await delay(80);
    const point = SEED_MEASUREMENT_POINTS.find((p) => p.id === id);
    if (point) point.favorite = !point.favorite;
  },
};
