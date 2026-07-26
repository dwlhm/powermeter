import psycopg
from configuration.config import load_config
from datetime import datetime
import main


def insert_device(device_name, ip_addr, seri):
    """ Insert a new device into the devices table """

    sql = """INSERT INTO device(device_name, ip_addr, seri)
             VALUES(%s, %s, %s) RETURNING id;"""
    
    device_id = None
    config = load_config()

    try:
        with  psycopg.connect(**config) as conn:
            with  conn.cursor() as cur:
                # execute the INSERT statement
                cur.execute(sql, (device_name, ip_addr, seri))

                # get the generated id back                
                rows = cur.fetchone()
                if rows:
                    device_id = rows[0]

                # commit the changes to the database
                conn.commit()
    except (Exception, psycopg.DatabaseError) as error:
        print(error)    
    finally:
        return device_id

def insert_data(device_id, data):
    """ Insert a new data device into the table """

    sql = """INSERT INTO data_latest (device_id, data, timestamp)
             VALUES(%s, %s, %s) 
             ON CONFLICT (device_id)
             DO UPDATE SET data = EXCLUDED.data, timestamp = EXCLUDED.timestamp
             RETURNING timestamp"""
    
    sql2 = """INSERT INTO data_repo (device_id, data, timestamp)
              VALUES(%s, %s, %s)
              RETURNING timestamp"""
    
    result = None
    config = load_config()

    try:
        with  psycopg.connect(**config) as conn:
            with  conn.cursor() as cur:
                now = datetime.now()
                # execute the INSERT statement
                cur.execute(sql, (device_id, data, now))

                cur.execute(sql2, (device_id, data, now))

                # get the generated id back                
                rows = cur.fetchone()
                if rows:
                    result = rows[0]

                # commit the changes to the database
                conn.commit()
    except (Exception, psycopg.DatabaseError) as error:
        print(error)    
    finally:
        return result

    
def insert_new_role(role_name: str):
    """ Insert new role to table """
    sql = """INSERT INTO role (name)
             VALUES(%s)"""
    
    result = None
    config = load_config()

    try:
        with psycopg.connect(**config) as conn:
            with conn.cursor() as cur:
                result = cur.execute(sql, (role_name, ))

                conn.commit()
    except (Exception, psycopg.DatabaseError) as Error:
        result = Error
    finally:
        return result
    
# if __name__ == '__main__':
#     insert_device("3M Co.", "192.168.250.7", "AW9L")