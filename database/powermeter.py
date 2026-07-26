import psycopg
import base64

def new(pbrand: str, pseri: str, config):
    sql = """INSERT INTO power_meter(seri, brand)
             VALUES(%s, %s) RETURNING id;"""
    
    id = None

    try:
        with  psycopg.connect(**config) as conn:
            with  conn.cursor() as cur:
                cur.execute(sql, (pseri, pbrand, ))
                id = cur.fetchone()[0]
                conn.commit()
    except (Exception, psycopg.DatabaseError) as error:
        return {
            "error": error
        }  
    finally: 
        return { 
            "data": id
        }
    
def get_all(config):
    sql = """SELECT * FROM power_meter"""

    try:
        with  psycopg.connect(**config) as conn:
            with  conn.cursor() as cur:
                cur.execute(sql)
                results = cur.fetchall()
                result = []
                for res in results:
                    result.append({
                        "id": base64.b64encode(str(res[0]).encode()).decode(),
                        "seri": res[1],
                        "brand": res[2]
                    })
                return {
                    "data": result
                }
    except (Exception, psycopg.DatabaseError) as Error:
        return {
            "error": Error
        }
    
def get_one(id: str, config):
    sql = """SELECT * FROM power_meter
             WHERE id = %s LIMIT 1"""
    
    try:
        with psycopg.connect(**config) as conn:
            with conn.cursor() as cur:
                cur.execute(sql, (id, ))
                result = cur.fetchone()
                result = list(result)
                result[0] = base64.b64encode(str(result[0]).encode()).decode()
                print(result)
                return {
                    "data": result
                }
    except (Exception, psycopg.DatabaseError) as Error:
        return {
            "error": Error
        }
    
def update(id: str, pbrand: str, pseri: str, config):
    sql = """UPDATE power_meter
             SET seri = %s,
                 brand = %s
             WHERE id = %s"""
    
    try:
        with psycopg.connect(**config) as conn:
            with conn.cursor() as cur:
                cur.execute(sql, (pseri, pbrand, id ))
                conn.commit()
                return {
                    "data": True
                }
    except (Exception, psycopg.DatabaseError) as Error:
        return {
            "error": Error
        }