from datetime import datetime
import base64

from data import db
from device.db import get_all as get_all_perangkat
from configuration.config import load_config
from database.internal import get as get_db, upsert as upsert_db

sql_check_data = """SELECT id
             FROM data_hourly
             WHERE device_id = %s AND
             DATE_PART('hour', timestamp) = %s AND
             active_power IS NOT NULL
             ORDER BY id DESC LIMIT 1"""


def doAvg(devices, ptr):
    for device in devices.get("data"):
        id = device.get("id")

        check_data = get_db(
            sql=sql_check_data,
            param=(
                base64.b64decode(id).decode(),
                ptr,
            ),
            config=load_config(),
        )

        if check_data.get("error"):
            print("Error: ", check_data.get("error"), " / ", device.get("id"))
            continue

        latest_id_raw = check_data.get("data")

        if len(latest_id_raw) == 0:
            print("Error: ", "no data", " / ", device.get("id"))
            continue

        latest_id = latest_id_raw[0][0]

        insert_avg_data = upsert_db(
            sql=sql_copy_avg,
            param=(base64.b64decode(id).decode(), base64.b64decode(id).decode(), ptr),
            config=load_config(),
        )

        if insert_avg_data.get("error"):
            print("Error: ", insert_avg_data.get("error"), " / ", device.get("id"))
            continue

        inserted_id = insert_avg_data.get("data")[0]

        data = upsert_db(
            sql=sql_update_avg_row,
            param=(latest_id, inserted_id),
            config=load_config(),
        )
        if data.get("error"):
            print("Error: ", data.get("error"), " / ", device.get("id"))
            continue

        if data.get("data"):
            data = data.get("data")
            print(f"data location: {data[0]} / {device.get("id")}")


if __name__ == "__main__":
    devices = get_all_perangkat(config=load_config())
    if devices.get("error"):
        print("Error: ", devices.get("error"))

    ptr = datetime.now().day

    doAvg(devices=devices, ptr=ptr)


sql_copy_avg = """INSERT INTO data_daily (
        phase_voltage_a,
        phase_voltage_b,
        phase_voltage_c,
        wire_voltage_ab,
        wire_voltage_bc,
        wire_voltage_ca,
        phase_current_a,
        phase_current_b,
        phase_current_c,
        active_power_a,
        active_power_b,
        active_power_c,
        reactive_power_a,
        reactive_power_b,
        reactive_power_c,
        apparent_power_a,
        apparent_power_b,
        apparent_power_c,
        power_factor_a,
        power_factor_b,
        power_factor_c,
        frequency,
        current_active_power_demand,
        maximum_active_power_demand,
        current_reactive_power_demand,
        maximum_reactive_power_demand,
        a_phase_voltage_total_harmonic_content,
        b_phase_voltage_total_harmonic_content,
        c_phase_voltage_total_harmonic_content,
        a_phase_current_total_harmonic_content,
        b_phase_current_total_harmonic_content,
        c_phase_current_total_harmonic_content,
        o_phase_current,
        phase_voltage_maximum,
        Wires_voltage_maximum,
        current_maximum,
        voltage_imbalance,
        current_imbalance,
        a_b_phase_voltage_angle,
        b_C_phase_voltage_angle,
        c_a_phase_voltage_angle,
        device_id,
        timestamp
    ) 
    SELECT    
        AVG(phase_voltage_a)::NUMERIC(10,2),
        AVG(phase_voltage_b)::NUMERIC(10,2),
        AVG(phase_voltage_c)::NUMERIC(10,2),
        AVG(wire_voltage_ab)::NUMERIC(10,2),
        AVG(wire_voltage_bc)::NUMERIC(10,2),
        AVG(wire_voltage_ca)::NUMERIC(10,2),
        AVG(phase_current_a)::NUMERIC(10,2),
        AVG(phase_current_b)::NUMERIC(10,2),
        AVG(phase_current_c)::NUMERIC(10,2),
        AVG(active_power_a)::NUMERIC(10,2),
        AVG(active_power_b)::NUMERIC(10,2),
        AVG(active_power_c)::NUMERIC(10,2),
        AVG(reactive_power_a)::NUMERIC(10,2),
        AVG(reactive_power_b)::NUMERIC(10,2),
        AVG(reactive_power_c)::NUMERIC(10,2),
        AVG(apparent_power_a)::NUMERIC(10,2),
        AVG(apparent_power_b)::NUMERIC(10,2),
        AVG(apparent_power_c)::NUMERIC(10,2),
        AVG(power_factor_a)::NUMERIC(10,2),
        AVG(power_factor_b)::NUMERIC(10,2),
        AVG(power_factor_c)::NUMERIC(10,2),
        AVG(frequency)::NUMERIC(10,2),
        AVG(current_active_power_demand)::NUMERIC(10,2),
        AVG(maximum_active_power_demand)::NUMERIC(10,2),
        AVG(current_reactive_power_demand)::NUMERIC(10,2),
        AVG(maximum_reactive_power_demand)::NUMERIC(10,2),
        AVG(a_phase_voltage_total_harmonic_content)::NUMERIC(10,2),
        AVG(b_phase_voltage_total_harmonic_content)::NUMERIC(10,2),
        AVG(c_phase_voltage_total_harmonic_content)::NUMERIC(10,2),
        AVG(a_phase_current_total_harmonic_content)::NUMERIC(10,2),
        AVG(b_phase_current_total_harmonic_content)::NUMERIC(10,2),
        AVG(c_phase_current_total_harmonic_content)::NUMERIC(10,2),
        AVG(o_phase_current)::NUMERIC(10,2),
        AVG(phase_voltage_maximum)::NUMERIC(10,2),
        AVG(Wires_voltage_maximum)::NUMERIC(10,2),
        AVG(current_maximum)::NUMERIC(10,2),
        AVG(voltage_imbalance)::NUMERIC(10,2),
        AVG(current_imbalance)::NUMERIC(10,2),
        AVG(a_b_phase_voltage_angle)::NUMERIC(10,2),
        AVG(b_C_phase_voltage_angle)::NUMERIC(10,2),
        AVG(c_a_phase_voltage_angle)::NUMERIC(10,2),
        %s,
        NOW()
             FROM data_hourly
             WHERE device_id = %s AND
             DATE_PART('day', timestamp) = %s
        RETURNING id
             """

sql_update_avg_row = """UPDATE data_daily 
        SET first_quadrant_reactive_energy = sq.first_quadrant_reactive_energy,
            second_quadrant_reactive_energy = sq.second_quadrant_reactive_energy,
            third_quadrant_reactive_energy = sq.third_quadrant_reactive_energy,
            fourth_quadrant_reactive_power = sq.fourth_quadrant_reactive_power,
            active_power = sq.active_power,
            reactive_power = sq.reactive_power,
            positive_active_power = sq.positive_active_power,
            negative_active_power = sq.negative_active_power,
            positive_reactive_power = sq.positive_reactive_power,
            negative_reactive_power = sq.negative_reactive_power,
            timestamp = sq.timestamp
        FROM (SELECT 
                first_quadrant_reactive_energy::NUMERIC(10,2),
                second_quadrant_reactive_energy::NUMERIC(10,2),
                third_quadrant_reactive_energy::NUMERIC(10,2),
                fourth_quadrant_reactive_power::NUMERIC(10,2),
                active_power::NUMERIC(10,2),
                reactive_power::NUMERIC(10,2),
                positive_active_power::NUMERIC(10,2),
                negative_active_power::NUMERIC(10,2),
                positive_reactive_power::NUMERIC(10,2),
                negative_reactive_power::NUMERIC(10,2),
                timestamp
                FROM data_hourly
                WHERE id = %s) AS sq
        WHERE id = %s
        RETURNING id"""
