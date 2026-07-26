import psycopg
import base64

def get(config):
    sql = """SELECT power_meter_register.id, power_meter_register.register, power_meter.* 
             FROM power_meter_register
             LEFT JOIN power_meter ON power_meter_register.power_meter = power_meter.id"""

    try:
        with psycopg.connect(**config) as conn:
            with conn.cursor() as cur:
                cur.execute(sql)

                data = cur.fetchall()

                if (len(data) <= 0): return {
                    "error": "no data"
                }

                print("data", data)

                res = []
                for d in data:
                    res.append({
                        "id": base64.b64encode(str(d[0]).encode()).decode(),
                        "register": d[1],
                        "powermeter": {
                            "id": base64.b64encode(str(d[2]).encode()).decode(),
                            "seri": d[3],
                            "brand": d[4]
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
    sql = """SELECT power_meter_register.id, power_meter_register.register, power_meter.* 
             FROM power_meter_register
             LEFT JOIN power_meter ON power_meter_register.power_meter = power_meter.id
             WHERE power_meter.id = %s"""

    try:
        with psycopg.connect(**config) as conn:
            with conn.cursor() as cur:
                cur.execute(sql, (base64.b64decode(id).decode(), ))

                data = cur.fetchone()

                print(data)

                if (data == None): return {
                    "error": "no data"
                }
                return {
                    "data": {
                        "id": base64.b64encode(str(data[0]).encode()).decode(),
                        "register": data[1],
                        "powermeter": {
                            "id": base64.b64encode(str(data[2]).encode()).decode(),
                            "seri": data[3],
                            "brand": data[4]
                        }

                    }
                }

    except (Exception, psycopg.DatabaseError) as Error:
        print(Error)
        return {
            "error": str(Error)
        }


def new(powermeter_id: str, register: str, config):
    sql = """INSERT INTO power_meter_register (power_meter, register)
             VALUES (%s, %s)
             ON CONFLICT(power_meter)
             DO UPDATE SET 
                register = EXCLUDED.register
             RETURNING id"""

    try:
        with psycopg.connect(**config) as conn:
            with conn.cursor() as cur:
                cur.execute(sql, (base64.b64decode(powermeter_id).decode(), register, ))

                data = cur.fetchone()

                print(data)

                return {
                    "data": {
                        "id": base64.b64encode(str(data[0]).encode()).decode(),
                    
                }
                }

    except (Exception, psycopg.DatabaseError) as Error:
        return {
            "error": str(Error)
        }

def update(id: str, powermeter_id: str, register:str, config):
    sql = """UPDATE power_meter_register
             SET power_meter = %s,
                 register = %s
             WHERE id= %s"""
    try:
        with psycopg.connect(**config) as conn:
            with conn.cursor() as cur:
                res = cur.execute(sql, (base64.b64decode(powermeter_id).decode(), register, base64.b64decode(id).decode(), ))
                conn.commit()
                return {
                    "data": True
                }
    except (Exception, psycopg.DatabaseError) as Error:
        return {
            "error": str(Error)
        }

def remove(id: str, config):
    sql = """DELETE FROM power_meter_register
             WHERE id = %s"""
    try:
        with psycopg.connect(**config) as conn:
            with conn.cursor() as cur:
                cur.execute(sql, (base64.b64decode(id).decode(), ))
                return {
                    "data": True
                }
    except (Exception, psycopg.DatabaseError) as Error:
        return {
            "error": str(Error)
        }
