"""Abstract base for power meter readers.

A reader is responsible for turning a powermeter configuration into a dict of
metric values.  Implementations may talk to real Modbus devices or generate
dummy data; the rest of the application does not need to know the difference.
"""
from abc import ABC, abstractmethod
from typing import Dict


class PowerMeterReader(ABC):
    """Strategy interface for reading one powermeter."""

    @abstractmethod
    def read(self, ip_addr: str, port: int, device_id: str, pm_config: dict) -> Dict[str, float]:
        """
        Read metrics from a single powermeter.

        Args:
            ip_addr: Device IP address (may be ignored by dummy readers).
            port: Modbus TCP port (may be ignored by dummy readers).
            device_id: Base64-encoded device id used for logging.
            pm_config: Dictionary with keys such as 'seri', 'slave_id', 'timeout',
                       'count', and 'register'.

        Returns:
            Mapping of parameter name -> numeric value.
        """
        ...

    @abstractmethod
    def close(self):
        """Release any underlying resources."""
        ...
