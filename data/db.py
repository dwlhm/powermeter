import psycopg
from psycopg import sql
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
    sql = """(SELECT timestamp, (metrics->>'active_power')::NUMERIC(10,2) FROM data_monthly 
             WHERE device_id = %s AND
             date_part('year', timestamp) = %s LIMIT 12)
             UNION ALL
             (SELECT DISTINCT ON (id) timestamp, (metrics->>'active_power')::NUMERIC(10,2) FROM data
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
        (metrics->>'phase_voltage_a')::NUMERIC(10,2),
        (metrics->>'phase_voltage_b')::NUMERIC(10,2),
        (metrics->>'phase_voltage_c')::NUMERIC(10,2),
        (metrics->>'wire_voltage_ab')::NUMERIC(10,2),
        (metrics->>'wire_voltage_bc')::NUMERIC(10,2),
        (metrics->>'wire_voltage_ca')::NUMERIC(10,2),
        (metrics->>'phase_current_a')::NUMERIC(10,2),
        (metrics->>'phase_current_b')::NUMERIC(10,2),
        (metrics->>'phase_current_c')::NUMERIC(10,2),
        (metrics->>'active_power_a')::NUMERIC(10,2),
        (metrics->>'active_power_b')::NUMERIC(10,2),
        (metrics->>'active_power_c')::NUMERIC(10,2),
        (metrics->>'reactive_power_a')::NUMERIC(10,2),
        (metrics->>'reactive_power_b')::NUMERIC(10,2),
        (metrics->>'reactive_power_c')::NUMERIC(10,2),
        (metrics->>'apparent_power_a')::NUMERIC(10,2),
        (metrics->>'apparent_power_b')::NUMERIC(10,2),
        (metrics->>'apparent_power_c')::NUMERIC(10,2),
        (metrics->>'power_factor_a')::NUMERIC(10,2),
        (metrics->>'power_factor_b')::NUMERIC(10,2),
        (metrics->>'power_factor_c')::NUMERIC(10,2),
        (metrics->>'frequency')::NUMERIC(10,2),
        (metrics->>'active_power')::NUMERIC(10,2),
        (metrics->>'reactive_power')::NUMERIC(10,2),
        (metrics->>'positive_active_power')::NUMERIC(10,2),
        (metrics->>'negative_active_power')::NUMERIC(10,2),
        (metrics->>'positive_reactive_power')::NUMERIC(10,2),
        (metrics->>'negative_reactive_power')::NUMERIC(10,2),
        (metrics->>'current_active_power_demand')::NUMERIC(10,2),
        (metrics->>'maximum_active_power_demand')::NUMERIC(10,2),
        (metrics->>'current_reactive_power_demand')::NUMERIC(10,2),
        (metrics->>'maximum_reactive_power_demand')::NUMERIC(10,2),
        (metrics->>'a_phase_voltage_total_harmonic_content')::NUMERIC(10,2),
        (metrics->>'b_phase_voltage_total_harmonic_content')::NUMERIC(10,2),
        (metrics->>'c_phase_voltage_total_harmonic_content')::NUMERIC(10,2),
        (metrics->>'a_phase_current_total_harmonic_content')::NUMERIC(10,2),
        (metrics->>'b_phase_current_total_harmonic_content')::NUMERIC(10,2),
        (metrics->>'c_phase_current_total_harmonic_content')::NUMERIC(10,2),
        (metrics->>'o_phase_current')::NUMERIC(10,2),
        (metrics->>'phase_voltage_maximum')::NUMERIC(10,2),
        (metrics->>'wires_voltage_maximum')::NUMERIC(10,2),
        (metrics->>'current_maximum')::NUMERIC(10,2),
        (metrics->>'voltage_imbalance')::NUMERIC(10,2),
        (metrics->>'current_imbalance')::NUMERIC(10,2),
        (metrics->>'a_b_phase_voltage_angle')::NUMERIC(10,2),
        (metrics->>'b_c_phase_voltage_angle')::NUMERIC(10,2),
        (metrics->>'c_a_phase_voltage_angle')::NUMERIC(10,2),
        (metrics->>'first_quadrant_reactive_energy')::NUMERIC(10,2),
        (metrics->>'second_quadrant_reactive_energy')::NUMERIC(10,2),
        (metrics->>'third_quadrant_reactive_energy')::NUMERIC(10,2),
        (metrics->>'fourth_quadrant_reactive_power')::NUMERIC(10,2),
        timestamp
        FROM {table_name}
        WHERE device_id = %s AND
        timestamp >= cast(%s AS TIMESTAMPTZ)
        ORDER BY id DESC
        LIMIT %s"""

sql_get_data_w_datetime_fromonly = """SELECT DISTINCT ON (id)
        (metrics->>'phase_voltage_a')::NUMERIC(10,2),
        (metrics->>'phase_voltage_b')::NUMERIC(10,2),
        (metrics->>'phase_voltage_c')::NUMERIC(10,2),
        (metrics->>'wire_voltage_ab')::NUMERIC(10,2),
        (metrics->>'wire_voltage_bc')::NUMERIC(10,2),
        (metrics->>'wire_voltage_ca')::NUMERIC(10,2),
        (metrics->>'phase_current_a')::NUMERIC(10,2),
        (metrics->>'phase_current_b')::NUMERIC(10,2),
        (metrics->>'phase_current_c')::NUMERIC(10,2),
        (metrics->>'active_power_a')::NUMERIC(10,2),
        (metrics->>'active_power_b')::NUMERIC(10,2),
        (metrics->>'active_power_c')::NUMERIC(10,2),
        (metrics->>'reactive_power_a')::NUMERIC(10,2),
        (metrics->>'reactive_power_b')::NUMERIC(10,2),
        (metrics->>'reactive_power_c')::NUMERIC(10,2),
        (metrics->>'apparent_power_a')::NUMERIC(10,2),
        (metrics->>'apparent_power_b')::NUMERIC(10,2),
        (metrics->>'apparent_power_c')::NUMERIC(10,2),
        (metrics->>'power_factor_a')::NUMERIC(10,2),
        (metrics->>'power_factor_b')::NUMERIC(10,2),
        (metrics->>'power_factor_c')::NUMERIC(10,2),
        (metrics->>'frequency')::NUMERIC(10,2),
        (metrics->>'active_power')::NUMERIC(10,2),
        (metrics->>'reactive_power')::NUMERIC(10,2),
        (metrics->>'positive_active_power')::NUMERIC(10,2),
        (metrics->>'negative_active_power')::NUMERIC(10,2),
        (metrics->>'positive_reactive_power')::NUMERIC(10,2),
        (metrics->>'negative_reactive_power')::NUMERIC(10,2),
        (metrics->>'current_active_power_demand')::NUMERIC(10,2),
        (metrics->>'maximum_active_power_demand')::NUMERIC(10,2),
        (metrics->>'current_reactive_power_demand')::NUMERIC(10,2),
        (metrics->>'maximum_reactive_power_demand')::NUMERIC(10,2),
        (metrics->>'a_phase_voltage_total_harmonic_content')::NUMERIC(10,2),
        (metrics->>'b_phase_voltage_total_harmonic_content')::NUMERIC(10,2),
        (metrics->>'c_phase_voltage_total_harmonic_content')::NUMERIC(10,2),
        (metrics->>'a_phase_current_total_harmonic_content')::NUMERIC(10,2),
        (metrics->>'b_phase_current_total_harmonic_content')::NUMERIC(10,2),
        (metrics->>'c_phase_current_total_harmonic_content')::NUMERIC(10,2),
        (metrics->>'o_phase_current')::NUMERIC(10,2),
        (metrics->>'phase_voltage_maximum')::NUMERIC(10,2),
        (metrics->>'wires_voltage_maximum')::NUMERIC(10,2),
        (metrics->>'current_maximum')::NUMERIC(10,2),
        (metrics->>'voltage_imbalance')::NUMERIC(10,2),
        (metrics->>'current_imbalance')::NUMERIC(10,2),
        (metrics->>'a_b_phase_voltage_angle')::NUMERIC(10,2),
        (metrics->>'b_c_phase_voltage_angle')::NUMERIC(10,2),
        (metrics->>'c_a_phase_voltage_angle')::NUMERIC(10,2),
        (metrics->>'first_quadrant_reactive_energy')::NUMERIC(10,2),
        (metrics->>'second_quadrant_reactive_energy')::NUMERIC(10,2),
        (metrics->>'third_quadrant_reactive_energy')::NUMERIC(10,2),
        (metrics->>'fourth_quadrant_reactive_power')::NUMERIC(10,2),
        timestamp
        FROM {table_name}
        WHERE device_id = %s AND
        timestamp >= cast(%s AS TIMESTAMPTZ)
        ORDER BY id DESC"""

sql_get_data_w_datetime_limit = """SELECT DISTINCT ON (id)
        (metrics->>'phase_voltage_a')::NUMERIC(10,2),
        (metrics->>'phase_voltage_b')::NUMERIC(10,2),
        (metrics->>'phase_voltage_c')::NUMERIC(10,2),
        (metrics->>'wire_voltage_ab')::NUMERIC(10,2),
        (metrics->>'wire_voltage_bc')::NUMERIC(10,2),
        (metrics->>'wire_voltage_ca')::NUMERIC(10,2),
        (metrics->>'phase_current_a')::NUMERIC(10,2),
        (metrics->>'phase_current_b')::NUMERIC(10,2),
        (metrics->>'phase_current_c')::NUMERIC(10,2),
        (metrics->>'active_power_a')::NUMERIC(10,2),
        (metrics->>'active_power_b')::NUMERIC(10,2),
        (metrics->>'active_power_c')::NUMERIC(10,2),
        (metrics->>'reactive_power_a')::NUMERIC(10,2),
        (metrics->>'reactive_power_b')::NUMERIC(10,2),
        (metrics->>'reactive_power_c')::NUMERIC(10,2),
        (metrics->>'apparent_power_a')::NUMERIC(10,2),
        (metrics->>'apparent_power_b')::NUMERIC(10,2),
        (metrics->>'apparent_power_c')::NUMERIC(10,2),
        (metrics->>'power_factor_a')::NUMERIC(10,2),
        (metrics->>'power_factor_b')::NUMERIC(10,2),
        (metrics->>'power_factor_c')::NUMERIC(10,2),
        (metrics->>'frequency')::NUMERIC(10,2),
        (metrics->>'active_power')::NUMERIC(10,2),
        (metrics->>'reactive_power')::NUMERIC(10,2),
        (metrics->>'positive_active_power')::NUMERIC(10,2),
        (metrics->>'negative_active_power')::NUMERIC(10,2),
        (metrics->>'positive_reactive_power')::NUMERIC(10,2),
        (metrics->>'negative_reactive_power')::NUMERIC(10,2),
        (metrics->>'current_active_power_demand')::NUMERIC(10,2),
        (metrics->>'maximum_active_power_demand')::NUMERIC(10,2),
        (metrics->>'current_reactive_power_demand')::NUMERIC(10,2),
        (metrics->>'maximum_reactive_power_demand')::NUMERIC(10,2),
        (metrics->>'a_phase_voltage_total_harmonic_content')::NUMERIC(10,2),
        (metrics->>'b_phase_voltage_total_harmonic_content')::NUMERIC(10,2),
        (metrics->>'c_phase_voltage_total_harmonic_content')::NUMERIC(10,2),
        (metrics->>'a_phase_current_total_harmonic_content')::NUMERIC(10,2),
        (metrics->>'b_phase_current_total_harmonic_content')::NUMERIC(10,2),
        (metrics->>'c_phase_current_total_harmonic_content')::NUMERIC(10,2),
        (metrics->>'o_phase_current')::NUMERIC(10,2),
        (metrics->>'phase_voltage_maximum')::NUMERIC(10,2),
        (metrics->>'wires_voltage_maximum')::NUMERIC(10,2),
        (metrics->>'current_maximum')::NUMERIC(10,2),
        (metrics->>'voltage_imbalance')::NUMERIC(10,2),
        (metrics->>'current_imbalance')::NUMERIC(10,2),
        (metrics->>'a_b_phase_voltage_angle')::NUMERIC(10,2),
        (metrics->>'b_c_phase_voltage_angle')::NUMERIC(10,2),
        (metrics->>'c_a_phase_voltage_angle')::NUMERIC(10,2),
        (metrics->>'first_quadrant_reactive_energy')::NUMERIC(10,2),
        (metrics->>'second_quadrant_reactive_energy')::NUMERIC(10,2),
        (metrics->>'third_quadrant_reactive_energy')::NUMERIC(10,2),
        (metrics->>'fourth_quadrant_reactive_power')::NUMERIC(10,2),
        timestamp
        FROM {table_name}
        WHERE device_id = %s AND
        timestamp BETWEEN cast(%s AS TIMESTAMPTZ) AND cast(%s AS TIMESTAMPTZ)
        ORDER BY id DESC
        LIMIT %s"""

sql_get_data_w_datetime = """SELECT DISTINCT ON (id)
        (metrics->>'phase_voltage_a')::NUMERIC(10,2),
        (metrics->>'phase_voltage_b')::NUMERIC(10,2),
        (metrics->>'phase_voltage_c')::NUMERIC(10,2),
        (metrics->>'wire_voltage_ab')::NUMERIC(10,2),
        (metrics->>'wire_voltage_bc')::NUMERIC(10,2),
        (metrics->>'wire_voltage_ca')::NUMERIC(10,2),
        (metrics->>'phase_current_a')::NUMERIC(10,2),
        (metrics->>'phase_current_b')::NUMERIC(10,2),
        (metrics->>'phase_current_c')::NUMERIC(10,2),
        (metrics->>'active_power_a')::NUMERIC(10,2),
        (metrics->>'active_power_b')::NUMERIC(10,2),
        (metrics->>'active_power_c')::NUMERIC(10,2),
        (metrics->>'reactive_power_a')::NUMERIC(10,2),
        (metrics->>'reactive_power_b')::NUMERIC(10,2),
        (metrics->>'reactive_power_c')::NUMERIC(10,2),
        (metrics->>'apparent_power_a')::NUMERIC(10,2),
        (metrics->>'apparent_power_b')::NUMERIC(10,2),
        (metrics->>'apparent_power_c')::NUMERIC(10,2),
        (metrics->>'power_factor_a')::NUMERIC(10,2),
        (metrics->>'power_factor_b')::NUMERIC(10,2),
        (metrics->>'power_factor_c')::NUMERIC(10,2),
        (metrics->>'frequency')::NUMERIC(10,2),
        (metrics->>'active_power')::NUMERIC(10,2),
        (metrics->>'reactive_power')::NUMERIC(10,2),
        (metrics->>'positive_active_power')::NUMERIC(10,2),
        (metrics->>'negative_active_power')::NUMERIC(10,2),
        (metrics->>'positive_reactive_power')::NUMERIC(10,2),
        (metrics->>'negative_reactive_power')::NUMERIC(10,2),
        (metrics->>'current_active_power_demand')::NUMERIC(10,2),
        (metrics->>'maximum_active_power_demand')::NUMERIC(10,2),
        (metrics->>'current_reactive_power_demand')::NUMERIC(10,2),
        (metrics->>'maximum_reactive_power_demand')::NUMERIC(10,2),
        (metrics->>'a_phase_voltage_total_harmonic_content')::NUMERIC(10,2),
        (metrics->>'b_phase_voltage_total_harmonic_content')::NUMERIC(10,2),
        (metrics->>'c_phase_voltage_total_harmonic_content')::NUMERIC(10,2),
        (metrics->>'a_phase_current_total_harmonic_content')::NUMERIC(10,2),
        (metrics->>'b_phase_current_total_harmonic_content')::NUMERIC(10,2),
        (metrics->>'c_phase_current_total_harmonic_content')::NUMERIC(10,2),
        (metrics->>'o_phase_current')::NUMERIC(10,2),
        (metrics->>'phase_voltage_maximum')::NUMERIC(10,2),
        (metrics->>'wires_voltage_maximum')::NUMERIC(10,2),
        (metrics->>'current_maximum')::NUMERIC(10,2),
        (metrics->>'voltage_imbalance')::NUMERIC(10,2),
        (metrics->>'current_imbalance')::NUMERIC(10,2),
        (metrics->>'a_b_phase_voltage_angle')::NUMERIC(10,2),
        (metrics->>'b_c_phase_voltage_angle')::NUMERIC(10,2),
        (metrics->>'c_a_phase_voltage_angle')::NUMERIC(10,2),
        (metrics->>'first_quadrant_reactive_energy')::NUMERIC(10,2),
        (metrics->>'second_quadrant_reactive_energy')::NUMERIC(10,2),
        (metrics->>'third_quadrant_reactive_energy')::NUMERIC(10,2),
        (metrics->>'fourth_quadrant_reactive_power')::NUMERIC(10,2),
        timestamp
        FROM {table_name}
        WHERE device_id = %s AND
        timestamp BETWEEN cast(%s AS TIMESTAMPTZ) AND cast(%s AS TIMESTAMPTZ)
        ORDER BY id DESC"""

sql_get_data_w_limit = """SELECT DISTINCT ON (id)
        (metrics->>'phase_voltage_a')::NUMERIC(10,2),
        (metrics->>'phase_voltage_b')::NUMERIC(10,2),
        (metrics->>'phase_voltage_c')::NUMERIC(10,2),
        (metrics->>'wire_voltage_ab')::NUMERIC(10,2),
        (metrics->>'wire_voltage_bc')::NUMERIC(10,2),
        (metrics->>'wire_voltage_ca')::NUMERIC(10,2),
        (metrics->>'phase_current_a')::NUMERIC(10,2),
        (metrics->>'phase_current_b')::NUMERIC(10,2),
        (metrics->>'phase_current_c')::NUMERIC(10,2),
        (metrics->>'active_power_a')::NUMERIC(10,2),
        (metrics->>'active_power_b')::NUMERIC(10,2),
        (metrics->>'active_power_c')::NUMERIC(10,2),
        (metrics->>'reactive_power_a')::NUMERIC(10,2),
        (metrics->>'reactive_power_b')::NUMERIC(10,2),
        (metrics->>'reactive_power_c')::NUMERIC(10,2),
        (metrics->>'apparent_power_a')::NUMERIC(10,2),
        (metrics->>'apparent_power_b')::NUMERIC(10,2),
        (metrics->>'apparent_power_c')::NUMERIC(10,2),
        (metrics->>'power_factor_a')::NUMERIC(10,2),
        (metrics->>'power_factor_b')::NUMERIC(10,2),
        (metrics->>'power_factor_c')::NUMERIC(10,2),
        (metrics->>'frequency')::NUMERIC(10,2),
        (metrics->>'active_power')::NUMERIC(10,2),
        (metrics->>'reactive_power')::NUMERIC(10,2),
        (metrics->>'positive_active_power')::NUMERIC(10,2),
        (metrics->>'negative_active_power')::NUMERIC(10,2),
        (metrics->>'positive_reactive_power')::NUMERIC(10,2),
        (metrics->>'negative_reactive_power')::NUMERIC(10,2),
        (metrics->>'current_active_power_demand')::NUMERIC(10,2),
        (metrics->>'maximum_active_power_demand')::NUMERIC(10,2),
        (metrics->>'current_reactive_power_demand')::NUMERIC(10,2),
        (metrics->>'maximum_reactive_power_demand')::NUMERIC(10,2),
        (metrics->>'a_phase_voltage_total_harmonic_content')::NUMERIC(10,2),
        (metrics->>'b_phase_voltage_total_harmonic_content')::NUMERIC(10,2),
        (metrics->>'c_phase_voltage_total_harmonic_content')::NUMERIC(10,2),
        (metrics->>'a_phase_current_total_harmonic_content')::NUMERIC(10,2),
        (metrics->>'b_phase_current_total_harmonic_content')::NUMERIC(10,2),
        (metrics->>'c_phase_current_total_harmonic_content')::NUMERIC(10,2),
        (metrics->>'o_phase_current')::NUMERIC(10,2),
        (metrics->>'phase_voltage_maximum')::NUMERIC(10,2),
        (metrics->>'wires_voltage_maximum')::NUMERIC(10,2),
        (metrics->>'current_maximum')::NUMERIC(10,2),
        (metrics->>'voltage_imbalance')::NUMERIC(10,2),
        (metrics->>'current_imbalance')::NUMERIC(10,2),
        (metrics->>'a_b_phase_voltage_angle')::NUMERIC(10,2),
        (metrics->>'b_c_phase_voltage_angle')::NUMERIC(10,2),
        (metrics->>'c_a_phase_voltage_angle')::NUMERIC(10,2),
        (metrics->>'first_quadrant_reactive_energy')::NUMERIC(10,2),
        (metrics->>'second_quadrant_reactive_energy')::NUMERIC(10,2),
        (metrics->>'third_quadrant_reactive_energy')::NUMERIC(10,2),
        (metrics->>'fourth_quadrant_reactive_power')::NUMERIC(10,2),
        timestamp
        FROM {table_name}
        WHERE device_id = %s 
        ORDER BY id DESC
        LIMIT %s"""

sql_copy_avg = """INSERT INTO {table_name} (
        device_id,
        metrics,
        timestamp
    ) 
    SELECT    
        %s,
        jsonb_build_object(
        'phase_voltage_a', AVG((metrics->>'phase_voltage_a')::NUMERIC),
        'phase_voltage_b', AVG((metrics->>'phase_voltage_b')::NUMERIC),
        'phase_voltage_c', AVG((metrics->>'phase_voltage_c')::NUMERIC),
        'wire_voltage_ab', AVG((metrics->>'wire_voltage_ab')::NUMERIC),
        'wire_voltage_bc', AVG((metrics->>'wire_voltage_bc')::NUMERIC),
        'wire_voltage_ca', AVG((metrics->>'wire_voltage_ca')::NUMERIC),
        'phase_current_a', AVG((metrics->>'phase_current_a')::NUMERIC),
        'phase_current_b', AVG((metrics->>'phase_current_b')::NUMERIC),
        'phase_current_c', AVG((metrics->>'phase_current_c')::NUMERIC),
        'active_power_a', AVG((metrics->>'active_power_a')::NUMERIC),
        'active_power_b', AVG((metrics->>'active_power_b')::NUMERIC),
        'active_power_c', AVG((metrics->>'active_power_c')::NUMERIC),
        'reactive_power_a', AVG((metrics->>'reactive_power_a')::NUMERIC),
        'reactive_power_b', AVG((metrics->>'reactive_power_b')::NUMERIC),
        'reactive_power_c', AVG((metrics->>'reactive_power_c')::NUMERIC),
        'apparent_power_a', AVG((metrics->>'apparent_power_a')::NUMERIC),
        'apparent_power_b', AVG((metrics->>'apparent_power_b')::NUMERIC),
        'apparent_power_c', AVG((metrics->>'apparent_power_c')::NUMERIC),
        'power_factor_a', AVG((metrics->>'power_factor_a')::NUMERIC),
        'power_factor_b', AVG((metrics->>'power_factor_b')::NUMERIC),
        'power_factor_c', AVG((metrics->>'power_factor_c')::NUMERIC),
        'frequency', AVG((metrics->>'frequency')::NUMERIC),
        'active_power', AVG((metrics->>'active_power')::NUMERIC),
        'reactive_power', AVG((metrics->>'reactive_power')::NUMERIC),
        'positive_active_power', AVG((metrics->>'positive_active_power')::NUMERIC),
        'negative_active_power', AVG((metrics->>'negative_active_power')::NUMERIC),
        'positive_reactive_power', AVG((metrics->>'positive_reactive_power')::NUMERIC),
        'negative_reactive_power', AVG((metrics->>'negative_reactive_power')::NUMERIC),
        'current_active_power_demand', AVG((metrics->>'current_active_power_demand')::NUMERIC),
        'maximum_active_power_demand', AVG((metrics->>'maximum_active_power_demand')::NUMERIC),
        'current_reactive_power_demand', AVG((metrics->>'current_reactive_power_demand')::NUMERIC),
        'maximum_reactive_power_demand', AVG((metrics->>'maximum_reactive_power_demand')::NUMERIC),
        'a_phase_voltage_total_harmonic_content', AVG((metrics->>'a_phase_voltage_total_harmonic_content')::NUMERIC),
        'b_phase_voltage_total_harmonic_content', AVG((metrics->>'b_phase_voltage_total_harmonic_content')::NUMERIC),
        'c_phase_voltage_total_harmonic_content', AVG((metrics->>'c_phase_voltage_total_harmonic_content')::NUMERIC),
        'a_phase_current_total_harmonic_content', AVG((metrics->>'a_phase_current_total_harmonic_content')::NUMERIC),
        'b_phase_current_total_harmonic_content', AVG((metrics->>'b_phase_current_total_harmonic_content')::NUMERIC),
        'c_phase_current_total_harmonic_content', AVG((metrics->>'c_phase_current_total_harmonic_content')::NUMERIC),
        'o_phase_current', AVG((metrics->>'o_phase_current')::NUMERIC),
        'phase_voltage_maximum', AVG((metrics->>'phase_voltage_maximum')::NUMERIC),
        'wires_voltage_maximum', AVG((metrics->>'wires_voltage_maximum')::NUMERIC),
        'current_maximum', AVG((metrics->>'current_maximum')::NUMERIC),
        'voltage_imbalance', AVG((metrics->>'voltage_imbalance')::NUMERIC),
        'current_imbalance', AVG((metrics->>'current_imbalance')::NUMERIC),
        'a_b_phase_voltage_angle', AVG((metrics->>'a_b_phase_voltage_angle')::NUMERIC),
        'b_c_phase_voltage_angle', AVG((metrics->>'b_c_phase_voltage_angle')::NUMERIC),
        'c_a_phase_voltage_angle', AVG((metrics->>'c_a_phase_voltage_angle')::NUMERIC),
        'first_quadrant_reactive_energy', AVG((metrics->>'first_quadrant_reactive_energy')::NUMERIC),
        'second_quadrant_reactive_energy', AVG((metrics->>'second_quadrant_reactive_energy')::NUMERIC),
        'third_quadrant_reactive_energy', AVG((metrics->>'third_quadrant_reactive_energy')::NUMERIC),
        'fourth_quadrant_reactive_power', AVG((metrics->>'fourth_quadrant_reactive_power')::NUMERIC)
        ),
        cast(%s AS TIMESTAMPTZ)
             FROM {table_ref}
             WHERE device_id = %s AND
             timestamp BETWEEN cast(%s AS TIMESTAMPTZ) AND cast(%s AS TIMESTAMPTZ)
        RETURNING id
             """

sql_update_avg_row = """UPDATE {table_name} 
        SET metrics = jsonb_build_object(
        'first_quadrant_reactive_energy', sq.first_quadrant_reactive_energy,
        'second_quadrant_reactive_energy', sq.second_quadrant_reactive_energy,
        'third_quadrant_reactive_energy', sq.third_quadrant_reactive_energy,
        'fourth_quadrant_reactive_power', sq.fourth_quadrant_reactive_power,
        'active_power', sq.active_power,
        'reactive_power', sq.reactive_power,
        'positive_active_power', sq.positive_active_power,
        'negative_active_power', sq.negative_active_power,
        'positive_reactive_power', sq.positive_reactive_power,
        'negative_reactive_power', sq.negative_reactive_power
        ),
            timestamp = sq.timestamp
        FROM (SELECT DISTINCT ON (id)
                (metrics->>'first_quadrant_reactive_energy')::NUMERIC(10,2) AS first_quadrant_reactive_energy,
                (metrics->>'second_quadrant_reactive_energy')::NUMERIC(10,2) AS second_quadrant_reactive_energy,
                (metrics->>'third_quadrant_reactive_energy')::NUMERIC(10,2) AS third_quadrant_reactive_energy,
                (metrics->>'fourth_quadrant_reactive_power')::NUMERIC(10,2) AS fourth_quadrant_reactive_power,
                (metrics->>'active_power')::NUMERIC(10,2) AS active_power,
                (metrics->>'reactive_power')::NUMERIC(10,2) AS reactive_power,
                (metrics->>'positive_active_power')::NUMERIC(10,2) AS positive_active_power,
                (metrics->>'negative_active_power')::NUMERIC(10,2) AS negative_active_power,
                (metrics->>'positive_reactive_power')::NUMERIC(10,2) AS positive_reactive_power,
                (metrics->>'negative_reactive_power')::NUMERIC(10,2) AS negative_reactive_power,
                timestamp
                FROM {table_ref}
                WHERE device_id = %s AND
                DATE_PART('hour', timestamp) = %s
                ORDER BY id DESC
                LIMIT 1) AS sq
        WHERE id = %s
        RETURNING id"""
