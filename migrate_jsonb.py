import psycopg
from configuration.config import load_config
import create_tables

def migrate():
    config = load_config()
    print("Connecting to database...")
    try:
        with psycopg.connect(**config) as conn:
            with conn.cursor() as cur:
                print("Dropping old static data tables...")
                cur.execute("DROP TABLE IF EXISTS data_yearly CASCADE")
                cur.execute("DROP TABLE IF EXISTS data_monthly CASCADE")
                cur.execute("DROP TABLE IF EXISTS data_weekly CASCADE")
                cur.execute("DROP TABLE IF EXISTS data_daily CASCADE")
                cur.execute("DROP TABLE IF EXISTS data_hourly CASCADE")
                cur.execute("DROP TABLE IF EXISTS data CASCADE")
                print("Successfully dropped old data tables.")
            conn.commit()
        
        print("Recreating tables with new JSONB schema...")
        create_tables.create_tables()
        print("Migration successful! Setup aman dijalankan.")
    except Exception as e:
        print("Error during migration:", e)

if __name__ == "__main__":
    migrate()
