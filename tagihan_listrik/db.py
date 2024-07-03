from datetime import datetime
from database.internal import get as get_db, upsert as upsert_db

def get_tarif(config):
    sql = """SELECT id, harga, created_at, updated_at
             FROM tarif_listrik WHERE id = 1"""
    
    return get_db(sql=sql, config=config)
    
def create_tarif(harga, config):
    sql = """INSERT INTO tarif_listrik (harga, created_at)
             VALUES (%s, %s) RETURNING id"""
    
    return upsert_db(sql=sql, param=(harga, datetime.now(),), config=config)

def update_tarif(harga, config):
    sql = """UPDATE tarif_listrik
             SET harga = %s,
                 updated_at = %s
             WHERE id = 1
             RETURNING id"""
    
    return upsert_db(sql=sql, param=(harga, datetime.now(), ), config=config)