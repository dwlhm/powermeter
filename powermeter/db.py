import psycopg
import base64

def get_all(config):
    sql = """SELECT * FROM power_meter"""

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
                        "seri": d[1],
                        "brand": d[2],
                        "slave_id": d[3],
                        "count": d[4],
                        "timeout": d[5]
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
    sql = """SELECT seri, brand, slave_id, count, timeout FROM power_meter
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
                        "seri": data[0],
                        "brand": data[1],
                        "slave_id": data[2],
                        "count": data[3],
                        "timeout": data[4]
                    }
                }

    except (Exception, psycopg.DatabaseError) as Error:
        print(Error)
        return {
            "error": str(Error)
        }


def new(seri: str, brand: str, slave_id: int, count: int, timeout: int, config):
    sql = """INSERT INTO power_meter (seri, brand, slave_id, count, timeout)
             VALUES (%s, %s, %s, %s, %s) RETURNING id"""

    try:
        with psycopg.connect(**config) as conn:
            with conn.cursor() as cur:
                cur.execute(sql, (seri, brand, slave_id, count, timeout))

                data = cur.fetchone()

                print(data)

                return {
                    "data": data[0]
                }

    except (Exception, psycopg.DatabaseError) as Error:
        return {
            "error": str(Error)
        }

def update(seri: str, brand: str, slave_id: int, count: int, timeout: int, id: str, config):
    sql = """UPDATE power_meter
             SET seri = %s,
                 brand = %s,
                 slave_id = %s,
                 count = %s,
                 timeout = %s
             WHERE id= %s"""
    print(base64.b64decode(id).decode(), id)
    try:
        with psycopg.connect(**config) as conn:
            with conn.cursor() as cur:
                res = cur.execute(sql, (seri, brand, slave_id, count, timeout, base64.b64decode(id).decode(), ))
                conn.commit()
                return {
                    "data": True
                }
    except (Exception, psycopg.DatabaseError) as Error:
        return {
            "error": str(Error)
        }

def remove(id: str, config):
    sql = """DELETE FROM power_meter
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