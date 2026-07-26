from fastapi import APIRouter, Depends, HTTPException
from typing import Annotated
from pydantic import BaseModel
import base64

from dependencies import oauth2_scheme
from configuration.config import load_config
from permission import require_permission
from .db import get_all, new, get_by_id, update, remove


router = APIRouter(
    prefix="/powermeter",
    tags=["Powermeter"],
    dependencies=[Depends(oauth2_scheme)]
)

class Powermeter(BaseModel):
    seri: str
    brand: str
    slave_id: int = 1
    count: int = 2
    timeout: int = 4

@router.get("/", dependencies=[Depends(require_permission("powermeter.view"))])
async def get_all_powermeter():
    result = get_all(load_config())
    if (result.get("error")): raise HTTPException(
            status_code=400,
            detail=result.get("error")
        )
    return {
        "status": "success",
        "results": result.get("data")
    }

@router.get("/{id}", dependencies=[Depends(require_permission("powermeter.view"))])
async def get_powermeter(id: str):
    result = get_by_id(id, load_config())
    if (result.get("error")): raise HTTPException(
            status_code=400,
            detail=result.get("error")
        )
    return {
        "status": "success",
        "results": result.get("data")
    }

@router.post("/", dependencies=[Depends(require_permission("powermeter.create"))])
async def insert_powermeter(powermeter: Powermeter):
    result = new(
        seri=powermeter.seri,
        brand=powermeter.brand,
        slave_id=powermeter.slave_id,
        count=powermeter.count,
        timeout=powermeter.timeout,
        config=load_config())
    if (result.get("error")): raise HTTPException(
            status_code=400,
            detail=result.get("error")
        )
    return {
        "status": "success",
        "results": {
            "id": base64.b64encode(str(result.get("data")).encode()).decode(),
            "seri": powermeter.seri,
            "brand": powermeter.brand,
            "slave_id": powermeter.slave_id,
            "count": powermeter.count,
            "timeout": powermeter.timeout
        }
    }

@router.put("/{id}", dependencies=[Depends(require_permission("powermeter.edit"))])
async def update_powermeter(id: str, powermeter: Powermeter):
    result = update(
        seri=powermeter.seri,
        brand=powermeter.brand, 
        slave_id=powermeter.slave_id,
        count=powermeter.count,
        timeout=powermeter.timeout,
        id=id,
        config=load_config())
    if (result.get("error")): raise HTTPException(
            status_code=400,
            detail=result.get("error")
        )
    return {
        "status": "success",
        "results": {
            "id": id,
            "seri": powermeter.seri,
            "brand": powermeter.brand,
            "slave_id": powermeter.slave_id,
            "count": powermeter.count,
            "timeout": powermeter.timeout
        }
    }

@router.delete("/{id}", dependencies=[Depends(require_permission("powermeter.delete"))])
async def delete_powermeter(id: str):
    result = remove(id, load_config())
    if (result.get("error")): raise HTTPException(
            status_code=400,
            detail=result.get("error")
        )
    return {
        "status": "success",
        "results": {
            "message": "Powermeter berhasil dihapus"
        }
    }
