import psycopg2
from psycopg2 import sql
import base64
from datetime import datetime, timedelta
from database.internal import get as get_db, upsert as upsert_db

def get_data_with_datetime_fromonly_limit(interval, id, date_from, limit, config):

    if (interval == "realtime"):
        mode_name = "data"
    else:
        mode_name = "data_" + interval
    
    return get_db(
        sql=sql.SQL(sql_get_data_w_datetime_fromonly_limit).format(table_name=sql.Identifier(mode_name)), 
        param=( base64.b64decode(id).decode(), date_from, limit, ), 
        config=config
        )

def get_data_with_datetime_fromonly(interval, id, date_from, config):

    if (interval == "realtime"):
        mode_name = "data"
    else:
        mode_name = "data_" + interval
    
    return get_db(
        sql=sql.SQL(sql_get_data_w_datetime_fromonly).format(table_name=sql.Identifier(mode_name)), 
        param=( base64.b64decode(id).decode(), date_from, ), 
        config=config
        )

def get_data_with_datetime_limit(interval, id, date_from, date_to, limit, config):

    if (interval == "realtime"):
        mode_name = "data"
    else:
        mode_name = "data_" + interval
    
    return get_db(
        sql=sql.SQL(sql_get_data_w_datetime_limit).format(table_name=sql.Identifier(mode_name)), 
        param=( base64.b64decode(id).decode(), date_from, date_to, limit, ), 
        config=config
        )

def get_data_with_datetime(interval, id, date_from, date_to, config):

    if (interval == "realtime"):
        mode_name = "data"
    else:
        mode_name = "data_" + interval
    
    return get_db(
        sql=sql.SQL(sql_get_data_w_datetime).format(table_name=sql.Identifier(mode_name)), 
        param=( base64.b64decode(id).decode(), date_from, date_to, ), 
        config=config
        )

def get_data_with_limit(interval, id, limit, config):
    
    if (interval == "realtime"):
        mode_name = "data"
    else:
        mode_name = "data_" + interval

    return get_db(
        sql=sql.SQL(sql_get_data_w_limit).format(table_name=sql.Identifier(mode_name)), 
        param=( base64.b64decode(id).decode(), limit, ), 
        config=config)

def data_action_avg(interval: str, id:str, point: int, config: any):

    mode_name = "data_" + interval
    ref = "data"
    intv = "hour"
    match interval:
        case "hourly":
            ref = "data"
            intv = "hour"
        case "daily":
            ref = "data_hourly"
            intv = "day"
        case "weekly":
            ref = "data_daily"
            intv = "week"
        case "monthly":
            ref = "data_weekly"
            intv = "month"
        case "yearly":
            ref = "data_monthly"
            intv = "year"
        case _:
            return {
                "error": "invalid interval"
            }

    date = get_date(mode_id=interval)

    main_row =  upsert_db(
        sql=sql.SQL(sql_copy_avg).format(table_name=sql.Identifier(mode_name), table_ref=sql.Identifier(ref)),
        param=(base64.b64decode(id).decode(), date.get("to"), base64.b64decode(id).decode(), date.get("from"), date.get("to"), ),
        config=config
    )

    if main_row.get("error"): return main_row.get("error")

    main_row_value = main_row.get("data")

    main_row_id = main_row_value[0]

    return upsert_db(
        sql=sql.SQL(sql_update_avg_row).format(table_name=sql.Identifier(mode_name), table_ref=sql.Identifier(ref)),
        param=(base64.b64decode(id).decode(), point, main_row_id, ),
        config=config
    )

def get_consumption(device_id: str, year: int, config: any):
    sql = """(SELECT timestamp, active_power::NUMERIC(10,2) FROM data_monthly 
             WHERE device_id = %s AND
             date_part('year', timestamp) = %s LIMIT 12)
             UNION ALL
             (SELECT DISTINCT ON (id) timestamp, active_power::NUMERIC(10,2) FROM data
             WHERE device_id = %s ORDER BY id DESC LIMIT 1)"""
    
    return get_db(
        sql=sql,
        param=(base64.b64decode(device_id).decode(), year, base64.b64decode(device_id).decode(),),
        config=config
    )


def get_date(mode_id: str):
    match mode_id:
        case "hourly":
            return {
                "to": datetime.now(),
                "from": datetime.now() - timedelta(hours=1)
            }
        case "daily":
            return {
                "to": datetime.now(),
                "from": datetime.now() - timedelta(days=1)
            }
        case "weekly":
            return {
                "to": datetime.now(),
                "from": datetime.now() - timedelta(weeks=1)
            }
        case "monthly":
            return {
                "to": datetime.now(),
                "from": (datetime.now().replace(day=1) - timedelta(days=31)).replace(day=1)
            }
        case _:
            return {
                "to": datetime.now(),
                "from": datetime.now() - timedelta(hours=1)
            }
        
sql_get_data_w_datetime_fromonly_limit = """SELECT DISTINCT ON (id)
        phase_voltage_a::NUMERIC(10,2),
        phase_voltage_b::NUMERIC(10,2),
        phase_voltage_c::NUMERIC(10,2),
        wire_voltage_ab::NUMERIC(10,2),
        wire_voltage_bc::NUMERIC(10,2),
        wire_voltage_ca::NUMERIC(10,2),
        phase_current_a::NUMERIC(10,2),
        phase_current_b::NUMERIC(10,2),
        phase_current_c::NUMERIC(10,2),
        active_power_a::NUMERIC(10,2),
        active_power_b::NUMERIC(10,2),
        active_power_c::NUMERIC(10,2),
        reactive_power_a::NUMERIC(10,2),
        reactive_power_b::NUMERIC(10,2),
        reactive_power_c::NUMERIC(10,2),
        apparent_power_a::NUMERIC(10,2),
        apparent_power_b::NUMERIC(10,2),
        apparent_power_c::NUMERIC(10,2),
        power_factor_a::NUMERIC(10,2),
        power_factor_b::NUMERIC(10,2),
        power_factor_c::NUMERIC(10,2),
        frequency::NUMERIC(10,2),
        active_power::NUMERIC(10,2),
        reactive_power::NUMERIC(10,2),
        positive_active_power::NUMERIC(10,2),
        negative_active_power::NUMERIC(10,2),
        positive_reactive_power::NUMERIC(10,2),
        negative_reactive_power::NUMERIC(10,2),
        current_active_power_demand::NUMERIC(10,2),
        maximum_active_power_demand::NUMERIC(10,2),
        current_reactive_power_demand::NUMERIC(10,2),
        maximum_reactive_power_demand::NUMERIC(10,2),
        a_phase_voltage_total_harmonic_content::NUMERIC(10,2),
        b_phase_voltage_total_harmonic_content::NUMERIC(10,2),
        c_phase_voltage_total_harmonic_content::NUMERIC(10,2),
        a_phase_current_total_harmonic_content::NUMERIC(10,2),
        b_phase_current_total_harmonic_content::NUMERIC(10,2),
        c_phase_current_total_harmonic_content::NUMERIC(10,2),
        o_phase_current::NUMERIC(10,2),
        phase_voltage_maximum::NUMERIC(10,2),
        Wires_voltage_maximum::NUMERIC(10,2),
        current_maximum::NUMERIC(10,2),
        voltage_imbalance::NUMERIC(10,2),
        current_imbalance::NUMERIC(10,2),
        a_b_phase_voltage_angle::NUMERIC(10,2),
        b_C_phase_voltage_angle::NUMERIC(10,2),
        c_a_phase_voltage_angle::NUMERIC(10,2),
        first_quadrant_reactive_energy::NUMERIC(10,2),
        second_quadrant_reactive_energy::NUMERIC(10,2),
        third_quadrant_reactive_energy::NUMERIC(10,2),
        fourth_quadrant_reactive_power::NUMERIC(10,2),
        timestamp
        FROM {table_name}
        WHERE device_id = %s AND
        timestamp >= cast(%s AS TIMESTAMPTZ)
        ORDER BY id DESC
        LIMIT %s"""

sql_get_data_w_datetime_fromonly = """SELECT DISTINCT ON (id)
        phase_voltage_a::NUMERIC(10,2),
        phase_voltage_b::NUMERIC(10,2),
        phase_voltage_c::NUMERIC(10,2),
        wire_voltage_ab::NUMERIC(10,2),
        wire_voltage_bc::NUMERIC(10,2),
        wire_voltage_ca::NUMERIC(10,2),
        phase_current_a::NUMERIC(10,2),
        phase_current_b::NUMERIC(10,2),
        phase_current_c::NUMERIC(10,2),
        active_power_a::NUMERIC(10,2),
        active_power_b::NUMERIC(10,2),
        active_power_c::NUMERIC(10,2),
        reactive_power_a::NUMERIC(10,2),
        reactive_power_b::NUMERIC(10,2),
        reactive_power_c::NUMERIC(10,2),
        apparent_power_a::NUMERIC(10,2),
        apparent_power_b::NUMERIC(10,2),
        apparent_power_c::NUMERIC(10,2),
        power_factor_a::NUMERIC(10,2),
        power_factor_b::NUMERIC(10,2),
        power_factor_c::NUMERIC(10,2),
        frequency::NUMERIC(10,2),
        active_power::NUMERIC(10,2),
        reactive_power::NUMERIC(10,2),
        positive_active_power::NUMERIC(10,2),
        negative_active_power::NUMERIC(10,2),
        positive_reactive_power::NUMERIC(10,2),
        negative_reactive_power::NUMERIC(10,2),
        current_active_power_demand::NUMERIC(10,2),
        maximum_active_power_demand::NUMERIC(10,2),
        current_reactive_power_demand::NUMERIC(10,2),
        maximum_reactive_power_demand::NUMERIC(10,2),
        a_phase_voltage_total_harmonic_content::NUMERIC(10,2),
        b_phase_voltage_total_harmonic_content::NUMERIC(10,2),
        c_phase_voltage_total_harmonic_content::NUMERIC(10,2),
        a_phase_current_total_harmonic_content::NUMERIC(10,2),
        b_phase_current_total_harmonic_content::NUMERIC(10,2),
        c_phase_current_total_harmonic_content::NUMERIC(10,2),
        o_phase_current::NUMERIC(10,2),
        phase_voltage_maximum::NUMERIC(10,2),
        Wires_voltage_maximum::NUMERIC(10,2),
        current_maximum::NUMERIC(10,2),
        voltage_imbalance::NUMERIC(10,2),
        current_imbalance::NUMERIC(10,2),
        a_b_phase_voltage_angle::NUMERIC(10,2),
        b_C_phase_voltage_angle::NUMERIC(10,2),
        c_a_phase_voltage_angle::NUMERIC(10,2),
        first_quadrant_reactive_energy::NUMERIC(10,2),
        second_quadrant_reactive_energy::NUMERIC(10,2),
        third_quadrant_reactive_energy::NUMERIC(10,2),
        fourth_quadrant_reactive_power::NUMERIC(10,2),
        timestamp
        FROM {table_name}
        WHERE device_id = %s AND
        timestamp >= cast(%s AS TIMESTAMPTZ)
        ORDER BY id DESC"""

sql_get_data_w_datetime_limit = """SELECT DISTINCT ON (id)
        phase_voltage_a::NUMERIC(10,2),
        phase_voltage_b::NUMERIC(10,2),
        phase_voltage_c::NUMERIC(10,2),
        wire_voltage_ab::NUMERIC(10,2),
        wire_voltage_bc::NUMERIC(10,2),
        wire_voltage_ca::NUMERIC(10,2),
        phase_current_a::NUMERIC(10,2),
        phase_current_b::NUMERIC(10,2),
        phase_current_c::NUMERIC(10,2),
        active_power_a::NUMERIC(10,2),
        active_power_b::NUMERIC(10,2),
        active_power_c::NUMERIC(10,2),
        reactive_power_a::NUMERIC(10,2),
        reactive_power_b::NUMERIC(10,2),
        reactive_power_c::NUMERIC(10,2),
        apparent_power_a::NUMERIC(10,2),
        apparent_power_b::NUMERIC(10,2),
        apparent_power_c::NUMERIC(10,2),
        power_factor_a::NUMERIC(10,2),
        power_factor_b::NUMERIC(10,2),
        power_factor_c::NUMERIC(10,2),
        frequency::NUMERIC(10,2),
        active_power::NUMERIC(10,2),
        reactive_power::NUMERIC(10,2),
        positive_active_power::NUMERIC(10,2),
        negative_active_power::NUMERIC(10,2),
        positive_reactive_power::NUMERIC(10,2),
        negative_reactive_power::NUMERIC(10,2),
        current_active_power_demand::NUMERIC(10,2),
        maximum_active_power_demand::NUMERIC(10,2),
        current_reactive_power_demand::NUMERIC(10,2),
        maximum_reactive_power_demand::NUMERIC(10,2),
        a_phase_voltage_total_harmonic_content::NUMERIC(10,2),
        b_phase_voltage_total_harmonic_content::NUMERIC(10,2),
        c_phase_voltage_total_harmonic_content::NUMERIC(10,2),
        a_phase_current_total_harmonic_content::NUMERIC(10,2),
        b_phase_current_total_harmonic_content::NUMERIC(10,2),
        c_phase_current_total_harmonic_content::NUMERIC(10,2),
        o_phase_current::NUMERIC(10,2),
        phase_voltage_maximum::NUMERIC(10,2),
        Wires_voltage_maximum::NUMERIC(10,2),
        current_maximum::NUMERIC(10,2),
        voltage_imbalance::NUMERIC(10,2),
        current_imbalance::NUMERIC(10,2),
        a_b_phase_voltage_angle::NUMERIC(10,2),
        b_C_phase_voltage_angle::NUMERIC(10,2),
        c_a_phase_voltage_angle::NUMERIC(10,2),
        first_quadrant_reactive_energy::NUMERIC(10,2),
        second_quadrant_reactive_energy::NUMERIC(10,2),
        third_quadrant_reactive_energy::NUMERIC(10,2),
        fourth_quadrant_reactive_power::NUMERIC(10,2),
        timestamp
        FROM {table_name}
        WHERE device_id = %s AND
        timestamp BETWEEN cast(%s AS TIMESTAMPTZ) AND cast(%s AS TIMESTAMPTZ)
        ORDER BY id DESC
        LIMIT %s"""

sql_get_data_w_datetime = """SELECT DISTINCT ON (id)
        phase_voltage_a::NUMERIC(10,2),
        phase_voltage_b::NUMERIC(10,2),
        phase_voltage_c::NUMERIC(10,2),
        wire_voltage_ab::NUMERIC(10,2),
        wire_voltage_bc::NUMERIC(10,2),
        wire_voltage_ca::NUMERIC(10,2),
        phase_current_a::NUMERIC(10,2),
        phase_current_b::NUMERIC(10,2),
        phase_current_c::NUMERIC(10,2),
        active_power_a::NUMERIC(10,2),
        active_power_b::NUMERIC(10,2),
        active_power_c::NUMERIC(10,2),
        reactive_power_a::NUMERIC(10,2),
        reactive_power_b::NUMERIC(10,2),
        reactive_power_c::NUMERIC(10,2),
        apparent_power_a::NUMERIC(10,2),
        apparent_power_b::NUMERIC(10,2),
        apparent_power_c::NUMERIC(10,2),
        power_factor_a::NUMERIC(10,2),
        power_factor_b::NUMERIC(10,2),
        power_factor_c::NUMERIC(10,2),
        frequency::NUMERIC(10,2),
        active_power::NUMERIC(10,2),
        reactive_power::NUMERIC(10,2),
        positive_active_power::NUMERIC(10,2),
        negative_active_power::NUMERIC(10,2),
        positive_reactive_power::NUMERIC(10,2),
        negative_reactive_power::NUMERIC(10,2),
        current_active_power_demand::NUMERIC(10,2),
        maximum_active_power_demand::NUMERIC(10,2),
        current_reactive_power_demand::NUMERIC(10,2),
        maximum_reactive_power_demand::NUMERIC(10,2),
        a_phase_voltage_total_harmonic_content::NUMERIC(10,2),
        b_phase_voltage_total_harmonic_content::NUMERIC(10,2),
        c_phase_voltage_total_harmonic_content::NUMERIC(10,2),
        a_phase_current_total_harmonic_content::NUMERIC(10,2),
        b_phase_current_total_harmonic_content::NUMERIC(10,2),
        c_phase_current_total_harmonic_content::NUMERIC(10,2),
        o_phase_current::NUMERIC(10,2),
        phase_voltage_maximum::NUMERIC(10,2),
        Wires_voltage_maximum::NUMERIC(10,2),
        current_maximum::NUMERIC(10,2),
        voltage_imbalance::NUMERIC(10,2),
        current_imbalance::NUMERIC(10,2),
        a_b_phase_voltage_angle::NUMERIC(10,2),
        b_C_phase_voltage_angle::NUMERIC(10,2),
        c_a_phase_voltage_angle::NUMERIC(10,2),
        first_quadrant_reactive_energy::NUMERIC(10,2),
        second_quadrant_reactive_energy::NUMERIC(10,2),
        third_quadrant_reactive_energy::NUMERIC(10,2),
        fourth_quadrant_reactive_power::NUMERIC(10,2),
        timestamp
        FROM {table_name}
        WHERE device_id = %s AND
        timestamp BETWEEN cast(%s AS TIMESTAMPTZ) AND cast(%s AS TIMESTAMPTZ)
        ORDER BY id DESC"""

sql_get_data_w_limit = """SELECT DISTINCT ON (id)
        phase_voltage_a::NUMERIC(10,2),
        phase_voltage_b::NUMERIC(10,2),
        phase_voltage_c::NUMERIC(10,2),
        wire_voltage_ab::NUMERIC(10,2),
        wire_voltage_bc::NUMERIC(10,2),
        wire_voltage_ca::NUMERIC(10,2),
        phase_current_a::NUMERIC(10,2),
        phase_current_b::NUMERIC(10,2),
        phase_current_c::NUMERIC(10,2),
        active_power_a::NUMERIC(10,2),
        active_power_b::NUMERIC(10,2),
        active_power_c::NUMERIC(10,2),
        reactive_power_a::NUMERIC(10,2),
        reactive_power_b::NUMERIC(10,2),
        reactive_power_c::NUMERIC(10,2),
        apparent_power_a::NUMERIC(10,2),
        apparent_power_b::NUMERIC(10,2),
        apparent_power_c::NUMERIC(10,2),
        power_factor_a::NUMERIC(10,2),
        power_factor_b::NUMERIC(10,2),
        power_factor_c::NUMERIC(10,2),
        frequency::NUMERIC(10,2),
        active_power::NUMERIC(10,2),
        reactive_power::NUMERIC(10,2),
        positive_active_power::NUMERIC(10,2),
        negative_active_power::NUMERIC(10,2),
        positive_reactive_power::NUMERIC(10,2),
        negative_reactive_power::NUMERIC(10,2),
        current_active_power_demand::NUMERIC(10,2),
        maximum_active_power_demand::NUMERIC(10,2),
        current_reactive_power_demand::NUMERIC(10,2),
        maximum_reactive_power_demand::NUMERIC(10,2),
        a_phase_voltage_total_harmonic_content::NUMERIC(10,2),
        b_phase_voltage_total_harmonic_content::NUMERIC(10,2),
        c_phase_voltage_total_harmonic_content::NUMERIC(10,2),
        a_phase_current_total_harmonic_content::NUMERIC(10,2),
        b_phase_current_total_harmonic_content::NUMERIC(10,2),
        c_phase_current_total_harmonic_content::NUMERIC(10,2),
        o_phase_current::NUMERIC(10,2),
        phase_voltage_maximum::NUMERIC(10,2),
        Wires_voltage_maximum::NUMERIC(10,2),
        current_maximum::NUMERIC(10,2),
        voltage_imbalance::NUMERIC(10,2),
        current_imbalance::NUMERIC(10,2),
        a_b_phase_voltage_angle::NUMERIC(10,2),
        b_C_phase_voltage_angle::NUMERIC(10,2),
        c_a_phase_voltage_angle::NUMERIC(10,2),
        first_quadrant_reactive_energy::NUMERIC(10,2),
        second_quadrant_reactive_energy::NUMERIC(10,2),
        third_quadrant_reactive_energy::NUMERIC(10,2),
        fourth_quadrant_reactive_power::NUMERIC(10,2),
        timestamp
        FROM {table_name}
        WHERE device_id = %s 
        ORDER BY id DESC
        LIMIT %s"""

sql_copy_avg = """INSERT INTO {table_name} (
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
        cast(%s AS TIMESTAMPTZ)
             FROM {table_ref}
             WHERE device_id = %s AND
             timestamp BETWEEN cast(%s AS TIMESTAMPTZ) AND cast(%s AS TIMESTAMPTZ)
        RETURNING id
             """

sql_update_avg_row = """UPDATE {table_name} 
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
        FROM (SELECT DISTINCT ON (id)
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
                FROM {table_ref}
                WHERE device_id = %s AND
                DATE_PART('hour', timestamp) = %s
                ORDER BY id DESC
                LIMIT 1) AS sq
        WHERE id = %s
        RETURNING id"""
