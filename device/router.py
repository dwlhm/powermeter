from fastapi import APIRouter, Depends, HTTPException
from typing import Annotated
from pydantic import BaseModel
import base64

from user.internal import get_current_user
from dependencies import oauth2_scheme
from configuration.config import load_config
from .db import get_all, new, get_by_id, update, remove, get_latest_data, get_device_logs


router = APIRouter(
    prefix="/device",
    tags=["Perangkat"],
    dependencies=[Depends(get_current_user)]
)

class Perangkat(BaseModel):
    name: str
    gedung: str
    ip_addr: str
    port: int
    powermeter: str

@router.get("/")
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

@router.get("/{id}")
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

@router.get("/{id}/latest")
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

@router.post("/")
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

@router.put("/{id}")
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

@router.delete("/{id}")
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

@router.get("/{id}/logs")
async def get_perangkat_logs(id: str):
    result = get_device_logs(
        device_id=id, 
        config=load_config()
    )
    if (result.get("error")): raise HTTPException(
            status_code=400,
            detail=result.get("error")
        )
    return {
        "status": "success",
        "results": result.get("data")
    }
