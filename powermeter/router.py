from fastapi import APIRouter, Depends, HTTPException
from typing import Annotated
from pydantic import BaseModel
import base64

from user.internal import get_current_user
from dependencies import oauth2_scheme
from configuration.config import load_config
from .db import get_all, new, get_by_id, update, remove


router = APIRouter(
    prefix="/powermeter",
    tags=["Powermeter"],
    dependencies=[Depends(get_current_user)]
)

class Powermeter(BaseModel):
    seri: str
    brand: str

@router.get("/")
async def get_all_powermeter(token: str = Depends(get_current_user)):
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

@router.post("/")
async def insert_powermeter(powermeter: Powermeter):
    result = new(
        seri=powermeter.seri,
        brand=powermeter.brand, 
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
            "brand": powermeter.brand
        }
    }

@router.put("/{id}")
async def update_powermeter(id: str, powermeter: Powermeter):
    result = update(
        seri=powermeter.seri,
        brand=powermeter.brand, 
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
            "brand": powermeter.brand
        }
    }

@router.delete("/{id}")
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
