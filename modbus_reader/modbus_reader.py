"""Real Modbus TCP power meter reader."""
from time import sleep
from typing import Dict

from pymodbus.client import ModbusTcpClient

from logger import logger
from modbus_reader.base import PowerMeterReader


class ModbusPowerMeterReader(PowerMeterReader):
    """Read power meter registers via Modbus TCP."""

    def __init__(self):
        self._client: ModbusTcpClient | None = None

    def read(self, ip_addr: str, port: int, device_id: str, pm_config: dict) -> Dict[str, float]:
        """Connect to a Modbus device and read all configured registers."""
        pm_seri = pm_config.get("seri", "Unknown")
        slave_id = pm_config.get("slave_id", 1)
        timeout = pm_config.get("timeout", 4)
        count = pm_config.get("count", 2)
        registers = pm_config.get("register", [])

        data: Dict[str, float] = {}

        self._client = ModbusTcpClient(
            host=ip_addr,
            port=port,
            timeout=timeout,
        )

        try:
            conn = self._client.connect()
            if not conn:
                raise ConnectionError(f"Gagal koneksi Modbus ke {ip_addr}:{port}")

            for register in registers:
                # Give slow devices a moment between requests.
                sleep(0.3)

                rr = self._client.read_holding_registers(
                    address=register[0],
                    count=count,
                    slave=slave_id,
                )

                if rr.isError():
                    # Log and skip individual register errors so one bad register
                    # does not invalidate the whole device poll.
                    logger.warning(
                        f"{ip_addr}:{port}:{device_id}:{pm_seri} -> "
                        f"Register {register[0]} error: {rr}"
                    )
                    continue

                param_name = register[4] if len(register) > 4 else register[3]
                data[param_name] = rr.registers[0] * register[1]

        finally:
            self.close()

        return data

    def close(self):
        if self._client:
            self._client.close()
            self._client = None
