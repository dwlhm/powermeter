# SI-MOLIS — Industrial Energy Management System (EMS)

A production-ready, enterprise-grade Energy Management System built with React, simulating a commercial SCADA/IoT power monitoring platform (Siemens, Schneider EcoStruxure, ABB Ability, Ignition Perspective, Grafana Enterprise).

## Quick Start

```bash
npm install
npm run dev      # start dev server
npm run build    # production build
npm run typecheck
```

## Demo Accounts

| Username   | Password   | Role          |
|------------|------------|---------------|
| admin      | admin      | Administrator |
| engineer   | engineer   | Engineer      |
| operator   | operator   | Operator      |
| viewer     | viewer     | Viewer        |

## Architecture

The app follows **Clean Architecture** with a strict **Service Layer** so the UI never touches data generation directly. Swapping the dummy data source for a real backend (REST / MQTT / WebSocket / OPC UA / Modbus) requires changes only inside `src/services/api/*` — no component changes.

```
src/
├── components/        # Reusable UI primitives (Card, Badge, Gauge, MetricCard…)
│   └── ui/            # Generic UI kit (Spinner, Skeleton, Modal, ErrorState)
├── constants/         # App-wide constants (nav, roles, storage keys)
├── contexts/          # (reserved for future React Context providers)
├── data/              # Seed inventory (sites, measurement points)
├── features/          # (reserved for feature-based slices)
├── hooks/             # Custom hooks (useTheme, useLiveTelemetry)
├── layouts/           # AppLayout, Sidebar, Topbar
├── pages/             # Route-level views (lazy-loaded)
├── routes/            # AppRouter + ProtectedRoute
├── services/api/      # Service layer — repository pattern entry points
│   ├── client.ts          # axios instance (future REST)
│   ├── locationService.ts # sites
│   ├── measurementPointService.ts
│   ├── powerMeterService.ts  # telemetry (REST/MQTT/WS/OPC UA/Modbus ready)
│   ├── alarmService.ts
│   └── systemStatusService.ts
├── store/             # Zustand stores (auth, settings)
├── themes/            # (reserved for theme tokens)
├── types/             # Central type definitions
└── utils/             # randomPowerGenerator, format, async helpers
```

## Data Flow

```
Component → custom hook → service (services/api/*) → randomPowerGenerator (today)
                                       ↓                            ↑
                                  (tomorrow) axios / mqtt / ws / opcua / modbus
```

No component imports `randomPowerGenerator` directly — only services do.

## Future Integration Points

Each service documents the future call. Example:

```ts
// powerMeterService.getLatest
// REST:    apiClient.get(`/meters/${deviceId}/latest`)
// MQTT:    mqttClient.subscribe(`meter/${deviceId}/telemetry`)
// WS:      socket.on(`meter:${deviceId}`)
// OPC UA:  await opcuaSession.read(nodeId)
// Modbus:  await modbusClient.readHoldingRegisters(unit, addr, len)
```

### Example expected JSON (future REST response)

```json
{
  "deviceId": "PM-1-001",
  "timestamp": 1789012345000,
  "voltageAN": 230.4,
  "voltageBN": 229.8,
  "voltageCN": 230.1,
  "currentA": 38.2,
  "totalActivePower": 26.4,
  "frequency": 50.01,
  "averagePowerFactor": 0.94,
  "energyKwh": 634.2,
  "energyCost": 916419
}
```

## Features

- **Auth**: login, route protection, role-based access (4 roles), JWT-ready store
- **Dashboard**: 11 metric cards with trend + sparkline, system status, device summary
- **Sites Map**: Leaflet map with per-site popups and live aggregates
- **Measurement Points**: grid/table views, search, filter, sort, pagination, favorites
- **Power Meter Detail**: gauges, voltage/current/power-factor cards, interactive SVG power triangle, three-phase energy table, real-time trend charts (1m–24h)
- **Alarms**: severity/status filters, acknowledge & clear, alarm history
- **Event Log**: audit trail with search, filter, pagination
- **Energy Analytics**: line/area/bar/pie/gauge charts, daily–yearly ranges
- **Cost Calculator**: Indonesian Rupiah formatting, daily/monthly/yearly estimates
- **Reports**: search, date filter, pagination, export placeholders (PDF/Excel/CSV/Print)
- **Settings**: company/plant/site, refresh interval, theme, tariff, language, timezone

## Tech Stack

React 18 · React Router · Tailwind CSS · Framer Motion · Recharts · Zustand · React Leaflet · Axios · Lucide React · Vite · TypeScript-ready.
