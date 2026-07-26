"""Modbus reader package.

Exposes a single, mode-agnostic way to read power meter data.  Switching
between real devices and dummy data is done at factory creation time and does
not affect the rest of the application.
"""
from modbus_reader.base import PowerMeterReader
from modbus_reader.factory import create_reader

__all__ = ["PowerMeterReader", "create_reader"]
