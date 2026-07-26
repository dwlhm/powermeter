"""Seed default dummy devices when running in DUMMY_MODE.

This module creates a minimal hierarchy (kampus → unit → gedung) plus two
devices so the modbus reader has something to poll in demo/development setups:

- "PM Online"  : reachable IP, will produce dummy metrics and be marked online
- "PM Offline" : unreachable IP, will fail to connect and be marked offline
"""
import json
import psycopg

from configuration.config import load_config
from device_registers.registers_repo import repo as registers

DEFAULT_KAMPUS = "Kampus Demo"
DEFAULT_UNIT = "Unit Demo"
DEFAULT_GEDUNG = "Gedung Demo"
DEFAULT_SERI = "AW9L"
DEFAULT_BRAND = "Demo Brand"

ONLINE_DEVICE = {
    "name": "PM Online",
    "ip_addr": "127.0.0.1",
    "port": 502,
}

OFFLINE_DEVICE = {
    "name": "PM Offline",
    "ip_addr": "192.0.2.1",  # TEST-NET-1, guaranteed to be unreachable
    "port": 502,
}


def _convert_param_to_name(param: str) -> str:
    """Convert a snake_case parameter id to a human-readable label."""
    return " ".join(word.capitalize() for word in param.split("_"))


def _register_list() -> list:
    """Return the register list for the default series in UI format.

    The raw repo format is [address, multiplier, unit, param].
    The frontend expects [address, multiplier, unit, name, param].
    """
    raw_registers = registers.get(DEFAULT_SERI, [])
    return [
        [address, multiplier, unit, _convert_param_to_name(param), param]
        for address, multiplier, unit, param in raw_registers
    ]


def _ensure_power_meter(cur) -> int:
    """Get or create the default power_meter and its register map."""
    cur.execute(
        "SELECT id FROM power_meter WHERE seri = %s AND brand = %s",
        (DEFAULT_SERI, DEFAULT_BRAND),
    )
    row = cur.fetchone()
    if row:
        pm_id = row[0]
    else:
        cur.execute(
            "INSERT INTO power_meter (seri, brand) VALUES (%s, %s) RETURNING id",
            (DEFAULT_SERI, DEFAULT_BRAND),
        )
        pm_id = cur.fetchone()[0]

    register_value = json.dumps(_register_list())
    cur.execute(
        """INSERT INTO power_meter_register (power_meter, register)
           VALUES (%s, %s)
           ON CONFLICT(power_meter)
           DO UPDATE SET register = EXCLUDED.register""",
        (pm_id, register_value),
    )

    return pm_id


def _ensure_kampus(cur) -> int:
    cur.execute("SELECT id FROM kampus WHERE name = %s", (DEFAULT_KAMPUS,))
    row = cur.fetchone()
    if row:
        return row[0]
    cur.execute(
        "INSERT INTO kampus (name) VALUES (%s) RETURNING id",
        (DEFAULT_KAMPUS,),
    )
    return cur.fetchone()[0]


def _ensure_unit(cur, kampus_id: int) -> int:
    cur.execute("SELECT id FROM unit WHERE name = %s AND kampus = %s", (DEFAULT_UNIT, kampus_id))
    row = cur.fetchone()
    if row:
        return row[0]
    cur.execute(
        "INSERT INTO unit (name, kampus) VALUES (%s, %s) RETURNING id",
        (DEFAULT_UNIT, kampus_id),
    )
    return cur.fetchone()[0]


def _ensure_gedung(cur, unit_id: int) -> int:
    cur.execute("SELECT id FROM gedung WHERE name = %s AND unit = %s", (DEFAULT_GEDUNG, unit_id))
    row = cur.fetchone()
    if row:
        return row[0]
    cur.execute(
        "INSERT INTO gedung (name, unit) VALUES (%s, %s) RETURNING id",
        (DEFAULT_GEDUNG, unit_id),
    )
    return cur.fetchone()[0]


def _ensure_device(cur, gedung_id: int, pm_id: int, spec: dict) -> int:
    cur.execute(
        "SELECT id FROM device WHERE name = %s AND gedung = %s",
        (spec["name"], gedung_id),
    )
    row = cur.fetchone()
    if row:
        return row[0]
    cur.execute(
        """INSERT INTO device (name, gedung, ip_addr, port, power_meter)
           VALUES (%s, %s, %s, %s, %s) RETURNING id""",
        (spec["name"], gedung_id, spec["ip_addr"], spec["port"], pm_id),
    )
    return cur.fetchone()[0]


def ensure_dummy_devices(config: dict | None = None) -> dict:
    """Ensure the two default demo devices exist in the database."""
    if config is None:
        config = load_config()

    try:
        with psycopg.connect(**config) as conn:
            with conn.cursor() as cur:
                pm_id = _ensure_power_meter(cur)
                kampus_id = _ensure_kampus(cur)
                unit_id = _ensure_unit(cur, kampus_id)
                gedung_id = _ensure_gedung(cur, unit_id)

                online_id = _ensure_device(cur, gedung_id, pm_id, ONLINE_DEVICE)
                offline_id = _ensure_device(cur, gedung_id, pm_id, OFFLINE_DEVICE)

                conn.commit()

                return {
                    "status": "ensured",
                    "online_device_id": online_id,
                    "offline_device_id": offline_id,
                }
    except (Exception, psycopg.DatabaseError) as error:
        return {"status": "error", "message": str(error)}


if __name__ == "__main__":
    print(ensure_dummy_devices())
