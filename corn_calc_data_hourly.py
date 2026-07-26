from datetime import datetime, timedelta
import base64
from device.db import get_all as get_all_perangkat
from configuration.config import load_config
from database.internal import get as get_db, upsert as upsert_db
from dynamic_query_builder import build_cron_queries

def doAvg(devices, year, month, day, hour):
    for device in devices.get("data", []):
        id = device.get("id")
        pm_config = device.get("powermeter", {})
        registers = pm_config.get("register", [])
        
        # Get dynamic keys
        keys = []
        for reg in registers:
            param_name = reg[4] if len(reg) > 4 else reg[3]
            keys.append(param_name)

        if not keys:
            print("No registers for device:", id)
            continue

        sql_check_data, sql_copy_avg = build_cron_queries(keys, "data", "data_hourly", 'DATE_PART("year", timestamp) = %s AND DATE_PART("month", timestamp) = %s AND DATE_PART("day", timestamp) = %s AND DATE_PART("hour", timestamp) = %s')

        # Check existing row
        check_data = get_db(
            sql=sql_check_data,
            param=(base64.b64decode(id).decode(), year, month, day, hour,),
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
            param=(base64.b64decode(id).decode(), latest_id, base64.b64decode(id).decode(), year, month, day, hour,),
            config=load_config(),
        )

        if insert_avg_data.get("error"):
            print("Error: ", insert_avg_data.get("error"), " / ", id)
            continue

        print(f"data upserted / {id}")

if __name__ == "__main__":
    devices = get_all_perangkat(config=load_config())
    if devices.get("error"):
        print("Error: ", devices.get("error"))

    i_time = datetime.now() - timedelta(hours=1)
    ptr = i_time.hour

    doAvg(
        devices=devices, 
        year=i_time.year,
        month=i_time.month,
        day=i_time.day,
        hour=i_time.hour,
    )