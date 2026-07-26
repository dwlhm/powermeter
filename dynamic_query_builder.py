LATEST_KEYS = [
    "first_quadrant_reactive_energy",
    "second_quadrant_reactive_energy",
    "third_quadrant_reactive_energy",
    "fourth_quadrant_reactive_power",
    "active_power",
    "reactive_power",
    "positive_active_power",
    "negative_active_power",
    "positive_reactive_power",
    "negative_reactive_power",
]

def build_cron_queries(keys, src_table, dst_table, time_filters):
    sql_check_data = f"SELECT id FROM {src_table} WHERE device_id = %s AND {time_filters} ORDER BY id DESC LIMIT 1"

    jsonb_args = []
    for key in keys:
        if key in LATEST_KEYS:
            val_sql = f"(SELECT (metrics->>'{key}')::NUMERIC FROM {src_table} WHERE id = %s)"
        else:
            val_sql = f"AVG((metrics->>'{key}')::NUMERIC)"
        jsonb_args.append(f"'{key}', {val_sql}")

    jsonb_str = ",\n        ".join(jsonb_args)
    if not jsonb_str:
        jsonb_str = "'empty', 0"

    sql_copy_avg = f"""INSERT INTO {dst_table} (
        device_id,
        metrics,
        timestamp
    ) 
    SELECT    
        %s,
        jsonb_build_object(
            {jsonb_str}
        ),
        NOW()
             FROM {src_table}
             WHERE device_id = %s AND
             {time_filters}
        RETURNING id
             """

    return sql_check_data, sql_copy_avg
