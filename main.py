from fastapi import Depends, FastAPI
from fastapi.middleware.cors import CORSMiddleware

import user.auth.router as auth
import user.router as user
import powermeter.register.router as powermeter_register
import powermeter.router as powermeter
import kampus.router as kampus
import unit.router as unit
import gedung.router as gedung
import device.router as device
import data.router as data
import tagihan_listrik.router as tagihan_listrik
import role.router as role

from configuration.config import load_config

config = load_config()

app = FastAPI()

origins = [
    "http://localhost",
    "http://localhost:5173",
    "http://localhost:4173",
    "http://127.0.0.1",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:4173",
    "https://web.mpm.orb.local",
    "http://web.mpm.orb.local",
    "https://simaung.unsil.ac.id",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_origin_regex=r"https://.*\.trycloudflare\.com",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(user.router)
app.include_router(powermeter.router)
app.include_router(powermeter_register.router)
app.include_router(kampus.router)
app.include_router(unit.router)
app.include_router(gedung.router)
app.include_router(device.router)
app.include_router(data.router)
app.include_router(tagihan_listrik.router)
app.include_router(role.router)