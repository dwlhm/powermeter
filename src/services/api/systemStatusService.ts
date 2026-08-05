import type { EnergyRecord, ServiceHealth, SystemStatus } from '@/types';
import { delay } from '@/utils/async';

export const systemStatusService = {
  async getStatus(): Promise<SystemStatus> {
    await delay(200);
    const mk = (name: string, status: ServiceHealth['status'], latency: number): ServiceHealth => ({
      name,
      status,
      latency,
      uptime: 99.9 - Math.random() * 0.5,
      lastCheck: new Date().toISOString(),
    });
    return {
      api: mk('REST API', 'operational', 42),
      database: mk('Database', 'operational', 18),
      mqtt: mk('MQTT Broker', 'operational', 12),
      websocket: mk('WebSocket', 'degraded', 88),
      server: mk('Application Server', 'operational', 35),
      devices: mk('Power Meters', 'operational', 0),
    };
  },
};

export const analyticsService = {
  async getDaily(): Promise<EnergyRecord[]> {
    await delay(250);
    return Array.from({ length: 24 }, (_, h) => {
      const kwh = 8 + Math.sin((h / 24) * Math.PI) * 18 + Math.random() * 4;
      return { label: `${String(h).padStart(2, '0')}:00`, kwh: +kwh.toFixed(1), cost: +(kwh * 1445).toFixed(0) };
    });
  },
  async getWeekly(): Promise<EnergyRecord[]> {
    await delay(250);
    return ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d) => {
      const kwh = 280 + Math.random() * 120;
      return { label: d, kwh: +kwh.toFixed(1), cost: +(kwh * 1445).toFixed(0) };
    });
  },
  async getMonthly(): Promise<EnergyRecord[]> {
    await delay(250);
    return Array.from({ length: 30 }, (_, d) => {
      const kwh = 300 + Math.random() * 150;
      return { label: `${d + 1}`, kwh: +kwh.toFixed(1), cost: +(kwh * 1445).toFixed(0) };
    });
  },
  async getYearly(): Promise<EnergyRecord[]> {
    await delay(250);
    return ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((m) => {
      const kwh = 9000 + Math.random() * 3000;
      return { label: m, kwh: +kwh.toFixed(0), cost: +(kwh * 1445).toFixed(0) };
    });
  },
};
