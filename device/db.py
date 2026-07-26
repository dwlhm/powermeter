import psycopg
import base64
import json
from datetime import datetime
from ast import literal_eval
from typing import Optional
from .internal import DataPerangkat

def get_all(config):
    sql = """SELECT device.id, device.name, device.ip_addr, device.port,
                    gedung.id, gedung.name, 
                    unit.id, unit.name, 
                    kampus.id, kampus.name,
                    power_meter.id, power_meter.seri, power_meter.brand,
                    power_meter.slave_id, power_meter.count, power_meter.timeout,
                    power_meter_register.register,
                    device_status.status
                    FROM device 
             LEFT JOIN gedung ON device.gedung = gedung.id
             LEFT JOIN unit ON gedung.unit = unit.id
             LEFT JOIN kampus ON unit.kampus = kampus.id
             LEFT JOIN power_meter ON device.power_meter = power_meter.id
             LEFT JOIN power_meter_register ON power_meter_register.power_meter = power_meter.id
             LEFT JOIN device_status ON device_status.device = device.id"""

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
                        "ip_addr": d[2],
                        "port": d[3],
                        "gedung": {
                            "id": base64.b64encode(str(d[4]).encode()).decode(),
                            "name": d[5],
                            "unit": {
                                "id": base64.b64encode(str(d[6]).encode()).decode(),
                                "name": d[7],
                                "kampus": {
                                    "id": base64.b64encode(str(d[8]).encode()).decode(),
                                    "name": d[9]
                                }
                            }
                        },
                        "powermeter": {
                            "id": base64.b64encode(str(d[10]).encode()).decode(),
                            "seri": d[11],
                            "brand": d[12],
                            "slave_id": d[13],
                            "count": d[14],
                            "timeout": d[15],
                            "register": literal_eval(d[16]) if d[16] else []
                        },
                        "status": "online" if d[17] == True else "offline"
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
    sql = """SELECT device.id, device.name, device.ip_addr, device.port,
                    gedung.id, gedung.name, 
                    unit.id, unit.name, 
                    kampus.id, kampus.name,
                    power_meter.id, power_meter.seri, power_meter.brand,
                    power_meter.slave_id, power_meter.count, power_meter.timeout,
                    power_meter_register.register, device_status.status
                    FROM device 
             LEFT JOIN gedung ON device.gedung = gedung.id
             LEFT JOIN unit ON gedung.unit = unit.id
             LEFT JOIN kampus ON unit.kampus = kampus.id
             LEFT JOIN power_meter ON device.power_meter = power_meter.id
             LEFT JOIN power_meter_register ON power_meter_register.power_meter = power_meter.id    
             LEFT JOIN device_status ON device_status.device = device.id
             WHERE device.id = %s"""
    
    try:
        with psycopg.connect(**config) as conn:
            with conn.cursor() as cur:
                cur.execute(sql, (str(base64.b64decode(id).decode()), ))

                d = cur.fetchone()

                if (d == None): 
                    return {
                        "error": "no data"
                    }
                return {
                    "data": {
                        "id": base64.b64encode(str(d[0]).encode()).decode(),
                        "name": d[1],
                        "ip_addr": d[2],
                        "port": d[3],
                        "gedung": {
                            "id": base64.b64encode(str(d[4]).encode()).decode(),
                            "name": d[5],
                            "unit": {
                                "id": base64.b64encode(str(d[6]).encode()).decode(),
                                "name": d[7],
                                "kampus": {
                                    "id": base64.b64encode(str(d[8]).encode()).decode(),
                                    "name": d[9]
                                }
                            }
                        },
                        "powermeter": {
                            "id": base64.b64encode(str(d[10]).encode()).decode(),
                            "seri": d[11],
                            "brand": d[12],
                            "slave_id": d[13],
                            "count": d[14],
                            "timeout": d[15],
                            "register": literal_eval(d[16]) if d[16] else []
                        },
                        "status": "online" if d[17] == True else "offline"
                    }
                }

    except (Exception, psycopg.DatabaseError) as Error:
        print(Error)
        return {
            "error": str(Error)
        }


def new(
        name: str, 
        gedung_id: str,
        ip_addr: str,
        port: int,
        power_meter_id: str, 
        config):
    sql = """INSERT INTO device (name, gedung, ip_addr, port, power_meter)
             VALUES (%s, %s, %s, %s, %s) RETURNING id"""
    try:
        with psycopg.connect(**config) as conn:
            with conn.cursor() as cur:
                cur.execute(sql, (
                    name, 
                    base64.b64decode(gedung_id).decode(), 
                    ip_addr,
                    port,
                    base64.b64decode(power_meter_id).decode()
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

def update(
        name: str, 
        gedung_id: str,
        ip_addr: str,
        port: int,
        power_meter_id: str, 
        id: str,
        config):
    sql = """UPDATE device
             SET name = %s,
                 gedung = %s, 
                 ip_addr = %s, 
                 port = %s, 
                 power_meter = %s
             WHERE id= %s"""
    try:
        with psycopg.connect(**config) as conn:
            with conn.cursor() as cur:
                res = cur.execute(sql, (
                    name, 
                    base64.b64decode(gedung_id).decode(), 
                    ip_addr,
                    port,
                    base64.b64decode(power_meter_id).decode(), 
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
    sql = """DELETE FROM device
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
    
def get_device_status(device_id: str, config):
    sql = """SELECT status FROM device_status
             WHERE device = %s"""
    try:
        with psycopg.connect(**config) as conn:
            with conn.cursor() as cur:
                cur.execute(sql, (str(base64.b64decode(device_id).decode()), ))

                d = cur.fetchone()

                if (d == None): 
                    return {
                        "error": "no data"
                    }
                return {
                    "data": {
                        "status": d[0]
                    }
                }

    except (Exception, psycopg.DatabaseError) as Error:
        return {
            "error": str(Error)
        }
    
def insert_device_logs(device_id: str, type: str, message: str, config):
    sql = """INSERT INTO device_logs (device, type, message, created_at)
             VALUES (%s, %s, %s, %s)"""
    
    try:
        with psycopg.connect(**config) as conn:
            with conn.cursor() as cur:
                cur.execute(sql, (base64.b64decode(device_id).decode(), type, str(message), datetime.now(), ))
                conn.commit()

                return {
                    "data": True
                }
    except (Exception, psycopg.DatabaseError) as Error:
        return {
            "error": str(Error)
        }
    
def get_device_logs(
    device_id: str,
    config,
    log_type: str | None = None,
    from_date: datetime | None = None,
    to_date: datetime | None = None,
    limit: int | None = None,
):
    filters = ["device = %s"]
    params: list = [str(base64.b64decode(device_id).decode())]

    if log_type:
        filters.append("type = %s")
        params.append(log_type)

    if from_date:
        filters.append("created_at >= %s")
        params.append(from_date)

    if to_date:
        filters.append("created_at <= %s")
        params.append(to_date)

    sql = f"""SELECT type, message, created_at FROM device_logs
             WHERE {' AND '.join(filters)}
             ORDER BY created_at DESC"""

    if limit and isinstance(limit, int) and limit > 0:
        sql += " LIMIT %s"
        params.append(limit)

    try:
        with psycopg.connect(**config) as conn:
            with conn.cursor() as cur:
                cur.execute(sql, tuple(params))

                d = cur.fetchall()

                res = []
                for data in d:
                    res.append({
                        "type": data[0],
                        "message": data[1],
                        "created_at": data[2]
                    })

                return {
                    "data": res
                }

    except (Exception, psycopg.DatabaseError) as Error:
        return {
            "error": str(Error)
        }

def set_device_status(device_id: str, status: bool, config):
    sql = """INSERT INTO device_status (device, status, update_at)
             VALUES (%s, %s, NOW())
             ON CONFLICT(device)
             DO UPDATE SET
                status = EXCLUDED.status,
                update_at = NOW()"""
    
    try:
        with psycopg.connect(**config) as conn:
            with conn.cursor() as cur:
                cur.execute(sql, (base64.b64decode(device_id).decode(), status, ))
                conn.commit()

                return {
                    "data": True
                }
    except (Exception, psycopg.DatabaseError) as Error:
        return {
            "error": str(Error)
        }
    
def get_latest_data(id: str, config):
    sql = """SELECT DISTINCT ON (id) metrics, timestamp FROM data
             WHERE device_id = %s
             ORDER BY id DESC
             """
    try:
        with psycopg.connect(**config) as conn:
            with conn.cursor() as cur:
                cur.execute(sql, (base64.b64decode(id).decode(), ))

                d = cur.fetchone()

                if (d == None): return {
                    "error": "no data"
                }
                return {
                    "data": {
                        "data": d[0] if isinstance(d[0], dict) else json.loads(d[0]),
                        "timestamp": d[1]
                    }
                }


    except (Exception, psycopg.DatabaseError) as Error:
        return {
            "error": str(Error)
        }

def insert_latest_data(
    id: str,
    config,
    timestamp,
    data
    ):
    sql = """
    INSERT INTO data (
        device_id,
        metrics,
        timestamp
    ) VALUES (
        %s, %s, %s
    ) RETURNING id
    """
    try:
        with psycopg.connect(**config) as conn:
            with conn.cursor() as cur:
                cur.execute(sql, (
                    base64.b64decode(id).decode(),
                    json.dumps(data),
                    timestamp,
                ))
                
                conn.commit()

                return {
                    "data": True
                }

    except (Exception, psycopg.DatabaseError) as Error:
        print("Error Tipe: ", type(Error), data[str(Error)], Error)
        return {
            "error": {
                "type": "dbError",
                "message": str(Error)}
        }