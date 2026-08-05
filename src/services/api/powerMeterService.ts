import { generatePowerSnapshot, generateTrendSeries, type PowerSnapshot } from '@/utils/randomPowerGenerator';
import type { PowerReading } from '@/types';
import { delay } from '@/utils/async';

const snapshotToReading = (deviceId: string, snap: PowerSnapshot, tariff: number): PowerReading => ({
  timestamp: Date.now(),
  ...snap,
  energyKwh: snap.energyKwh,
  energyCost: snap.energyKwh * tariff,
});

// Power meter service — the main telemetry entry point.
//
// Current: generates realistic dummy snapshots.
// Future implementations (swap here, UI untouched):
//   REST:    apiClient.get(`/meters/${deviceId}/latest`)
//   MQTT:    mqttClient.subscribe(`meter/${deviceId}/telemetry`)
//   WS:      socket.on(`meter:${deviceId}`)
//   OPC UA:  await opcuaSession.read(nodeId)
//   Modbus:  await modbusClient.readHoldingRegisters(unit, addr, len)

export const powerMeterService = {
  async getLatest(deviceId: string, tariff = 1445, offline = false): Promise<PowerReading> {
    await delay(120);
    const snap = generatePowerSnapshot({ deviceId, tariff, offline });
    return snapshotToReading(deviceId, snap, tariff);
  },

  async getTrend(
    deviceId: string,
    period: '1m' | '5m' | '15m' | '1h' | '24h',
    tariff = 1445,
  ): Promise<PowerReading[]> {
    await delay(200);
    const config: Record<typeof period, { points: number; intervalMs: number }> = {
      '1m': { points: 30, intervalMs: 2000 },
      '5m': { points: 30, intervalMs: 10000 },
      '15m': { points: 45, intervalMs: 20000 },
      '1h': { points: 60, intervalMs: 60000 },
      '24h': { points: 96, intervalMs: 900000 },
    };
    const { points, intervalMs } = config[period];
    const series = generateTrendSeries(deviceId, points, intervalMs, tariff);
    return series.map(({ timestamp, snapshot }) => ({ timestamp, ...snapshot }));
  },

  async getDashboardAggregate(deviceIds: string[], tariff = 1445): Promise<PowerReading> {
    await delay(180);
    let agg: PowerSnapshot | null = null;
    for (const id of deviceIds) {
      const snap = generatePowerSnapshot({ deviceId: id, tariff });
      if (!agg) {
        agg = { ...snap };
      } else {
        agg.totalActivePower += snap.totalActivePower;
        agg.totalReactivePower += snap.totalReactivePower;
        agg.totalApparentPower += snap.totalApparentPower;
        agg.energyKwh = snap.energyKwh;
        agg.energyCost = snap.energyKwh * tariff;
        agg.frequency = snap.frequency;
        agg.averagePowerFactor = snap.averagePowerFactor;
      }
    }
    return snapshotToReading('aggregate', agg ?? generatePowerSnapshot({ deviceId: 'aggregate', tariff }), tariff);
  },
};
