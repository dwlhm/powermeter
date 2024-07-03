import psycopg2
from configuration.config import load_config
from database.connect import connect
from database.insert import insert_new_role
from database.get import get_role_by_id
from user.db import get_user_by_username, insert_new_user
from user.auth.internal import get_password_hash
from user.internal import User
from configuration import config
from tagihan_listrik.db import get_tarif, create_tarif

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
            phase_voltage_a FLOAT8,
            phase_voltage_b FLOAT8,
            phase_voltage_c FLOAT8,
            wire_voltage_ab FLOAT8,
            wire_voltage_bc FLOAT8,
            wire_voltage_ca FLOAT8,
            phase_current_a FLOAT8,
            phase_current_b FLOAT8,
            phase_current_c FLOAT8,
            active_power_a FLOAT8,
            active_power_b FLOAT8,
            active_power_c FLOAT8,
            reactive_power_a FLOAT8,
            reactive_power_b FLOAT8,
            reactive_power_c FLOAT8,
            apparent_power_a FLOAT8,
            apparent_power_b FLOAT8,
            apparent_power_c FLOAT8,
            power_factor_a FLOAT8,
            power_factor_b FLOAT8,
            power_factor_c FLOAT8,
            frequency FLOAT8,
            active_power FLOAT8,
            reactive_power FLOAT8,
            positive_active_power FLOAT8,
            negative_active_power FLOAT8,
            positive_reactive_power FLOAT8,
            negative_reactive_power FLOAT8,
            current_active_power_demand FLOAT8,
            maximum_active_power_demand FLOAT8,
            current_reactive_power_demand FLOAT8,
            maximum_reactive_power_demand FLOAT8,
            a_phase_voltage_total_harmonic_content FLOAT8,
            b_phase_voltage_total_harmonic_content FLOAT8,
            c_phase_voltage_total_harmonic_content FLOAT8,
            a_phase_current_total_harmonic_content FLOAT8,
            b_phase_current_total_harmonic_content FLOAT8,
            c_phase_current_total_harmonic_content FLOAT8,
            o_phase_current FLOAT8,
            phase_voltage_maximum FLOAT8,
            Wires_voltage_maximum FLOAT8,
            current_maximum FLOAT8,
            voltage_imbalance FLOAT8,
            current_imbalance FLOAT8,
            a_b_phase_voltage_angle FLOAT8,
            b_C_phase_voltage_angle FLOAT8,
            c_a_phase_voltage_angle FLOAT8,
            first_quadrant_reactive_energy FLOAT8,
            second_quadrant_reactive_energy FLOAT8,
            third_quadrant_reactive_energy FLOAT8,
            fourth_quadrant_reactive_power FLOAT8,
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
            phase_voltage_a FLOAT8,
            phase_voltage_b FLOAT8,
            phase_voltage_c FLOAT8,
            wire_voltage_ab FLOAT8,
            wire_voltage_bc FLOAT8,
            wire_voltage_ca FLOAT8,
            phase_current_a FLOAT8,
            phase_current_b FLOAT8,
            phase_current_c FLOAT8,
            active_power_a FLOAT8,
            active_power_b FLOAT8,
            active_power_c FLOAT8,
            reactive_power_a FLOAT8,
            reactive_power_b FLOAT8,
            reactive_power_c FLOAT8,
            apparent_power_a FLOAT8,
            apparent_power_b FLOAT8,
            apparent_power_c FLOAT8,
            power_factor_a FLOAT8,
            power_factor_b FLOAT8,
            power_factor_c FLOAT8,
            frequency FLOAT8,
            active_power FLOAT8,
            reactive_power FLOAT8,
            positive_active_power FLOAT8,
            negative_active_power FLOAT8,
            positive_reactive_power FLOAT8,
            negative_reactive_power FLOAT8,
            current_active_power_demand FLOAT8,
            maximum_active_power_demand FLOAT8,
            current_reactive_power_demand FLOAT8,
            maximum_reactive_power_demand FLOAT8,
            a_phase_voltage_total_harmonic_content FLOAT8,
            b_phase_voltage_total_harmonic_content FLOAT8,
            c_phase_voltage_total_harmonic_content FLOAT8,
            a_phase_current_total_harmonic_content FLOAT8,
            b_phase_current_total_harmonic_content FLOAT8,
            c_phase_current_total_harmonic_content FLOAT8,
            o_phase_current FLOAT8,
            phase_voltage_maximum FLOAT8,
            Wires_voltage_maximum FLOAT8,
            current_maximum FLOAT8,
            voltage_imbalance FLOAT8,
            current_imbalance FLOAT8,
            a_b_phase_voltage_angle FLOAT8,
            b_C_phase_voltage_angle FLOAT8,
            c_a_phase_voltage_angle FLOAT8,
            first_quadrant_reactive_energy FLOAT8,
            second_quadrant_reactive_energy FLOAT8,
            third_quadrant_reactive_energy FLOAT8,
            fourth_quadrant_reactive_power FLOAT8,
            timestamp TIMESTAMPTZ NOT NULL,
            CONSTRAINT fk_device_hourly FOREIGN KEY(device_id) REFERENCES device(id)
        )
        """,
        """
        CREATE TABLE IF NOT EXISTS data_daily (
            id SERIAL PRIMARY KEY,
            device_id INT NOT NULL,
            phase_voltage_a FLOAT8,
            phase_voltage_b FLOAT8,
            phase_voltage_c FLOAT8,
            wire_voltage_ab FLOAT8,
            wire_voltage_bc FLOAT8,
            wire_voltage_ca FLOAT8,
            phase_current_a FLOAT8,
            phase_current_b FLOAT8,
            phase_current_c FLOAT8,
            active_power_a FLOAT8,
            active_power_b FLOAT8,
            active_power_c FLOAT8,
            reactive_power_a FLOAT8,
            reactive_power_b FLOAT8,
            reactive_power_c FLOAT8,
            apparent_power_a FLOAT8,
            apparent_power_b FLOAT8,
            apparent_power_c FLOAT8,
            power_factor_a FLOAT8,
            power_factor_b FLOAT8,
            power_factor_c FLOAT8,
            frequency FLOAT8,
            active_power FLOAT8,
            reactive_power FLOAT8,
            positive_active_power FLOAT8,
            negative_active_power FLOAT8,
            positive_reactive_power FLOAT8,
            negative_reactive_power FLOAT8,
            current_active_power_demand FLOAT8,
            maximum_active_power_demand FLOAT8,
            current_reactive_power_demand FLOAT8,
            maximum_reactive_power_demand FLOAT8,
            a_phase_voltage_total_harmonic_content FLOAT8,
            b_phase_voltage_total_harmonic_content FLOAT8,
            c_phase_voltage_total_harmonic_content FLOAT8,
            a_phase_current_total_harmonic_content FLOAT8,
            b_phase_current_total_harmonic_content FLOAT8,
            c_phase_current_total_harmonic_content FLOAT8,
            o_phase_current FLOAT8,
            phase_voltage_maximum FLOAT8,
            Wires_voltage_maximum FLOAT8,
            current_maximum FLOAT8,
            voltage_imbalance FLOAT8,
            current_imbalance FLOAT8,
            a_b_phase_voltage_angle FLOAT8,
            b_C_phase_voltage_angle FLOAT8,
            c_a_phase_voltage_angle FLOAT8,
            first_quadrant_reactive_energy FLOAT8,
            second_quadrant_reactive_energy FLOAT8,
            third_quadrant_reactive_energy FLOAT8,
            fourth_quadrant_reactive_power FLOAT8,
            timestamp TIMESTAMPTZ NOT NULL,
            CONSTRAINT fk_device_daily FOREIGN KEY(device_id) REFERENCES device(id)
        )
        """,
        """
        CREATE TABLE IF NOT EXISTS data_weekly (
            id SERIAL PRIMARY KEY,
            device_id INT NOT NULL,
            phase_voltage_a FLOAT8,
            phase_voltage_b FLOAT8,
            phase_voltage_c FLOAT8,
            wire_voltage_ab FLOAT8,
            wire_voltage_bc FLOAT8,
            wire_voltage_ca FLOAT8,
            phase_current_a FLOAT8,
            phase_current_b FLOAT8,
            phase_current_c FLOAT8,
            active_power_a FLOAT8,
            active_power_b FLOAT8,
            active_power_c FLOAT8,
            reactive_power_a FLOAT8,
            reactive_power_b FLOAT8,
            reactive_power_c FLOAT8,
            apparent_power_a FLOAT8,
            apparent_power_b FLOAT8,
            apparent_power_c FLOAT8,
            power_factor_a FLOAT8,
            power_factor_b FLOAT8,
            power_factor_c FLOAT8,
            frequency FLOAT8,
            active_power FLOAT8,
            reactive_power FLOAT8,
            positive_active_power FLOAT8,
            negative_active_power FLOAT8,
            positive_reactive_power FLOAT8,
            negative_reactive_power FLOAT8,
            current_active_power_demand FLOAT8,
            maximum_active_power_demand FLOAT8,
            current_reactive_power_demand FLOAT8,
            maximum_reactive_power_demand FLOAT8,
            a_phase_voltage_total_harmonic_content FLOAT8,
            b_phase_voltage_total_harmonic_content FLOAT8,
            c_phase_voltage_total_harmonic_content FLOAT8,
            a_phase_current_total_harmonic_content FLOAT8,
            b_phase_current_total_harmonic_content FLOAT8,
            c_phase_current_total_harmonic_content FLOAT8,
            o_phase_current FLOAT8,
            phase_voltage_maximum FLOAT8,
            Wires_voltage_maximum FLOAT8,
            current_maximum FLOAT8,
            voltage_imbalance FLOAT8,
            current_imbalance FLOAT8,
            a_b_phase_voltage_angle FLOAT8,
            b_C_phase_voltage_angle FLOAT8,
            c_a_phase_voltage_angle FLOAT8,
            first_quadrant_reactive_energy FLOAT8,
            second_quadrant_reactive_energy FLOAT8,
            third_quadrant_reactive_energy FLOAT8,
            fourth_quadrant_reactive_power FLOAT8,
            timestamp TIMESTAMPTZ NOT NULL,
            CONSTRAINT fk_device_daily FOREIGN KEY(device_id) REFERENCES device(id)
        )
        """,
        """
        CREATE TABLE IF NOT EXISTS data_monthly (
            id SERIAL PRIMARY KEY,
            device_id INT NOT NULL,
            phase_voltage_a FLOAT8,
            phase_voltage_b FLOAT8,
            phase_voltage_c FLOAT8,
            wire_voltage_ab FLOAT8,
            wire_voltage_bc FLOAT8,
            wire_voltage_ca FLOAT8,
            phase_current_a FLOAT8,
            phase_current_b FLOAT8,
            phase_current_c FLOAT8,
            active_power_a FLOAT8,
            active_power_b FLOAT8,
            active_power_c FLOAT8,
            reactive_power_a FLOAT8,
            reactive_power_b FLOAT8,
            reactive_power_c FLOAT8,
            apparent_power_a FLOAT8,
            apparent_power_b FLOAT8,
            apparent_power_c FLOAT8,
            power_factor_a FLOAT8,
            power_factor_b FLOAT8,
            power_factor_c FLOAT8,
            frequency FLOAT8,
            active_power FLOAT8,
            reactive_power FLOAT8,
            positive_active_power FLOAT8,
            negative_active_power FLOAT8,
            positive_reactive_power FLOAT8,
            negative_reactive_power FLOAT8,
            current_active_power_demand FLOAT8,
            maximum_active_power_demand FLOAT8,
            current_reactive_power_demand FLOAT8,
            maximum_reactive_power_demand FLOAT8,
            a_phase_voltage_total_harmonic_content FLOAT8,
            b_phase_voltage_total_harmonic_content FLOAT8,
            c_phase_voltage_total_harmonic_content FLOAT8,
            a_phase_current_total_harmonic_content FLOAT8,
            b_phase_current_total_harmonic_content FLOAT8,
            c_phase_current_total_harmonic_content FLOAT8,
            o_phase_current FLOAT8,
            phase_voltage_maximum FLOAT8,
            Wires_voltage_maximum FLOAT8,
            current_maximum FLOAT8,
            voltage_imbalance FLOAT8,
            current_imbalance FLOAT8,
            a_b_phase_voltage_angle FLOAT8,
            b_C_phase_voltage_angle FLOAT8,
            c_a_phase_voltage_angle FLOAT8,
            first_quadrant_reactive_energy FLOAT8,
            second_quadrant_reactive_energy FLOAT8,
            third_quadrant_reactive_energy FLOAT8,
            fourth_quadrant_reactive_power FLOAT8,
            timestamp TIMESTAMPTZ NOT NULL,
            CONSTRAINT fk_device_monthly FOREIGN KEY(device_id) REFERENCES device(id)
        )
        """,
        """
        CREATE TABLE IF NOT EXISTS data_yearly (
            id SERIAL PRIMARY KEY,
            device_id INT NOT NULL,
            phase_voltage_a FLOAT8,
            phase_voltage_b FLOAT8,
            phase_voltage_c FLOAT8,
            wire_voltage_ab FLOAT8,
            wire_voltage_bc FLOAT8,
            wire_voltage_ca FLOAT8,
            phase_current_a FLOAT8,
            phase_current_b FLOAT8,
            phase_current_c FLOAT8,
            active_power_a FLOAT8,
            active_power_b FLOAT8,
            active_power_c FLOAT8,
            reactive_power_a FLOAT8,
            reactive_power_b FLOAT8,
            reactive_power_c FLOAT8,
            apparent_power_a FLOAT8,
            apparent_power_b FLOAT8,
            apparent_power_c FLOAT8,
            power_factor_a FLOAT8,
            power_factor_b FLOAT8,
            power_factor_c FLOAT8,
            frequency FLOAT8,
            active_power FLOAT8,
            reactive_power FLOAT8,
            positive_active_power FLOAT8,
            negative_active_power FLOAT8,
            positive_reactive_power FLOAT8,
            negative_reactive_power FLOAT8,
            current_active_power_demand FLOAT8,
            maximum_active_power_demand FLOAT8,
            current_reactive_power_demand FLOAT8,
            maximum_reactive_power_demand FLOAT8,
            a_phase_voltage_total_harmonic_content FLOAT8,
            b_phase_voltage_total_harmonic_content FLOAT8,
            c_phase_voltage_total_harmonic_content FLOAT8,
            a_phase_current_total_harmonic_content FLOAT8,
            b_phase_current_total_harmonic_content FLOAT8,
            c_phase_current_total_harmonic_content FLOAT8,
            o_phase_current FLOAT8,
            phase_voltage_maximum FLOAT8,
            Wires_voltage_maximum FLOAT8,
            current_maximum FLOAT8,
            voltage_imbalance FLOAT8,
            current_imbalance FLOAT8,
            a_b_phase_voltage_angle FLOAT8,
            b_C_phase_voltage_angle FLOAT8,
            c_a_phase_voltage_angle FLOAT8,
            first_quadrant_reactive_energy FLOAT8,
            second_quadrant_reactive_energy FLOAT8,
            third_quadrant_reactive_energy FLOAT8,
            fourth_quadrant_reactive_power FLOAT8,
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
        """
    )
    config_db = config.load_config()
    try:
        with psycopg2.connect(**config_db) as conn:
            with conn.cursor() as cur:
                for command in commands:
                    cur.execute(command)
    except (psycopg2.DatabaseError, Exception) as error:
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

if __name__ == '__main__':
    create_tables()
