import psycopg

def get(sql, config, param = None):
    try:
        with psycopg.connect(**config) as conn:
            with conn.cursor() as cur:
                cur.execute(sql, param) 
                
                d = cur.fetchall()
                
                if (d == None): return {
                    "error": "no data"
                }
                return {
                    "data": d
                }

    except (Exception, psycopg.DatabaseError) as Error:
        print(Error, type(Error))
        return {
            "error": str(Error)
        }
        
def upsert(sql, param, config):
    try:
        with psycopg.connect(**config) as conn:
            with conn.cursor() as cur:
                cur.execute(sql, param) 
                
                d = cur.fetchone()

                conn.commit()
                
                if (d == None): return {
                    "error": "no data"
                }
                return {
                    "data": d
                }

    except (Exception, psycopg.DatabaseError) as Error:
        print(Error, type(Error))
        return {
            "error": str(Error)
        }
        
def delete(sql, param, config):
    try:
        with psycopg.connect(**config) as conn:
            with conn.cursor() as cur:
                cur.execute(sql, param) 

                conn.commit()
                
                return {
                    "data": True
                }

    except (Exception, psycopg.DatabaseError) as Error:
        print(Error, type(Error))
        return {
            "error": str(Error)
        }