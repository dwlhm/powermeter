import type { Alarm, AlarmSeverity, AlarmStatus, SystemEvent, EventType } from '@/types';
import { SEED_MEASUREMENT_POINTS } from '@/data/seed';
import { delay } from '@/utils/async';

const alarmTemplates = [
  { type: 'Voltage High', severity: 'Warning' as AlarmSeverity, message: 'Phase voltage exceeded upper limit' },
  { type: 'Voltage Low', severity: 'Warning' as AlarmSeverity, message: 'Phase voltage dropped below lower limit' },
  { type: 'Current Overload', severity: 'Critical' as AlarmSeverity, message: 'Current exceeded rated capacity' },
  { type: 'Frequency High', severity: 'Information' as AlarmSeverity, message: 'Frequency above 50.2 Hz' },
  { type: 'Frequency Low', severity: 'Information' as AlarmSeverity, message: 'Frequency below 49.8 Hz' },
  { type: 'Power Factor Low', severity: 'Warning' as AlarmSeverity, message: 'Power factor below 0.85' },
  { type: 'Communication Lost', severity: 'Critical' as AlarmSeverity, message: 'No telemetry received within timeout' },
];

const randomItem = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

const generateAlarms = (count: number): Alarm[] =>
  Array.from({ length: count }, (_, i) => {
    const tpl = randomItem(alarmTemplates);
    const device = randomItem(SEED_MEASUREMENT_POINTS);
    const triggeredAt = new Date(Date.now() - Math.random() * 86_400_000).toISOString();
    const statuses: AlarmStatus[] = ['Active', 'Acknowledged', 'Cleared'];
    const status = i < 3 ? 'Active' : randomItem(statuses);
    return {
      id: `alarm-${i + 1}`,
      deviceId: device.deviceId,
      deviceName: device.deviceName,
      site: device.building,
      type: tpl.type,
      severity: tpl.severity,
      status,
      message: tpl.message,
      value: +(Math.random() * 100).toFixed(1),
      threshold: +(Math.random() * 100).toFixed(1),
      triggeredAt,
      acknowledgedAt: status !== 'Active' ? new Date(new Date(triggeredAt).getTime() + 60_000).toISOString() : null,
      clearedAt: status === 'Cleared' ? new Date(new Date(triggeredAt).getTime() + 300_000).toISOString() : null,
    };
  });

let alarmCache: Alarm[] | null = null;

export const alarmService = {
  async getAll(): Promise<Alarm[]> {
    await delay(300);
    if (!alarmCache) alarmCache = generateAlarms(28);
    return alarmCache;
  },

  async acknowledge(id: string): Promise<void> {
    await delay(120);
    if (alarmCache) {
      const a = alarmCache.find((x) => x.id === id);
      if (a && a.status === 'Active') {
        a.status = 'Acknowledged';
        a.acknowledgedAt = new Date().toISOString();
      }
    }
  },

  async clear(id: string): Promise<void> {
    await delay(120);
    if (alarmCache) {
      const a = alarmCache.find((x) => x.id === id);
      if (a && a.status !== 'Cleared') {
        a.status = 'Cleared';
        a.clearedAt = new Date().toISOString();
      }
    }
  },
};

const eventTemplates: { type: EventType; message: string }[] = [
  { type: 'Login', message: 'User signed in' },
  { type: 'Logout', message: 'User signed out' },
  { type: 'Device Connected', message: 'Device established communication' },
  { type: 'Device Disconnected', message: 'Device lost communication' },
  { type: 'Alarm Triggered', message: 'New alarm raised' },
  { type: 'Alarm Cleared', message: 'Alarm returned to normal' },
  { type: 'Configuration Updated', message: 'System configuration changed' },
];

const users = ['admin', 'engineer.jane', 'operator.bob', 'viewer.ann', 'system'];

const generateEvents = (count: number): SystemEvent[] =>
  Array.from({ length: count }, (_, i) => {
    const tpl = randomItem(eventTemplates);
    return {
      id: `event-${i + 1}`,
      type: tpl.type,
      message: tpl.message,
      user: randomItem(users),
      timestamp: new Date(Date.now() - i * 600_000 - Math.random() * 300_000).toISOString(),
    };
  });

let eventCache: SystemEvent[] | null = null;

export const eventService = {
  async getAll(): Promise<SystemEvent[]> {
    await delay(280);
    if (!eventCache) eventCache = generateEvents(40);
    return eventCache;
  },
};
