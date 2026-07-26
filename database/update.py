import psycopg
from configuration.config import load_config

def update_device_detail(device_id, device_name, device_ip):
    """ Update device detail """

    sql = """UPDATE device 
             SET device_name = %s,
                 ip_addr = %s 
             WHERE id = %s"""
    
    result = []
    config = load_config()

    try:
        with psycopg.connect(**config) as conn:
            with conn.cursor() as cur:
                res = cur.execute(sql, (device_name, device_ip, device_id))
                result = { "data": True }
                conn.commit()
    except (Exception, psycopg.DatabaseError) as Error:
        result = { "error": Error }
    finally:
        return result
