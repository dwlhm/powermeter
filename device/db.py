import psycopg2
import base64
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
                    device_status.status
                    FROM device 
             LEFT JOIN gedung ON device.gedung = gedung.id
             LEFT JOIN unit ON gedung.unit = unit.id
             LEFT JOIN kampus ON unit.kampus = kampus.id
             LEFT JOIN power_meter ON device.power_meter = power_meter.id
             LEFT JOIN device_status ON device_status.device = device.id"""

    try:
        with psycopg2.connect(**config) as conn:
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
                            "brand": d[12]
                        },
                        "status": "online" if d[13] == True else "offline"
                    })
                return {
                    "data": res
                }

    except (Exception, psycopg2.DatabaseError) as Error:
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
        with psycopg2.connect(**config) as conn:
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
                            "register": literal_eval(d[13])
                        },
                        "status": "online" if d[14] == True else "offline"
                    }
                }

    except (Exception, psycopg2.DatabaseError) as Error:
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
        with psycopg2.connect(**config) as conn:
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

    except (Exception, psycopg2.DatabaseError) as Error:
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
        with psycopg2.connect(**config) as conn:
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
    except (Exception, psycopg2.DatabaseError) as Error:
        return {
            "error": str(Error)
        }

def remove(id: str, config):
    sql = """DELETE FROM device
             WHERE id = %s"""
    try:
        with psycopg2.connect(**config) as conn:
            with conn.cursor() as cur:
                cur.execute(sql, (base64.b64decode(id).decode(), ))
                return {
                    "data": True
                }
    except (Exception, psycopg2.DatabaseError) as Error:
        return {
            "error": str(Error)
        }
    
def get_device_status(device_id: str, config):
    sql = """SELECT status FROM device_status
             WHERE device = %s"""
    try:
        with psycopg2.connect(**config) as conn:
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

    except (Exception, psycopg2.DatabaseError) as Error:
        return {
            "error": str(Error)
        }
    
def insert_device_logs(device_id: str, type: str, message: str, config):
    sql = """INSERT INTO device_logs (device, type, message, created_at)
             VALUES (%s, %s, %s, %s)"""
    
    try:
        with psycopg2.connect(**config) as conn:
            with conn.cursor() as cur:
                cur.execute(sql, (base64.b64decode(device_id).decode(), type, str(message), datetime.now(), ))
                conn.commit()

                return {
                    "data": True
                }
    except (Exception, psycopg2.DatabaseError) as Error:
        return {
            "error": str(Error)
        }
    
def get_device_logs(device_id: str, config):
    sql = """SELECT type, message, created_at FROM device_logs
             WHERE device = %s AND
             DATE_PART('month', created_at) = %s
             ORDER BY id DESC"""
    try:
        with psycopg2.connect(**config) as conn:
            with conn.cursor() as cur:
                cur.execute(sql, (str(base64.b64decode(device_id).decode()), datetime.now().month, ))

                d = cur.fetchall()

                if (d == None): 
                    return {
                        "error": "no data"
                    }
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

    except (Exception, psycopg2.DatabaseError) as Error:
        return {
            "error": str(Error)
        }

def set_device_status(device_id: str, status: bool, config):
    sql = """INSERT INTO device_status (device, status, update_at)
             VALUES (%s, %s, %s)
             ON CONFLICT(device)
             DO UPDATE SET
                status = EXCLUDED.status"""
    
    try:
        with psycopg2.connect(**config) as conn:
            with conn.cursor() as cur:
                cur.execute(sql, (base64.b64decode(device_id).decode(), status, datetime.now(), ))
                conn.commit()

                return {
                    "data": True
                }
    except (Exception, psycopg2.DatabaseError) as Error:
        return {
            "error": str(Error)
        }
    
def get_latest_data(id: str, config):
    sql = """SELECT DISTINCT ON (id) 
        phase_voltage_a,
        phase_voltage_b,
        phase_voltage_c,
        wire_voltage_ab,
        wire_voltage_bc,
        wire_voltage_ca,
        phase_current_a,
        phase_current_b,
        phase_current_c,
        active_power_a,
        active_power_b,
        active_power_c,
        reactive_power_a,
        reactive_power_b,
        reactive_power_c,
        apparent_power_a,
        apparent_power_b,
        apparent_power_c,
        power_factor_a,
        power_factor_b,
        power_factor_c,
        frequency,
        active_power,
        reactive_power,
        positive_active_power,
        negative_active_power,
        positive_reactive_power,
        negative_reactive_power,
        current_active_power_demand,
        maximum_active_power_demand,
        current_reactive_power_demand,
        maximum_reactive_power_demand,
        a_phase_voltage_total_harmonic_content,
        b_phase_voltage_total_harmonic_content,
        c_phase_voltage_total_harmonic_content,
        a_phase_current_total_harmonic_content,
        b_phase_current_total_harmonic_content,
        c_phase_current_total_harmonic_content,
        o_phase_current,
        phase_voltage_maximum,
        Wires_voltage_maximum,
        current_maximum,
        voltage_imbalance,
        current_imbalance,
        a_b_phase_voltage_angle,
        b_C_phase_voltage_angle,
        c_a_phase_voltage_angle,
        first_quadrant_reactive_energy,
        second_quadrant_reactive_energy,
        third_quadrant_reactive_energy,
        fourth_quadrant_reactive_power,
        timestamp
             FROM data
             WHERE device_id = %s
             ORDER BY id DESC
             """
    try:
        with psycopg2.connect(**config) as conn:
            with conn.cursor() as cur:
                cur.execute(sql, (base64.b64decode(id).decode(), ))

                d = cur.fetchone()

                if (d == None): return {
                    "error": "no data"
                }
                return {
                    "data": {
                        "data": {
                            "phase_voltage_a": d[0],
                            "phase_voltage_b": d[1],
                            "phase_voltage_c": d[2],
                            "wire_voltage_ab": d[3],
                            "wire_voltage_bc": d[4],
                            "wire_voltage_ca": d[5],
                            "phase_current_a": d[6],
                            "phase_current_b": d[7],
                            "phase_current_c": d[8],
                            "active_power_a": d[9],
                            "active_power_b": d[10],
                            "active_power_c": d[11],
                            "reactive_power_a": d[12],
                            "reactive_power_b": d[13],
                            "reactive_power_c": d[14],
                            "apparent_power_a": d[15],
                            "apparent_power_b": d[16],
                            "apparent_power_c": d[17],
                            "power_factor_a": d[18],
                            "power_factor_b": d[19],
                            "power_factor_c": d[20],
                            "frequency": d[21],
                            "active_power": d[22],
                            "reactive_power": d[23],
                            "positive_active_power": d[24],
                            "negative_active_power": d[25],
                            "positive_reactive_power": d[26],
                            "negative_reactive_power": d[27],
                            "current_active_power_demand": d[28],
                            "maximum_active_power_demand": d[29],
                            "current_reactive_power_demand": d[30],
                            "maximum_reactive_power_demand": d[31],
                            "a_phase_voltage_total_harmonic_content": d[32],
                            "b_phase_voltage_total_harmonic_content": d[33],
                            "c_phase_voltage_total_harmonic_content": d[34],
                            "a_phase_current_total_harmonic_content": d[35],
                            "b_phase_current_total_harmonic_content": d[36],
                            "c_phase_current_total_harmonic_content": d[37],
                            "o_phase_current": d[38],
                            "phase_voltage_maximum": d[39],
                            "Wires_voltage_maximum": d[40],
                            "current_maximum": d[41],
                            "voltage_imbalance": d[42],
                            "current_imbalance": d[43],
                            "a_b_phase_voltage_angle": d[44],
                            "b_C_phase_voltage_angle": d[45],
                            "c_a_phase_voltage_angle": d[46],
                            "first_quadrant_reactive_energy": d[47],
                            "second_quadrant_reactive_energy": d[48],
                            "third_quadrant_reactive_energy": d[49],
                            "fourth_quadrant_reactive_power": d[50],
                        },
                        "timestamp": d[-1]
                    }
                }


    except (Exception, psycopg2.DatabaseError) as Error:
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
        phase_voltage_a,
        phase_voltage_b,
        phase_voltage_c,
        wire_voltage_ab,
        wire_voltage_bc,
        wire_voltage_ca,
        phase_current_a,
        phase_current_b,
        phase_current_c,
        active_power_a,
        active_power_b,
        active_power_c,
        reactive_power_a,
        reactive_power_b,
        reactive_power_c,
        apparent_power_a,
        apparent_power_b,
        apparent_power_c,
        power_factor_a,
        power_factor_b,
        power_factor_c,
        frequency,
        active_power,
        reactive_power,
        positive_active_power,
        negative_active_power,
        positive_reactive_power,
        negative_reactive_power,
        current_active_power_demand,
        maximum_active_power_demand,
        current_reactive_power_demand,
        maximum_reactive_power_demand,
        a_phase_voltage_total_harmonic_content,
        b_phase_voltage_total_harmonic_content,
        c_phase_voltage_total_harmonic_content,
        a_phase_current_total_harmonic_content,
        b_phase_current_total_harmonic_content,
        c_phase_current_total_harmonic_content,
        o_phase_current,
        phase_voltage_maximum,
        Wires_voltage_maximum,
        current_maximum,
        voltage_imbalance,
        current_imbalance,
        a_b_phase_voltage_angle,
        b_C_phase_voltage_angle,
        c_a_phase_voltage_angle,
        first_quadrant_reactive_energy,
        second_quadrant_reactive_energy,
        third_quadrant_reactive_energy,
        fourth_quadrant_reactive_power,
        timestamp
    ) VALUES (
        %s, %s, %s, %s, %s, %s, %s, %s, %s, %s,
        %s, %s, %s, %s, %s, %s, %s, %s, %s, %s,
        %s, %s, %s, %s, %s, %s, %s, %s, %s, %s,
        %s, %s, %s, %s, %s, %s, %s, %s, %s, %s,
        %s, %s, %s, %s, %s, %s, %s, %s, %s, %s,
        %s, %s, %s
    ) RETURNING id
    """
    try:
        with psycopg2.connect(**config) as conn:
            with conn.cursor() as cur:
                cur.execute(sql, (
                    base64.b64decode(id).decode(),
                    data.get('phase_voltage_a'),
                    data.get('phase_voltage_b'),
                    data.get('phase_voltage_c'),
                    data.get('wire_voltage_ab'),
                    data.get('wire_voltage_bc'),
                    data.get('wire_voltage_ca'),
                    data.get('phase_current_a'),
                    data.get('phase_current_b'),
                    data.get('phase_current_c'),
                    data.get('active_power_a'),
                    data.get('active_power_b'),
                    data.get('active_power_c'),
                    data.get('reactive_power_a'),
                    data.get('reactive_power_b'),
                    data.get('reactive_power_c'),
                    data.get('apparent_power_a'),
                    data.get('apparent_power_b'),
                    data.get('apparent_power_c'),
                    data.get('power_factor_a'),
                    data.get('power_factor_b'),
                    data.get('power_factor_c'),
                    data.get('frequency'),
                    data.get('active_power'),
                    data.get('reactive_power'),
                    data.get('positive_active_power'),
                    data.get('negative_active_power'),
                    data.get('positive_reactive_power'),
                    data.get('negative_reactive_power'),
                    data.get('current_active_power_demand'),
                    data.get('maximum_active_power_demand'),
                    data.get('current_reactive_power_demand'),
                    data.get('maximum_reactive_power_demand'),
                    data.get('a_phase_voltage_total_harmonic_content'),
                    data.get('b_phase_voltage_total_harmonic_content'),
                    data.get('c_phase_voltage_total_harmonic_content'),
                    data.get('a_phase_current_total_harmonic_content'),
                    data.get('b_phase_current_total_harmonic_content'),
                    data.get('c_phase_current_total_harmonic_content'),
                    data.get('o_phase_current'),
                    data.get('phase_voltage_maximum'),
                    data.get('wires_voltage_maximum'),
                    data.get('current_maximum'),
                    data.get('voltage_imbalance'),
                    data.get('current_imbalance'),
                    data.get('a_b_phase_voltage_angle'),
                    data.get('b_c_phase_voltage_angle'),
                    data.get('c_a_phase_voltage_angle'),
                    data.get('first_quadrant_reactive_energy'),
                    data.get('second_quadrant_reactive_energy'),
                    data.get('third_quadrant_reactive_energy'),
                    data.get('fourth_quadrant_reactive_power'),
                    timestamp,
                ))
                
                conn.commit()

                return {
                    "data": True
                }

    except (Exception, psycopg2.DatabaseError) as Error:
        print("Error Tipe: ", type(Error), data[str(Error)], Error)
        return {
            "error": {
                "type": "dbError",
                "message": str(Error)}
        }