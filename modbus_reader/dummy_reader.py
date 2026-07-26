"""Dummy power meter reader for local development / demos."""
import random
from typing import Dict

from modbus_reader.base import PowerMeterReader

# IP reserved for simulating an offline device.  Any read targeting this IP
# will raise a ConnectionError, exactly like a real unreachable power meter.
OFFLINE_IP = "192.0.2.1"


class DummyPowerMeterReader(PowerMeterReader):
    """
    Generate realistic dummy metrics instead of talking to a real power meter.

    Useful when no physical device is available: it still exercises the same
    save path (insert_latest_data, set_device_status, logs) so the rest of the
    application behaves exactly like production mode.
    """

    def __init__(self, seed: int | None = None):
        if seed is not None:
            random.seed(seed)

    def read(self, ip_addr: str, port: int, device_id: str, pm_config: dict) -> Dict[str, float]:
        """Return a dictionary of dummy metrics for the configured registers."""
        if ip_addr == OFFLINE_IP:
            raise ConnectionError(
                f"Gagal koneksi Modbus ke {ip_addr}:{port} (simulated offline device)"
            )

        registers = pm_config.get("register", [])
        data: Dict[str, float] = {}

        for register in registers:
            param_name = register[4] if len(register) > 4 else register[3]
            unit = register[2] if len(register) > 2 else ""
            multiplier = register[1]
            # The real Modbus reader stores raw_register * multiplier.  Generate a
            # realistic final value first, then back-calculate the raw register
            # value so the stored result is identical to production mode.
            final_value = self._generate_value(param_name, unit)
            raw_value = final_value if multiplier == 0 else final_value / multiplier
            data[param_name] = raw_value * multiplier

        # If no registers are configured, still return a small sane dataset so
        # downstream code does not choke on an empty dict.
        if not data:
            data = {
                "phase_voltage_a": 220.0,
                "phase_voltage_b": 221.5,
                "phase_voltage_c": 219.8,
                "phase_current_a": 5.2,
                "phase_current_b": 4.9,
                "phase_current_c": 5.1,
                "active_power": 32000.0,
                "power_factor_a": 0.92,
                "frequency": 50.0,
            }

        return data

    def close(self):
        # Nothing to release for the dummy implementation.
        pass

    @staticmethod
    def _generate_value(name: str, unit: str) -> float:
        """Pick a realistic final value based on the metric name and unit."""
        lower_name = name.lower()
        lower_unit = unit.lower() if isinstance(unit, str) else ""

        if lower_unit == "v":
            return round(random.uniform(215.0, 225.0), 2)

        if lower_unit == "a":
            return round(random.uniform(2.0, 10.0), 2)

        if lower_unit == "w":
            return round(random.uniform(1000.0, 7500.0), 2)

        if lower_unit == "var":
            return round(random.uniform(1000.0, 7500.0), 2)

        if lower_unit == "va":
            return round(random.uniform(1000.0, 7500.0), 2)

        if lower_unit == "hz":
            return round(random.uniform(49.8, 50.2), 2)

        if lower_unit == "kwh" or lower_unit == "kvarh":
            return round(random.uniform(10000.0, 50000.0), 2)

        if lower_unit == "%":
            return round(random.uniform(0.0, 100.0), 2)

        if lower_unit in {"°", "deg", "degree", "degrees"}:
            return round(random.uniform(0.0, 360.0), 2)

        # Power factor registers have no unit.
        if "power_factor" in lower_name:
            return round(random.uniform(0.85, 0.99), 2)

        return round(random.uniform(0.0, 100.0), 2)
