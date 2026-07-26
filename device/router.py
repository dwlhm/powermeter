from fastapi import APIRouter, Depends, HTTPException, Query
from typing import Annotated, Optional
from pydantic import BaseModel
from datetime import datetime
import base64

from dependencies import oauth2_scheme
from configuration.config import load_config
from permission import require_permission
from .db import get_all, new, get_by_id, update, remove, get_latest_data, get_device_logs


router = APIRouter(
    prefix="/device",
    tags=["Perangkat"],
    dependencies=[Depends(oauth2_scheme)]
)

class Perangkat(BaseModel):
    name: str
    gedung: str
    ip_addr: str
    port: int
    powermeter: str

@router.get("/", dependencies=[Depends(require_permission("device.view"))])
async def get_all_perangkat():
    result = get_all(load_config())
    if (result.get("error")): raise HTTPException(
            status_code=400,
            detail=result.get("error")
        )
    return {
        "status": "success",
        "results": result.get("data")
    }

@router.get("/{id}", dependencies=[Depends(require_permission("device.view"))])
async def get_perangkat(id: str):
    result = get_by_id(id, load_config())
    if (result.get("error")): raise HTTPException(
            status_code=400,
            detail=result.get("error")
        )
    return {
        "status": "success",
        "results": result.get("data")
    }

@router.get("/{id}/latest", dependencies=[Depends(require_permission("device.view"))])
async def get_latest_data_perangkat(id: str):
    result = get_latest_data(id, load_config())
    
    if (result.get("error")): raise HTTPException(
            status_code=400,
            detail=result.get("error")
        )
    return {
        "status": "success",
        "results": result.get("data")
    }

@router.post("/", dependencies=[Depends(require_permission("device.create"))])
async def insert_perangkat(perangkat: Perangkat):
    result = new(
        name=perangkat.name, 
        gedung_id=perangkat.gedung, 
        ip_addr=perangkat.ip_addr,
        port=perangkat.port,
        power_meter_id=perangkat.powermeter,
        config=load_config()
    )
    if (result.get("error")): raise HTTPException(
            status_code=400,
            detail=result.get("error")
        )
    return {
        "status": "success",
        "data": {
            "id": base64.b64encode(str(result.get("data")).encode()).decode(),
            "name": perangkat.name,
            "gedung_id": perangkat.gedung,
            "ip_addr": perangkat.ip_addr,
            "port": perangkat.port,
            "power_meter_id": perangkat.powermeter
        }
    }

@router.put("/{id}", dependencies=[Depends(require_permission("device.edit"))])
async def update_perangkat(id: str, perangkat: Perangkat):
    result = update(
        name=perangkat.name, 
        gedung_id=perangkat.gedung, 
        ip_addr=perangkat.ip_addr,
        port=perangkat.port,
        power_meter_id=perangkat.powermeter,
        id=id,
        config=load_config()
    )
    if (result.get("error")): raise HTTPException(
            status_code=400,
            detail=result.get("error")
        )
    return {
        "status": "success",
        "data": {
            "id": id,
            "name": perangkat.name,
            "gedung_id": perangkat.gedung,
            "ip_addr": perangkat.ip_addr,
            "port": perangkat.port,
            "power_meter_id": perangkat.powermeter
        }
    }

@router.delete("/{id}", dependencies=[Depends(require_permission("device.delete"))])
async def delete_perangkat(id: str):
    result = remove(id, load_config())
    if (result.get("error")): raise HTTPException(
            status_code=400,
            detail=result.get("error")
        )
    return {
        "status": "success",
        "data": {
            "message": "Perangkat berhasil dihapus"
        }
    }

@router.get("/{id}/logs", dependencies=[Depends(require_permission("device.view"))])
async def get_perangkat_logs(
    id: str,
    type: Optional[str] = Query(None, description="Filter berdasarkan tipe log (error, warning, info)"),
    from_date: Optional[datetime] = Query(None, description="Filter log dari tanggal (ISO 8601)"),
    to_date: Optional[datetime] = Query(None, description="Filter log sampai tanggal (ISO 8601)"),
    limit: Optional[int] = Query(None, ge=1, le=1000, description="Batas jumlah log yang dikembalikan"),
):
    result = get_device_logs(
        device_id=id,
        config=load_config(),
        log_type=type,
        from_date=from_date,
        to_date=to_date,
        limit=limit,
    )
    if (result.get("error")): raise HTTPException(
            status_code=400,
            detail=result.get("error")
        )
    return {
        "status": "success",
        "results": result.get("data")
    }
