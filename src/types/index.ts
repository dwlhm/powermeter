// Central type definitions for the Energy Management System.
// Kept framework-agnostic so the same shapes can be reused by the service
// layer, the Zustand stores, and (later) generated from an OpenAPI schema.

export type Role = 'Administrator' | 'Engineer' | 'Operator' | 'Viewer';

export interface User {
  id: string;
  username: string;
  displayName: string;
  role: Role;
  avatarColor: string;
}

export type DeviceStatus = 'online' | 'offline' | 'warning';
export type CommStatus = 'connected' | 'disconnected';

export interface MeasurementPoint {
  id: string;
  deviceId: string;
  deviceName: string;
  building: string;
  siteId: string;
  latitude: number;
  longitude: number;
  status: DeviceStatus;
  favorite: boolean;
  lastUpdate: string;
}

export interface Site {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  deviceCount: number;
  onlineDevices: number;
  offlineDevices: number;
  averageVoltage: number;
  averageCurrent: number;
  totalActivePower: number;
  totalEnergyToday: number;
  lastUpdate: string;
}

export interface PowerReading {
  timestamp: number;
  voltageAN: number;
  voltageBN: number;
  voltageCN: number;
  voltageAB: number;
  voltageBC: number;
  voltageCA: number;
  currentA: number;
  currentB: number;
  currentC: number;
  activePowerA: number;
  activePowerB: number;
  activePowerC: number;
  reactivePowerA: number;
  reactivePowerB: number;
  reactivePowerC: number;
  apparentPowerA: number;
  apparentPowerB: number;
  apparentPowerC: number;
  totalActivePower: number;
  totalReactivePower: number;
  totalApparentPower: number;
  frequency: number;
  powerFactorA: number;
  powerFactorB: number;
  powerFactorC: number;
  averagePowerFactor: number;
  energyKwh: number;
  energyCost: number;
}

export type AlarmSeverity = 'Information' | 'Warning' | 'Critical';
export type AlarmStatus = 'Active' | 'Acknowledged' | 'Cleared';

export interface Alarm {
  id: string;
  deviceId: string;
  deviceName: string;
  site: string;
  type: string;
  severity: AlarmSeverity;
  status: AlarmStatus;
  message: string;
  value: number;
  threshold: number;
  triggeredAt: string;
  acknowledgedAt: string | null;
  clearedAt: string | null;
}

export type EventType =
  | 'Login'
  | 'Logout'
  | 'Device Connected'
  | 'Device Disconnected'
  | 'Alarm Triggered'
  | 'Alarm Cleared'
  | 'Configuration Updated';

export interface SystemEvent {
  id: string;
  type: EventType;
  message: string;
  user: string;
  timestamp: string;
}

export interface SystemStatus {
  api: ServiceHealth;
  database: ServiceHealth;
  mqtt: ServiceHealth;
  websocket: ServiceHealth;
  server: ServiceHealth;
  devices: ServiceHealth;
}

export interface ServiceHealth {
  name: string;
  status: 'operational' | 'degraded' | 'down';
  latency: number;
  uptime: number;
  lastCheck: string;
}

export interface EnergyRecord {
  label: string;
  kwh: number;
  cost: number;
}

export interface AppSettings {
  companyName: string;
  plantName: string;
  siteName: string;
  refreshInterval: number;
  theme: 'light' | 'dark';
  tariff: number;
  language: string;
  timezone: string;
}
