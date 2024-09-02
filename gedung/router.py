from fastapi import APIRouter, Depends, HTTPException
from typing import Annotated
from pydantic import BaseModel
import base64

from user.internal import get_current_user
from dependencies import oauth2_scheme
from configuration.config import load_config
from .db import get_all, new, get_by_id, update, remove


router = APIRouter(
    prefix="/gedung",
    tags=["Gedung"],
    dependencies=[Depends(get_current_user)]
)

class Gedung(BaseModel):
    name: str
    unit: str

@router.get("/")
async def get_all_gedung():
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
async def get_gedung(id: str):
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
async def insert_gedung(gedung: Gedung):
    result = new(gedung.name, gedung.unit, load_config())
    if (result.get("error")): raise HTTPException(
            status_code=400,
            detail=result.get("error")
        )
    return {
        "status": "success",
        "results": {
            "id": base64.b64encode(str(result.get("data")).encode()).decode(),
            "name": gedung.name,
            "unit": {
                "id": gedung.unit
            }
        }
    }

@router.put("/{id}")
async def update_gedung(id: str, gedung: Gedung):
    result = update(gedung.name, gedung.unit, id, load_config())
    if (result.get("error")): raise HTTPException(
            status_code=400,
            detail=result.get("error")
        )
    return {
        "status": "success",
        "results": {
            "id": id,
            "name": gedung.name,
            "unit": {
                "id": gedung.unit
            }
        }
    }

@router.delete("/{id}")
async def delete_gedung(id: str):
    result = remove(id, load_config())
    if (result.get("error")): raise HTTPException(
            status_code=400,
            detail=result.get("error")
        )
    return {
        "status": "success",
        "results": {
            "message": "Gedung berhasil dihapus"
        }
    }
