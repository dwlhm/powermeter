import psycopg
import base64

def get_all(config):
    sql = """SELECT id, name FROM kampus"""

    try:
        with psycopg.connect(**config) as conn:
            with conn.cursor() as cur:
                cur.execute(sql)

                data = cur.fetchall()

                if (len(data) <= 0): return {
                    "error": "no data"
                }

                res = []
                for d in data:
                    res.append({
                        "id": base64.b64encode(str(d[0]).encode()).decode(),
                        "name": d[1]
                    })
                return {
                    "data": res
                }

    except (Exception, psycopg.DatabaseError) as Error:
        print(Error)
        return {
            "error": str(Error)
        }

def get_by_id(id: str, config):
    sql = """SELECT name FROM kampus
             WHERE id = %s"""

    try:
        with psycopg.connect(**config) as conn:
            with conn.cursor() as cur:
                cur.execute(sql, (base64.b64decode(id).decode(), ))

                data = cur.fetchone()

                if (data == None): return {
                    "error": "no data"
                }
                return {
                    "data": {
                        "name": data[0]
                    }
                }

    except (Exception, psycopg.DatabaseError) as Error:
        print(Error)
        return {
            "error": str(Error)
        }


def new(name: str, config):
    sql = """INSERT INTO kampus (name)
             VALUES (%s) RETURNING id"""

    try:
        with psycopg.connect(**config) as conn:
            with conn.cursor() as cur:
                cur.execute(sql, (name, ))

                data = cur.fetchone()

                print(data)

                return {
                    "data": data[0]
                }

    except (Exception, psycopg.DatabaseError) as Error:
        return {
            "error": str(Error)
        }

def update(name: str, id: str, config):
    sql = """UPDATE kampus
             SET name = %s
             WHERE id= %s"""
    print(base64.b64decode(id).decode(), id)
    try:
        with psycopg.connect(**config) as conn:
            with conn.cursor() as cur:
                res = cur.execute(sql, (name, base64.b64decode(id).decode(), ))
                conn.commit()
                return {
                    "data": {
                        "id": id,
                        "name": name
                    }
                }
    except (Exception, psycopg.DatabaseError) as Error:
        return {
            "error": str(Error)
        }

def remove(id: str, mode: str, move_to_id: str, config):
    try:
        with psycopg.connect(**config) as conn:
            with conn.cursor() as cur:
                kampus_id = base64.b64decode(id).decode()
                
                if mode == "move" and move_to_id:
                    new_kampus_id = base64.b64decode(move_to_id).decode()
                    cur.execute("UPDATE unit SET kampus = %s WHERE kampus = %s", (new_kampus_id, kampus_id))
                
                elif mode == "cascade":
                    # Get all units for this kampus
                    cur.execute("SELECT id FROM unit WHERE kampus = %s", (kampus_id,))
                    units = cur.fetchall()
                    unit_ids = [u[0] for u in units]
                    
                    if unit_ids:
                        # Get all gedungs for these units
                        cur.execute("SELECT id FROM gedung WHERE unit = ANY(%s)", (unit_ids,))
                        gedungs = cur.fetchall()
                        gedung_ids = [g[0] for g in gedungs]
                        
                        if gedung_ids:
                            # Get all devices for these gedungs
                            cur.execute("SELECT id FROM device WHERE gedung = ANY(%s)", (gedung_ids,))
                            devices = cur.fetchall()
                            device_ids = [d[0] for d in devices]
                            
                            if device_ids:
                                # delete from all data tables
                                cur.execute("DELETE FROM data WHERE device_id = ANY(%s)", (device_ids,))
                                cur.execute("DELETE FROM data_hourly WHERE device_id = ANY(%s)", (device_ids,))
                                cur.execute("DELETE FROM data_daily WHERE device_id = ANY(%s)", (device_ids,))
                                cur.execute("DELETE FROM data_weekly WHERE device_id = ANY(%s)", (device_ids,))
                                cur.execute("DELETE FROM data_monthly WHERE device_id = ANY(%s)", (device_ids,))
                                cur.execute("DELETE FROM data_yearly WHERE device_id = ANY(%s)", (device_ids,))
                                cur.execute("DELETE FROM device_logs WHERE device = ANY(%s)", (device_ids,))
                                cur.execute("DELETE FROM device_status WHERE device = ANY(%s)", (device_ids,))
                                cur.execute("DELETE FROM estimasi_tagihan_listrik WHERE device_id = ANY(%s)", (device_ids,))
                                
                                # delete devices
                                cur.execute("DELETE FROM device WHERE gedung = ANY(%s)", (gedung_ids,))
                            
                            # delete gedungs
                            cur.execute("DELETE FROM gedung WHERE unit = ANY(%s)", (unit_ids,))
                        
                        # delete units
                        cur.execute("DELETE FROM unit WHERE kampus = %s", (kampus_id,))
                
                # Finally delete kampus
                cur.execute("DELETE FROM kampus WHERE id = %s", (kampus_id,))
                conn.commit()
                return {
                    "data": True
                }
    except (Exception, psycopg.DatabaseError) as Error:
        return {
            "error": str(Error)
        }