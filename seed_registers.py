import psycopg
import json
from configuration.config import load_config
from device_registers.registers_repo import repo

def convert_param_to_name(param: str):
    words = param.split('_')
    return " ".join([word.capitalize() for word in words])

def main():
    config = load_config()
    config['host'] = 'localhost'
    print("Migrating Database Schema...")
    try:
        with psycopg.connect(**config) as conn:
            with conn.cursor() as cur:
                # Add new columns to power_meter table
                cur.execute("""
                    ALTER TABLE power_meter 
                    ADD COLUMN IF NOT EXISTS slave_id INTEGER DEFAULT 1,
                    ADD COLUMN IF NOT EXISTS count INTEGER DEFAULT 2,
                    ADD COLUMN IF NOT EXISTS timeout INTEGER DEFAULT 4;
                """)
                conn.commit()
                print("Columns added successfully.")
                
                # Ensure AW9L power meter exists
                cur.execute("SELECT id FROM power_meter WHERE seri = 'AW9L'")
                pm_id = cur.fetchone()
                
                if not pm_id:
                    print("Power Meter AW9L not found. Creating...")
                    cur.execute("INSERT INTO power_meter (seri, brand, slave_id, count, timeout) VALUES ('AW9L', 'Default Brand', 1, 2, 4) RETURNING id")
                    pm_id = cur.fetchone()
                    conn.commit()
                
                pm_id = pm_id[0]
                print(f"AW9L Power Meter ID: {pm_id}")
                
                # Get registers for AW9L
                aw9l_regs = repo.get("AW9L", [])
                
                # Format them for UI: [alamat, pengkali, besaran, nama, param]
                ui_regs = []
                for reg in aw9l_regs:
                    # reg is [alamat, pengkali, besaran, param]
                    alamat = reg[0]
                    pengkali = reg[1]
                    besaran = reg[2]
                    param = reg[3]
                    nama = convert_param_to_name(param)
                    ui_regs.append([alamat, pengkali, besaran, nama, param])
                
                # Insert or Update into power_meter_register
                cur.execute("""
                    INSERT INTO power_meter_register (power_meter, register)
                    VALUES (%s, %s)
                    ON CONFLICT(power_meter)
                    DO UPDATE SET register = EXCLUDED.register
                """, (pm_id, json.dumps(ui_regs)))
                conn.commit()
                print("AW9L registers migrated successfully.")

    except Exception as e:
        print(f"Error during migration: {e}")

if __name__ == "__main__":
    main()
