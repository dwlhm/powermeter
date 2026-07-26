import psycopg
import base64

def get_all(config):
    sql = """SELECT unit.id, unit.name, kampus.id, kampus.name FROM unit 
             LEFT JOIN kampus ON unit.kampus = kampus.id"""

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
                        "name": d[1],
                        "kampus": {
                            "id": base64.b64encode(str(d[2]).encode()).decode(),
                            "name": d[3]
                        }
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
    sql = """SELECT unit.name, kampus.id, kampus.name FROM unit 
             LEFT JOIN kampus ON unit.kampus = kampus.id
             WHERE unit.id = %s"""

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
                        "name": data[0],
                        "kampus": {
                            "id": base64.b64encode(str(data[1]).encode()).decode(),
                            "name": data[2]
                        }
                    }
                }

    except (Exception, psycopg.DatabaseError) as Error:
        print(Error)
        return {
            "error": str(Error)
        }


def new(name: str, kampus_id: str, config):
    sql = """INSERT INTO unit (name, kampus)
             VALUES (%s, %s) RETURNING id"""

    try:
        with psycopg.connect(**config) as conn:
            with conn.cursor() as cur:
                cur.execute(sql, (
                    name, 
                    base64.b64decode(kampus_id).decode(), 
                ))

                data = cur.fetchone()

                print(data)

                return {
                    "data": data[0]
                }

    except (Exception, psycopg.DatabaseError) as Error:
        return {
            "error": str(Error)
        }

def update(name: str, kampus_id: str, id: str, config):
    sql = """UPDATE unit
             SET name = %s,
                 kampus = %s
             WHERE id= %s"""
    try:
        with psycopg.connect(**config) as conn:
            with conn.cursor() as cur:
                res = cur.execute(sql, (
                    name, 
                    base64.b64decode(kampus_id).decode(), 
                    base64.b64decode(id).decode(), 
                ))
                conn.commit()
                return {
                    "data": True
                }
    except (Exception, psycopg.DatabaseError) as Error:
        return {
            "error": str(Error)
        }

def remove(id: str, mode: str, move_to_id: str, config):
    try:
        with psycopg.connect(**config) as conn:
            with conn.cursor() as cur:
                unit_id = base64.b64decode(id).decode()

                if mode == "move" and move_to_id:
                    new_unit_id = base64.b64decode(move_to_id).decode()
                    cur.execute("UPDATE gedung SET unit = %s WHERE unit = %s", (new_unit_id, unit_id))
                
                elif mode == "cascade":
                    # Get all gedungs for this unit
                    cur.execute("SELECT id FROM gedung WHERE unit = %s", (unit_id,))
                    gedungs = cur.fetchall()
                    gedung_ids = [g[0] for g in gedungs]
                    
                    if gedung_ids:
                        # Get all devices for these gedungs
                        cur.execute("SELECT id FROM device WHERE gedung = ANY(%s)", (gedung_ids,))
                        devices = cur.fetchall()
                        device_ids = [d[0] for d in devices]
                        
                        if device_ids:
                            # Delete from all data tables
                            cur.execute("DELETE FROM data WHERE device_id = ANY(%s)", (device_ids,))
                            cur.execute("DELETE FROM data_hourly WHERE device_id = ANY(%s)", (device_ids,))
                            cur.execute("DELETE FROM data_daily WHERE device_id = ANY(%s)", (device_ids,))
                            cur.execute("DELETE FROM data_weekly WHERE device_id = ANY(%s)", (device_ids,))
                            cur.execute("DELETE FROM data_monthly WHERE device_id = ANY(%s)", (device_ids,))
                            cur.execute("DELETE FROM data_yearly WHERE device_id = ANY(%s)", (device_ids,))
                            cur.execute("DELETE FROM device_logs WHERE device = ANY(%s)", (device_ids,))
                            cur.execute("DELETE FROM device_status WHERE device = ANY(%s)", (device_ids,))
                            cur.execute("DELETE FROM estimasi_tagihan_listrik WHERE device_id = ANY(%s)", (device_ids,))
                            
                            # Delete devices
                            cur.execute("DELETE FROM device WHERE gedung = ANY(%s)", (gedung_ids,))
                        
                        # Delete gedungs
                        cur.execute("DELETE FROM gedung WHERE unit = %s", (unit_id,))

                # Finally delete the unit
                cur.execute("DELETE FROM unit WHERE id = %s", (unit_id,))
                conn.commit()
                return {
                    "data": True
                }
    except (Exception, psycopg.DatabaseError) as Error:
        return {
            "error": str(Error)
        }