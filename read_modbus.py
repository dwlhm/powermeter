"""Poll all configured powermeters and persist their metrics.

Usage:
    DUMMY_MODE=true python read_modbus.py

Environment variables:
    DUMMY_MODE:           When "true", generate dummy data instead of real Modbus reads.
    MODBUS_READ_INTERVAL: Seconds to wait between polling cycles (default: 60).
    MODBUS_MAX_WORKERS:   Max concurrent devices polled in one cycle (default: 60).
"""
from datetime import datetime
from time import sleep
from concurrent.futures import ThreadPoolExecutor, as_completed

from logger import logger
from configuration.config import load_config, app_settings
from device.db import (
    get_all,
    insert_latest_data,
    set_device_status,
    insert_device_logs,
)
from modbus_reader import create_reader
from dummy_seed import ensure_dummy_devices


class PowerMeterPoller:
    """Orchestrates polling for all devices using a single reader strategy."""

    def __init__(self, db_config: dict, settings: dict):
        self.db_config = db_config
        self.settings = settings
        self.reader = create_reader(dummy_mode=settings["dummy_mode"])

    def _persist(self, device_id: str, pm_seri: str, data: dict, timestamp: datetime):
        """Save metrics and update device status."""
        result = insert_latest_data(
            id=device_id,
            timestamp=timestamp,
            config=self.db_config,
            data=data,
        )

        if result.get("error"):
            set_device_status(device_id, False, self.db_config)
            logger.warning(
                f"{device_id}:{pm_seri} -> Error db: {result.get('error')}"
            )
            insert_device_logs(
                device_id=device_id,
                type="error",
                message=result.get("error"),
                config=self.db_config,
            )
            return False

        set_device_status(device_id, True, self.db_config)
        logger.info(f"{device_id}:{pm_seri} -> Data disimpan di db")
        return True

    def poll_device(self, device: dict) -> None:
        """Poll a single device and persist its data."""
        device_id = device.get("id")
        ip_addr = device.get("ip_addr")
        port = device.get("port")
        pm_config = device.get("powermeter", {})
        pm_seri = pm_config.get("seri", "Unknown")

        context = f"{ip_addr}:{port}:{device_id}:{pm_seri}"

        try:
            logger.info(f"{context} -> Memulai pembacaan Modbus")
            data = self.reader.read(ip_addr, port, device_id, pm_config)
            logger.info(f"{context} -> Pembacaan Modbus selesai")

            self._persist(device_id, pm_seri, data, datetime.now())
        except ConnectionError as exc:
            set_device_status(device_id, False, self.db_config)
            logger.warning(f"{context} -> Gagal koneksi Modbus: {exc}")
            insert_device_logs(
                device_id=device_id,
                type="error",
                message=str(exc),
                config=self.db_config,
            )
        except Exception as exc:
            set_device_status(device_id, False, self.db_config)
            logger.warning(f"{context} -> Error saat pembacaan: {exc}")
            insert_device_logs(
                device_id=device_id,
                type="error",
                message=str(exc),
                config=self.db_config,
            )
        finally:
            logger.info(f"{context} -> Koneksi Modbus ditutup")

    def run_cycle(self) -> None:
        """Poll every configured device once."""
        devices_result = get_all(self.db_config)

        if devices_result.get("error"):
            logger.error(f"Gagal mengambil daftar device: {devices_result.get('error')}")
            return

        devices = devices_result.get("data", [])
        if not devices:
            logger.info("Tidak ada device yang perlu dipolling")
            return

        max_workers = min(self.settings["modbus_max_workers"], len(devices))

        with ThreadPoolExecutor(max_workers=max_workers) as executor:
            futures = {
                executor.submit(self.poll_device, device): device
                for device in devices
            }
            for future in as_completed(futures):
                device = futures[future]
                try:
                    future.result()
                except Exception as exc:
                    device_id = device.get("id")
                    logger.error(f"{device_id} -> Uncaught polling error: {exc}")

        logger.info("Selesai pengambilan semua data powermeter")

    def close(self) -> None:
        self.reader.close()


def main():
    db_config = load_config()
    settings = app_settings()

    mode_label = "DUMMY" if settings["dummy_mode"] else "PRODUCTION"
    logger.info(f"Modbus reader starting in {mode_label} mode")
    logger.info(f"Settings: {settings}")

    if settings["dummy_mode"]:
        seed_result = ensure_dummy_devices(db_config)
        logger.info(f"Dummy seed: {seed_result}")

    poller = PowerMeterPoller(db_config, settings)

    try:
        while True:
            poller.run_cycle()
            interval = settings["modbus_read_interval"]
            logger.info(f"Menunggu {interval} detik sebelum siklus berikutnya")
            sleep(interval)
    except KeyboardInterrupt:
        logger.info("Modbus reader dihentikan oleh user")
    finally:
        poller.close()


if __name__ == "__main__":
    main()
