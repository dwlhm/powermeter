import psycopg
import base64

def get_all(config):
    sql = """SELECT gedung.id, gedung.name, unit.id, unit.name, kampus.id, kampus.name FROM gedung 
             LEFT JOIN unit ON gedung.unit = unit.id
             LEFT JOIN kampus ON unit.kampus = kampus.id"""

    try:
        with psycopg.connect(**config) as conn:
            with conn.cursor() as cur:
                cur.execute(sql)

                data = cur.fetchall()

                if (len(data) <= 0): return {
                    "error": "no data"
                }

                print(data)

                res = []
                for d in data:
                    res.append({
                        "id": base64.b64encode(str(d[0]).encode()).decode(),
                        "name": d[1],
                        "unit": {
                            "id": base64.b64encode(str(d[2]).encode()).decode(),
                            "name": d[3],
                            "kampus": {
                                "id": base64.b64encode(str(d[4]).encode()).decode(),
                                "name": d[5]
                            }
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
    sql = """SELECT gedung.name, unit.id, unit.name, kampus.id, kampus.name FROM gedung 
             LEFT JOIN unit ON gedung.unit = unit.id
             LEFT JOIN kampus ON unit.kampus = kampus.id
             WHERE gedung.id = %s"""

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
                        "unit": {
                            "id": base64.b64encode(str(data[1]).encode()).decode(),
                            "name": data[2],
                            "kampus": {
                                "id": base64.b64encode(str(data[3]).encode()).decode(),
                                "name": data[4],
                            }
                        }
                        
                    }
                }

    except (Exception, psycopg.DatabaseError) as Error:
        print(Error)
        return {
            "error": str(Error)
        }


def new(name: str, kampus_id: str, config):
    sql = """INSERT INTO gedung (name, unit)
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

def update(name: str, unit_id: str, id: str, config):
    sql = """UPDATE gedung
             SET name = %s,
                 unit = %s
             WHERE id= %s"""
    try:
        with psycopg.connect(**config) as conn:
            with conn.cursor() as cur:
                res = cur.execute(sql, (
                    name, 
                    base64.b64decode(unit_id).decode(), 
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

def remove(id: str, config):
    sql = """DELETE FROM gedung
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