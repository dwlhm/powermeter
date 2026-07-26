from configuration.config import load_config
import psycopg

def remove_device(device_id):
    """ Remove device from database """
    config = load_config()
    sql = """DELETE FROM device
             WHERE id = %s"""
    result = None
    try:
        with psycopg.connect(**config) as conn:
            with conn.cursor() as cur:
                result = cur.execute(sql, (device_id))
    except (Exception, psycopg.DatabaseError) as Error:
        result = Error
    finally:
        return result
