import { useEffect, useRef, useState } from 'react';
import { powerMeterService } from '@/services/api/powerMeterService';
import type { PowerReading } from '@/types';
import { useSettingsStore } from '@/store/settingsStore';

// Polls the power meter service at the configured refresh interval and
// keeps a rolling window of readings for sparkline charts.
export const useLiveTelemetry = (deviceId: string, windowSize = 30, offline = false) => {
  const { refreshInterval, tariff } = useSettingsStore();
  const [reading, setReading] = useState<PowerReading | null>(null);
  const [history, setHistory] = useState<PowerReading[]>([]);
  const [error, setError] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    let cancelled = false;

    const tick = async () => {
      try {
        const r = await powerMeterService.getLatest(deviceId, tariff, offline);
        if (cancelled) return;
        setReading(r);
        setHistory((h) => [...h.slice(-(windowSize - 1)), r]);
        setError(null);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Telemetry error');
      }
    };

    tick();
    timer.current = setInterval(tick, refreshInterval);

    return () => {
      cancelled = true;
      if (timer.current) clearInterval(timer.current);
    };
  }, [deviceId, refreshInterval, tariff, windowSize, offline]);

  return { reading, history, error };
};
