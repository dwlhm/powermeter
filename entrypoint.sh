#!/bin/sh

echo "Applying database migrations/tables..."
python create_tables.py

# Dummy data is no longer injected here automatically.
# To run in dummy mode, set DUMMY_MODE=true on the modbus reader service
# (e.g. in docker-compose.yml or a .env file).  The reader will then generate
# synthetic powermeter data instead of contacting real devices.

echo "Starting FastAPI server..."
exec uvicorn main:app --host 0.0.0.0 --port 8000 --reload
