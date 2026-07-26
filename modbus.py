"""Scan a single powermeter (useful for quick connectivity tests).

Usage:
    python modbus.py
    DUMMY_MODE=true python modbus.py

The default target below can be overridden by editing the constants or by
passing environment variables.  In dummy mode no network connection is made.
"""
from configuration.config import load_config, app_settings
from modbus_reader import create_reader

# Default test target.  Override these values as needed.
DEFAULT_IP = "10.225.0.204"
DEFAULT_PORT = 502
DEFAULT_DEVICE_ID = "Mg=="


def scan_device(ip_addr: str, port: int, device_id: str, pm_config: dict, dummy_mode: bool = False):
    """Read a single powermeter and print the resulting metrics."""
    reader = create_reader(dummy_mode=dummy_mode)
    try:
        print(f"[{ 'DUMMY' if dummy_mode else 'MODBUS' }] Scanning {ip_addr}:{port} (device {device_id})")
        data = reader.read(ip_addr, port, device_id, pm_config)
        for key, value in data.items():
            print(f"  {key}: {value}")
        return data
    except Exception as exc:
        print(f"Error: {exc}")
        raise
    finally:
        reader.close()


if __name__ == "__main__":
    settings = app_settings()

    # Minimal powermeter configuration for a standalone test.
    pm_config = {
        "seri": "AW9L",
        "slave_id": 1,
        "timeout": 4,
        "count": 2,
        "register": [
            # Keep the same shape the app expects:
            # [address, multiplier, ?, param_name, optional_alias]
        ],
    }

    scan_device(
        ip_addr=DEFAULT_IP,
        port=DEFAULT_PORT,
        device_id=DEFAULT_DEVICE_ID,
        pm_config=pm_config,
        dummy_mode=settings["dummy_mode"],
    )
