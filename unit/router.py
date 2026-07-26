from fastapi import APIRouter, Depends, HTTPException
from typing import Annotated
from pydantic import BaseModel
import base64

from dependencies import oauth2_scheme
from configuration.config import load_config
from permission import require_permission
from .db import get_all, new, get_by_id, update, remove


router = APIRouter(
    prefix="/unit",
    tags=["Unit"],
    dependencies=[Depends(oauth2_scheme)]
)

class Unit(BaseModel):
    name: str
    kampus: str

@router.get("/", dependencies=[Depends(require_permission("unit.view"))])
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

@router.get("/{id}", dependencies=[Depends(require_permission("unit.view"))])
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

@router.post("/", dependencies=[Depends(require_permission("unit.create"))])
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

@router.put("/{id}", dependencies=[Depends(require_permission("unit.edit"))])
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

@router.delete("/{id}", dependencies=[Depends(require_permission("unit.delete"))])
async def delete_unit(id: str, mode: str = None, move_to_id: str = None):
    result = remove(id, mode, move_to_id, load_config())
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
