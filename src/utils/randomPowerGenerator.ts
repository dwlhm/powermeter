// Centralized realistic power-meter data generator.
//
// This is the ONLY place that fabricates sensor values. Every service reads
// from here today; tomorrow the services will swap this out for real API /
// MQTT / Modbus / OPC UA calls without any UI-layer changes.
//
// Values mimic a three-phase industrial power meter (e.g. Schneider PM5000,
// Siemens SENTRON 9600) operating around 230 V / 400 V, 50 Hz.

export interface PowerSnapshot {
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

const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n));
const jitter = (base: number, spread: number) => base + (Math.random() - 0.5) * 2 * spread;

// Persistent per-device state so values drift smoothly instead of jumping.
interface DeviceState {
  energyKwh: number;
  lastTimestamp: number;
  loadFactor: number;
}

const deviceStates = new Map<string, DeviceState>();

const getDeviceState = (deviceId: string): DeviceState => {
  let s = deviceStates.get(deviceId);
  if (!s) {
    s = { energyKwh: 1000 + Math.random() * 9000, lastTimestamp: Date.now(), loadFactor: 0.6 + Math.random() * 0.3 };
    deviceStates.set(deviceId, s);
  }
  return s;
};

export interface GenerateOptions {
  deviceId: string;
  tariff?: number;
  offline?: boolean;
}

export const generatePowerSnapshot = ({ deviceId, tariff = 1445, offline = false }: GenerateOptions): PowerSnapshot => {
  const state = getDeviceState(deviceId);
  const now = Date.now();
  const elapsedHours = Math.max((now - state.lastTimestamp) / 3_600_000, 0.0001);
  state.lastTimestamp = now;

  if (offline) {
    return {
      voltageAN: 0, voltageBN: 0, voltageCN: 0,
      voltageAB: 0, voltageBC: 0, voltageCA: 0,
      currentA: 0, currentB: 0, currentC: 0,
      activePowerA: 0, activePowerB: 0, activePowerC: 0,
      reactivePowerA: 0, reactivePowerB: 0, reactivePowerC: 0,
      apparentPowerA: 0, apparentPowerB: 0, apparentPowerC: 0,
      totalActivePower: 0, totalReactivePower: 0, totalApparentPower: 0,
      frequency: 0,
      powerFactorA: 0, powerFactorB: 0, powerFactorC: 0, averagePowerFactor: 0,
      energyKwh: state.energyKwh,
      energyCost: state.energyKwh * tariff,
    };
  }

  // Slowly drift the load factor to simulate real demand changes.
  state.loadFactor = clamp(state.loadFactor + (Math.random() - 0.5) * 0.05, 0.3, 0.95);

  const voltageAN = jitter(230, 4);
  const voltageBN = jitter(230, 4);
  const voltageCN = jitter(230, 4);
  const voltageAB = jitter(398, 5);
  const voltageBC = jitter(398, 5);
  const voltageCA = jitter(398, 5);

  const baseCurrent = 40 * state.loadFactor;
  const currentA = jitter(baseCurrent, 3);
  const currentB = jitter(baseCurrent, 3);
  const currentC = jitter(baseCurrent, 3);

  const pfA = clamp(jitter(0.92, 0.05), 0.7, 0.99);
  const pfB = clamp(jitter(0.92, 0.05), 0.7, 0.99);
  const pfC = clamp(jitter(0.92, 0.05), 0.7, 0.99);

  // P = sqrt(3) * V * I * pf for three-phase, but per-phase we use V_phase * I * pf.
  const activePowerA = (voltageAN * currentA * pfA) / 1000; // kW
  const activePowerB = (voltageBN * currentB * pfB) / 1000;
  const activePowerC = (voltageCN * currentC * pfC) / 1000;

  const apparentPowerA = (voltageAN * currentA) / 1000; // kVA
  const apparentPowerB = (voltageBN * currentB) / 1000;
  const apparentPowerC = (voltageCN * currentC) / 1000;

  const reactivePowerA = Math.sqrt(Math.max(apparentPowerA ** 2 - activePowerA ** 2, 0)); // kVAR
  const reactivePowerB = Math.sqrt(Math.max(apparentPowerB ** 2 - activePowerB ** 2, 0));
  const reactivePowerC = Math.sqrt(Math.max(apparentPowerC ** 2 - activePowerC ** 2, 0));

  const totalActivePower = activePowerA + activePowerB + activePowerC;
  const totalReactivePower = reactivePowerA + reactivePowerB + reactivePowerC;
  const totalApparentPower = apparentPowerA + apparentPowerB + apparentPowerC;
  const averagePowerFactor = totalApparentPower > 0 ? totalActivePower / totalApparentPower : 0;

  const frequency = jitter(50, 0.05);

  // Integrate energy: kWh = kW * hours.
  const deltaKwh = totalActivePower * elapsedHours;
  state.energyKwh += deltaKwh;

  return {
    voltageAN, voltageBN, voltageCN,
    voltageAB, voltageBC, voltageCA,
    currentA, currentB, currentC,
    activePowerA, activePowerB, activePowerC,
    reactivePowerA, reactivePowerB, reactivePowerC,
    apparentPowerA, apparentPowerB, apparentPowerC,
    totalActivePower, totalReactivePower, totalApparentPower,
    frequency,
    powerFactorA: pfA, powerFactorB: pfB, powerFactorC: pfC,
    averagePowerFactor,
    energyKwh: state.energyKwh,
    energyCost: state.energyKwh * tariff,
  };
};

export const generateTrendSeries = (
  deviceId: string,
  points: number,
  intervalMs: number,
  tariff = 1445,
): { timestamp: number; snapshot: PowerSnapshot }[] => {
  const series: { timestamp: number; snapshot: PowerSnapshot }[] = [];
  const now = Date.now();
  // Reset to a temporary state so we don't mutate the live accumulator.
  const realState = deviceStates.get(deviceId);
  for (let i = points - 1; i >= 0; i--) {
    const ts = now - i * intervalMs;
    const snap = generatePowerSnapshot({ deviceId, tariff });
    series.push({ timestamp: ts, snapshot: snap });
  }
  if (realState) deviceStates.set(deviceId, realState); // restore
  return series;
};

export const calcAverage = (a: number, b: number, c: number) => (a + b + c) / 3;

export const calcUnbalance = (a: number, b: number, c: number): number => {
  const avg = calcAverage(a, b, c);
  if (avg === 0) return 0;
  const maxDev = Math.max(Math.abs(a - avg), Math.abs(b - avg), Math.abs(c - avg));
  return (maxDev / avg) * 100;
};
