import psycopg
import base64
from configuration.config import load_config

def get_all_devices_ip():
    config = load_config()
    sql = """SELECT ip_addr, seri, id, device_name FROM device"""
    result = []
    try:
        with psycopg.connect(**config) as conn:
            with conn.cursor() as cur:
                cur.execute(sql)
                res = cur.fetchall()
                result = {
                    "data": res
                }
                
    except (Exception, psycopg.DatabaseError) as Error:
        result = { "error": Error }
    finally:
        return result

def get_device(device_id):
    """ Retrive device by device_id """
    config = load_config()
    sql = """SELECT ip_addr, device_name, seri FROM device
             WHERE id = %s"""
    result = None
    try:
        with psycopg.connect(**config) as conn:
            with conn.cursor() as cur:
                cur.execute(sql, (device_id, ))

                result = cur.fetchone()
    except (Exception, psycopg.DatabaseError) as Error:
        result = Error
    finally:
        return result
    
def get_data_latest(device_id):
    """ Retrive latest data from the device """
    config = load_config()
    sql = """SELECT data, timestamp FROM data_latest
             WHERE device_id = %s"""
    
    result = None
    try:
        with psycopg.connect(**config) as conn:
            with conn.cursor() as cur:
                cur.execute(sql, (device_id, ))

                result = cur.fetchone()

    except (Exception, psycopg.DatabaseError) as Error:
        result = Error
    
    finally:
        return result
    

    
def get_role_by_id(id: str):
    config = load_config()
    sql = """SELECT * FROM role 
             WHERE id = %s"""
    result = None
    try:
        with psycopg.connect(**config) as conn:
            with conn.cursor() as cur:
                cur.execute(sql, (id, ))

                result = cur.fetchone()
    except (Exception, psycopg.DatabaseError) as Error:
        print(Error)
        result = Error
    finally:
        return result
    