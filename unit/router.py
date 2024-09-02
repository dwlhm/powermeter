from fastapi import APIRouter, Depends, HTTPException
from typing import Annotated
from pydantic import BaseModel
import base64

from user.internal import get_current_user
from dependencies import oauth2_scheme
from configuration.config import load_config
from .db import get_all, new, get_by_id, update, remove


router = APIRouter(
    prefix="/unit",
    tags=["Unit"],
    dependencies=[Depends(get_current_user)]
)

class Unit(BaseModel):
    name: str
    kampus: str

@router.get("/")
async def get_all_unit():
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
async def get_unit(id: str):
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
async def insert_unit(unit: Unit):
    result = new(unit.name, unit.kampus, load_config())
    if (result.get("error")): raise HTTPException(
            status_code=400,
            detail=result.get("error")
        )
    return {
        "status": "success",
        "results": {
            "id": base64.b64encode(str(result.get("data")).encode()).decode(),
            "name": unit.name,
            "kampus": {
                "id": unit.kampus
            }
        }
    }

@router.put("/{id}")
async def update_unit(id: str, unit: Unit):
    result = update(unit.name, unit.kampus, id, load_config())
    if (result.get("error")): raise HTTPException(
            status_code=400,
            detail=result.get("error")
        )
    return {
        "status": "success",
        "data": {
            "id": id,
            "name": unit.name,
            "kampus_id": unit.kampus
        }
    }

@router.delete("/{id}")
async def delete_unit(id: str):
    result = remove(id, load_config())
    if (result.get("error")): raise HTTPException(
            status_code=400,
            detail=result.get("error")
        )
    return {
        "status": "success",
        "data": {
            "message": "Unit berhasil dihapus"
        }
    }
