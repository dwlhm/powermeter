# MPM — Monitoring Power Meter

Sistem monitoring power meter berbasis Modbus dengan dummy mode untuk development/demo.

## Quick Start (Docker Compose)

```bash
./setup_dummy.sh
```

Atau manual:

```bash
docker compose up -d --build
```

Setelah semua container berjalan, akses:

| Service            | URL                          |
|--------------------|------------------------------|
| Frontend (dev)     | http://localhost:5173        |
| Frontend (SSL)     | https://localhost              |
| Frontend (HTTP)    | http://localhost (redirect ke HTTPS) |
| DB                 | localhost:5432                 |

> **API tidak di-expose ke host.** Semua request API diarahkan melalui Nginx (port 80/443) atau Vite dev proxy (port 5173) ke service `api` secara internal dengan prefix `/api`.
> Contoh: `https://localhost/api/users/me` → `api:8000/users/me`.
>
> `VITE_BACKEND_URL` di-set otomatis oleh docker compose menjadi `/api`.

### SSL Frontend (Port 80/443)

Service `web-ssl` menjalankan frontend hasil build melalui Nginx dengan terminasi SSL pada port `80` dan `443`. Sertifikat self-signed sudah di-generate di `web/ssl/`; ganti dengan sertifikat dari CA terpercaya untuk production.

```bash
# Generate ulang sertifikat self-signed (development only)
./web/ssl/generate-certs.sh

# Jalankan stack lengkap termasuk frontend SSL
docker compose up -d --build
```

## Default Credentials

### Akun Admin

| Field      | Value              |
|------------|--------------------|
| Username   | `admin`            |
| Password   | `admin`            |
| Email      | `admin@admin.admin`|
| Role       | Admin (full akses) |

### Database (PostgreSQL)

| Field    | Value          |
|----------|----------------|
| Host     | `localhost`     |
| Port     | `5432`          |
| Database | `mpm_dummy`     |
| User     | `mpm_user`      |
| Password | `mpm_password`  |

## Apa yang Diseed

Saat pertama kali `docker compose up` (service `migrations`), sistem otomatis membuat:

### Data Master
- **Kampus**: `Kampus Demo`
- **Unit**: `Unit Demo`
- **Gedung**: `Gedung Demo`
- **Power Meter**: merk `Demo Brand`, seri `AW9L`
- **Device 1** — `PM Online` di `127.0.0.1:502` → akan muncul sebagai online
- **Device 2** — `PM Offline` di `192.0.2.1:502` → akan muncul sebagai offline (IP unreachable)

### Role & Permission
- **Admin** — semua permission
- **Viewer** — hanya bisa melihat data
- **Operator** — mengelola perangkat + melihat data

### Lainnya
- **Tarif listrik**: Rp 2.000
- **Register power meter**: sesuai seri AWL9

## Cara Kerja Dummy Mode

`docker-compose.yml` mengatur environment variable `DUMMY_MODE=true` di service `api` dan `reader`.

Dalam mode ini:
- **Reader** (`read_modbus.py`) tidak benar-benar membaca modbus. Data listrik disimulasikan secara sintetis setiap siklus polling.
- **API** tetap berjalan normal, melayani query data dari database.
- Data dari `PM Online` akan terus terakumulasi dan bisa dilihat di grafik frontend.
- Data dari `PM Offline` akan gagal dan tercatat sebagai offline.

Sesuaikan kecepatan polling lewat `.env` atau langsung di `docker-compose.yml`:

```bash
MODBUS_READ_INTERVAL=60   # detik antar siklus
MODBUS_MAX_WORKERS=60     # polling paralel maksimal
```

## Manual (Tanpa Docker)

```bash
# 1. Pastikan PostgreSQL running, lalu buat database:
#    createdb -U postgres mpm_dummy

# 2. Copy konfigurasi database:
cp configuration/example.database.ini configuration/database.ini
#    Edit host=localhost, user/password sesuai PostgreSQL lokal.

# 3. Buat tabel dan seed data:
python create_tables.py
python dummy_seed.py

# 4. Jalankan API:
DUMMY_MODE=true uvicorn main:app --reload --host 0.0.0.0 --port 8000

# 5. Jalankan reader (terminal terpisah):
DUMMY_MODE=true python read_modbus.py

# 6. Jalankan frontend:
cd web
npm install
npm run dev
```

## Struktur Project

```
├── main.py                    # FastAPI app
├── create_tables.py           # Schema + seeding
├── dummy_seed.py              # Seed dummy devices
├── read_modbus.py             # Modbus polling reader
├── database/                  # Koneksi & query umum
├── configuration/             # Config (database.ini, .env)
├── user/                      # Auth & user management
├── role/                      # Role & permission
├── device/                    # Device CRUD
├── device_registers/          # Register definitions
├── kampus/                    # Kampus CRUD
├── unit/                      # Unit CRUD
├── gedung/                    # Gedung CRUD
├── powermeter/                # Power meter CRUD
├── data/                      # Data metrics API
├── tagihan_listrik/           # Estimasi tagihan
├── modbus/                    # Modbus client
├── cron/                      # Aggregation cron jobs
├── web/                       # React frontend
└── docker-compose.yml         # Orchestrasi container
```
