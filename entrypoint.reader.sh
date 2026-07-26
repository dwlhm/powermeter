#!/bin/sh

DB_HOST="${DB_HOST:-db}"
DB_PORT="${DB_PORT:-5432}"

# Wait for PostgreSQL to be ready using Python (nc may not exist in slim image)
echo "Waiting for PostgreSQL at ${DB_HOST}:${DB_PORT}..."
python - <<PY
import socket, time, os
host = os.getenv("DB_HOST", "db")
port = int(os.getenv("DB_PORT", "5432"))
while True:
    try:
        with socket.create_connection((host, port), timeout=1):
            break
    except OSError:
        time.sleep(1)
PY
echo "PostgreSQL is ready"

# Ensure schema and seed default dummy devices exist
echo "Applying database tables and dummy devices..."
DUMMY_MODE=true python create_tables.py
DUMMY_MODE=true python dummy_seed.py

# Start the modbus reader in dummy mode
echo "Starting powermeter reader in DUMMY mode..."
DUMMY_MODE=true exec python read_modbus.py
