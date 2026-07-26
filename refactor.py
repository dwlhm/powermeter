import os

scripts = [
    ("corn_calc_data_hourly.py", "data", "data_hourly", 'DATE_PART("year", timestamp) = %s AND DATE_PART("month", timestamp) = %s AND DATE_PART("day", timestamp) = %s AND DATE_PART("hour", timestamp) = %s', ["year", "month", "day", "hour"]),
    ("corn_calc_data_daily.py", "data_hourly", "data_daily", 'DATE_PART("year", timestamp) = %s AND DATE_PART("month", timestamp) = %s AND DATE_PART("day", timestamp) = %s', ["year", "month", "day"]),
    ("corn_calc_data_weekly.py", "data_daily", "data_weekly", 'DATE_PART("year", timestamp) = %s AND DATE_PART("week", timestamp) = %s', ["year", "week"]),
    ("corn_calc_data_monthly.py", "data_daily", "data_monthly", 'DATE_PART("year", timestamp) = %s AND DATE_PART("month", timestamp) = %s', ["year", "month"]),
    ("corn_calc_data_yearly.py", "data_monthly", "data_yearly", 'DATE_PART("year", timestamp) = %s', ["year"]),
]

for script, src, dst, time_filters, args in scripts:
    with open(script, "r") as f:
        content = f.read()

    new_content = f"""from datetime import datetime, timedelta
import base64
from device.db import get_all as get_all_perangkat
from configuration.config import load_config
from database.internal import get as get_db, upsert as upsert_db
from dynamic_query_builder import build_cron_queries

def doAvg(devices, {", ".join(args)}):
    for device in devices.get("data", []):
        id = device.get("id")
        pm_config = device.get("powermeter", {{}})
        registers = pm_config.get("register", [])
        
        # Get dynamic keys
        keys = []
        for reg in registers:
            param_name = reg[4] if len(reg) > 4 else reg[3]
            keys.append(param_name)

        if not keys:
            print("No registers for device:", id)
            continue

        sql_check_data, sql_copy_avg = build_cron_queries(keys, "{src}", "{dst}", '{time_filters}')

        # Check existing row
        check_data = get_db(
            sql=sql_check_data,
            param=(base64.b64decode(id).decode(), {", ".join(args)},),
            config=load_config(),
        )

        if check_data.get("error"):
            print("Error: ", check_data.get("error"), " / ", id)
            continue

        latest_id_raw = check_data.get("data")
        if not latest_id_raw or len(latest_id_raw) == 0:
            print("Error: no data / ", id)
            continue
        
        latest_id = latest_id_raw[0][0]

        # Insert new avg data
        insert_avg_data = upsert_db(
            sql=sql_copy_avg,
            param=(base64.b64decode(id).decode(), latest_id, base64.b64decode(id).decode(), {", ".join(args)},),
            config=load_config(),
        )

        if insert_avg_data.get("error"):
            print("Error: ", insert_avg_data.get("error"), " / ", id)
            continue

        print(f"data upserted / {{id}}")

"""
    # Append the main block that sets up time and calls doAvg
    # We can extract the main block from the old file
    main_idx = content.find('if __name__ == "__main__":')
    if main_idx != -1:
        new_content += content[main_idx:]
    
    with open(script, "w") as f:
        f.write(new_content)
