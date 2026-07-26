import os
from configparser import ConfigParser
from dotenv import load_dotenv

# Load environment variables from .env file if present.
# This keeps docker-compose / local env files working seamlessly.
load_dotenv()


def load_config(filename='configuration/database.ini', section='postgresql'):
    """Load database configuration from an INI file."""
    parser = ConfigParser()
    parser.read(filename)

    config = {}
    if parser.has_section(section):
        params = parser.items(section)
        for param in params:
            config[param[0]] = param[1]
    else:
        raise Exception('Section {0} not found in the {1} file'.format(section, filename))

    return config


def _env_bool(name: str, default: bool = False) -> bool:
    """Parse a boolean-ish environment variable."""
    value = os.getenv(name, "").strip().lower()
    if not value:
        return default
    return value in {"1", "true", "yes", "on", "enabled"}


def _env_int(name: str, default: int) -> int:
    """Parse an integer environment variable."""
    try:
        return int(os.getenv(name, default))
    except (TypeError, ValueError):
        return default


def app_settings():
    """Application-level settings independent from the database config."""
    return {
        # When enabled, the modbus reader will not hit real power meters.
        # It will generate deterministic dummy data instead.
        "dummy_mode": _env_bool("DUMMY_MODE", default=False),

        # Seconds to wait between each full polling cycle in read_modbus.py.
        "modbus_read_interval": _env_int("MODBUS_READ_INTERVAL", default=60),

        # Maximum concurrent devices polled in one cycle.
        "modbus_max_workers": _env_int("MODBUS_MAX_WORKERS", default=60),
    }


if __name__ == '__main__':
    config = load_config()
    print(config)
    print(app_settings())
