#!/bin/bash
# One-command dummy environment: DB, migrations, API, web, and dummy powermeter reader.
echo "Starting full dummy environment via Docker Compose..."
docker compose up -d --build

echo ""
echo "Dummy environment is up:"
echo "  API:    http://localhost:8000"
echo "  Web:    http://localhost:5173"
echo "  Reader: generating dummy powermeter data (PM Online + PM Offline)"
echo ""
echo "View reader logs:"
echo "  docker compose logs -f reader"
