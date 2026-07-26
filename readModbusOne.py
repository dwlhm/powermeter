"""Read a single powermeter using the shared reader strategy.

This is a thin convenience script around modbus_reader.  It uses the hardcoded
register map from device_registers.registers_repo for quick ad-hoc tests.

Usage:
    python readModbusOne.py
    DUMMY_MODE=true python readModbusOne.py
"""
from configuration.config import app_settings
from device_registers.registers_repo import repo as registers
from modbus_reader import create_reader

IP_ADDR = "10.225.0.204"
PORT = 502
PM_SERI = "AW9L"
DEVICE_ID = "Mg=="


def main():
    settings = app_settings()
    reader = create_reader(dummy_mode=settings["dummy_mode"])

    pm_config = {
        "seri": PM_SERI,
        "slave_id": 1,
        "timeout": 4,
        "count": 2,
        "register": registers.get(PM_SERI, []),
    }

    try:
        print(f"[{'DUMMY' if settings['dummy_mode'] else 'MODBUS'}] Reading {PM_SERI} @ {IP_ADDR}:{PORT}")
        data = reader.read(IP_ADDR, PORT, DEVICE_ID, pm_config)
        for key, value in data.items():
            print(f"  {key}: {value}")
    finally:
        reader.close()


if __name__ == "__main__":
    main()
