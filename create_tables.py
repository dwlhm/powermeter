import psycopg
from configuration.config import load_config
from database.connect import connect
from database.insert import insert_new_role
from database.get import get_role_by_id
from user.db import get_user_by_username, insert_new_user
from user.auth.internal import get_password_hash
from user.schemas import User
from configuration import config
from tagihan_listrik.db import get_tarif, create_tarif
from role.db import seed_default_permissions, assign_all_permissions_to_admin, role_name_exists, create_role
from role.schemas import RoleCreate

def create_tables():
    """ Create tables in the PostgreSQL database """
    commands = (
        """
        CREATE TABLE IF NOT EXISTS power_meter (
            id SERIAL PRIMARY KEY,
            seri VARCHAR(50) NOT NULL,
            brand VARCHAR(50) NOT NULL
        )
        """,
        """
        CREATE TABLE IF NOT EXISTS kampus (
            id SERIAL PRIMARY KEY,
            name VARCHAR(50) NOT NULL UNIQUE
        )
        """,
        """
        CREATE TABLE IF NOT EXISTS unit (
            id SERIAL PRIMARY KEY,
            name VARCHAR(50) NOT NULL,
            kampus INT NOT NULL,
            CONSTRAINT fk_kampus FOREIGN KEY(kampus) REFERENCES kampus(id)
        )
        """,
        """
        CREATE TABLE IF NOT EXISTS gedung (
            id SERIAL PRIMARY KEY,
            name VARCHAR(50) NOT NULL,
            unit INT NOT NULL,
            CONSTRAINT fk_unit FOREIGN KEY(unit) REFERENCES unit(id)
        )
        """,
        """
        CREATE TABLE IF NOT EXISTS device (
            id SERIAL PRIMARY KEY,
            name VARCHAR(50) NOT NULL,
            gedung INT NOT NULL,
            ip_addr VARCHAR(15) NOT NULL,
            port INT DEFAULT 502,
            power_meter INT NOT NULL,
            CONSTRAINT fk_power_meter FOREIGN KEY(power_meter) REFERENCES power_meter(id),
            CONSTRAINT fk_gedung FOREIGN KEY(gedung) REFERENCES gedung(id)
        )
        """,
        """
        CREATE TABLE IF NOT EXISTS data (
            id SERIAL PRIMARY KEY,
            device_id INT NOT NULL,
            metrics JSONB DEFAULT '{}'::jsonb,
            timestamp TIMESTAMPTZ NOT NULL,
            CONSTRAINT fk_device FOREIGN KEY(device_id) REFERENCES device(id)
        )
        """,
        """
        CREATE TABLE IF NOT EXISTS role (
            id SERIAL PRIMARY KEY,
            name VARCHAR(10)
        )
        """,
        """
        ALTER TABLE role ADD COLUMN IF NOT EXISTS description VARCHAR(255) DEFAULT ''
        """,
        """
        ALTER TABLE role ADD COLUMN IF NOT EXISTS is_system BOOLEAN DEFAULT FALSE
        """,
        """
        CREATE TABLE IF NOT EXISTS permissions (
            id SERIAL PRIMARY KEY,
            code VARCHAR(100) NOT NULL UNIQUE,
            name VARCHAR(100) NOT NULL,
            "group" VARCHAR(50) NOT NULL,
            description VARCHAR(255) DEFAULT ''
        )
        """,
        """
        CREATE TABLE IF NOT EXISTS role_permissions (
            role_id INT NOT NULL REFERENCES role(id) ON DELETE CASCADE,
            permission_id INT NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
            PRIMARY KEY (role_id, permission_id)
        )
        """,
        """
        CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            full_name VARCHAR(100),
            username VARCHAR(50),
            email VARCHAR(50),
            password VARCHAR(70),
            role INT NOT NULL,
            CONSTRAINT fk_role FOREIGN KEY(role) REFERENCES role(id)
        )
        """,
        """
        CREATE TABLE IF NOT EXISTS device_status (
            id SERIAL PRIMARY KEY,
            device INT NOT NULL UNIQUE,
            status BOOLEAN NOT NULL DEFAULT FALSE,
            update_at TIMESTAMPTZ NOT NULL,
            CONSTRAINT fk_device_device_status FOREIGN KEY(device) REFERENCES device(id)
        )
        """,
        """
        CREATE TABLE IF NOT EXISTS power_meter_register (
            id SERIAL PRIMARY KEY,
            power_meter INT NOT NULL UNIQUE,
            register VARCHAR(5000),
            CONSTRAINT fk_power_meter_register FOREIGN KEY(power_meter) REFERENCES power_meter(id)
        )
        """,
        """
        CREATE TABLE IF NOT EXISTS device_logs (
            id SERIAL PRIMARY KEY,
            device INT NOT NULL,
            type VARCHAR(50),
            message VARCHAR(1000),
            created_at TIMESTAMPTZ NOT NULL,
            CONSTRAINT fk_device_logs FOREIGN KEY(device) REFERENCES device(id)
        )
        """,
        """
        CREATE TABLE IF NOT EXISTS data_hourly (
            id SERIAL PRIMARY KEY,
            device_id INT NOT NULL,
            metrics JSONB DEFAULT '{}'::jsonb,
            timestamp TIMESTAMPTZ NOT NULL,
            CONSTRAINT fk_device_hourly FOREIGN KEY(device_id) REFERENCES device(id)
        )
        """,
        """
        CREATE TABLE IF NOT EXISTS data_daily (
            id SERIAL PRIMARY KEY,
            device_id INT NOT NULL,
            metrics JSONB DEFAULT '{}'::jsonb,
            timestamp TIMESTAMPTZ NOT NULL,
            CONSTRAINT fk_device_daily FOREIGN KEY(device_id) REFERENCES device(id)
        )
        """,
        """
        CREATE TABLE IF NOT EXISTS data_weekly (
            id SERIAL PRIMARY KEY,
            device_id INT NOT NULL,
            metrics JSONB DEFAULT '{}'::jsonb,
            timestamp TIMESTAMPTZ NOT NULL,
            CONSTRAINT fk_device_daily FOREIGN KEY(device_id) REFERENCES device(id)
        )
        """,
        """
        CREATE TABLE IF NOT EXISTS data_monthly (
            id SERIAL PRIMARY KEY,
            device_id INT NOT NULL,
            metrics JSONB DEFAULT '{}'::jsonb,
            timestamp TIMESTAMPTZ NOT NULL,
            CONSTRAINT fk_device_monthly FOREIGN KEY(device_id) REFERENCES device(id)
        )
        """,
        """
        CREATE TABLE IF NOT EXISTS data_yearly (
            id SERIAL PRIMARY KEY,
            device_id INT NOT NULL,
            metrics JSONB DEFAULT '{}'::jsonb,
            timestamp TIMESTAMPTZ NOT NULL,
            CONSTRAINT fk_device_yearly FOREIGN KEY(device_id) REFERENCES device(id)
        )
        """,
        """
        CREATE INDEX IF NOT EXISTS device_id
        ON device(id)
        """,
        """
        CREATE INDEX IF NOT EXISTS timestamp
        ON data_hourly(timestamp)
        """,
        """
        CREATE TABLE IF NOT EXISTS estimasi_tagihan_listrik (
            id SERIAL PRIMARY KEY,
            device_id INT NOT NULL,
            tarif_listrik INT NOT NULL,
            estimasi INT,
            harga INT,
            power FLOAT8,
            created_at TIMESTAMPTZ NOT NULL,
            updated_at TIMESTAMPTZ
        )
        """,
        """
        CREATE TABLE IF NOT EXISTS tarif_listrik (
            id SERIAL PRIMARY KEY,
            harga INT NOT NULL,
            created_at TIMESTAMPTZ NOT NULL,
            updated_at TIMESTAMPTZ
        )
        """,
        """
        CREATE TABLE IF NOT EXISTS user_seasons (
            id SERIAL PRIMARY KEY,
            user_id INT NOT NULL,
            token VARCHAR(255) NOT NULL
        )
        """
    )
    config_db = config.load_config()
    try:
        with psycopg.connect(**config_db) as conn:
            with conn.cursor() as cur:
                for command in commands:
                    cur.execute(command)
    except (psycopg.DatabaseError, Exception) as error:
        print(error)

    config_app = config.load_config("configuration/database.ini", "application")
    master_username = config_app["master_username"]

    role = get_role_by_id("1")

    if role is None:
        insert_new_role("Admin")

    userExsist = get_user_by_username(master_username, config_db)

    if userExsist is None:
        new_user = {
            "full_name": "admin",
            "username": master_username,
            "email": "admin@admin.admin",
            "password": get_password_hash(config_app["master_password"]),
            "role": 1
        }
        res = insert_new_user(User(**new_user), config_db)
        print("Add master account: ", res)

    tarifExsist = get_tarif(load_config())

    if tarifExsist.get("data") == []:
        new_tarif = create_tarif(harga=2000, config=load_config())
        if new_tarif.get("data"): print("tarif dibuat")

    seed_default_permissions(config_db)
    assign_all_permissions_to_admin(config_db)
    seed_default_roles(config_db)

def _lookup_permission_ids(config, codes: list[str]) -> list[int]:
    sql = "SELECT id FROM permissions WHERE code = ANY(%s)"
    try:
        with psycopg.connect(**config) as conn:
            with conn.cursor() as cur:
                cur.execute(sql, (codes,))
                return [row[0] for row in cur.fetchall()]
    except (Exception, psycopg.DatabaseError) as Error:
        print("Lookup permission error:", Error)
        return []


def seed_default_roles(config):
    roles = [
        {
            "name": "Viewer",
            "description": "Hanya bisa melihat data",
            "permission_codes": [
                "kampus.view", "unit.view", "gedung.view",
                "device.view", "data.view",
                "powermeter.view", "tarif.view",
            ],
        },
        {
            "name": "Operator",
            "description": "Mengelola perangkat dan melihat data",
            "permission_codes": [
                "kampus.view", "unit.view", "gedung.view",
                "device.view", "device.create",
                "data.view", "data.export",
                "powermeter.view", "tarif.view",
            ],
        },
    ]

    for role_def in roles:
        if role_name_exists(role_def["name"], config):
            continue
        perm_ids = _lookup_permission_ids(config, role_def["permission_codes"])
        payload = RoleCreate(
            name=role_def["name"],
            description=role_def["description"],
            permission_ids=perm_ids,
        )
        try:
            created = create_role(payload, config)
            print(f"Role '{role_def['name']}' created with {len(perm_ids)} permissions")
        except Exception as e:
            print(f"Failed to create role '{role_def['name']}': {e}")


if __name__ == '__main__':
    create_tables()
