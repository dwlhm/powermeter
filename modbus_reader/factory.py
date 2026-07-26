"""Factory for creating the right power meter reader."""
from modbus_reader.base import PowerMeterReader
from modbus_reader.dummy_reader import DummyPowerMeterReader
from modbus_reader.modbus_reader import ModbusPowerMeterReader


def create_reader(dummy_mode: bool = False) -> PowerMeterReader:
    """
    Return a PowerMeterReader implementation.

    Args:
        dummy_mode: If True, returns a reader that generates synthetic data.
                    Otherwise returns a real Modbus TCP reader.
    """
    if dummy_mode:
        return DummyPowerMeterReader()
    return ModbusPowerMeterReader()
