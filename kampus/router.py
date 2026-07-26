from fastapi import APIRouter, Depends, HTTPException
from typing import Annotated
from pydantic import BaseModel
import base64

from dependencies import oauth2_scheme
from configuration.config import load_config
from permission import require_permission
from .db import get_all, new, get_by_id, update, remove


router = APIRouter(
    prefix="/kampus",
    tags=["Kampus"],
    dependencies=[Depends(oauth2_scheme)]
)

class Kampus(BaseModel):
    name: str

@router.get("/", dependencies=[Depends(require_permission("kampus.view"))])
async def get_all_kampus():
    result = get_all(load_config())
    if (result.get("error")): raise HTTPException(
            status_code=400,
            detail=result.get("error")
        )
    return {
        "status": "success",
        "results": result.get("data")
    }

@router.get("/{id}", dependencies=[Depends(require_permission("kampus.view"))])
async def get_kampus(id: str):
    result = get_by_id(id, load_config())
    if (result.get("error")): raise HTTPException(
            status_code=400,
            detail=result.get("error")
        )
    return {
        "status": "success",
        "results": result.get("data")
    }

@router.post("/", dependencies=[Depends(require_permission("kampus.create"))])
async def insert_kampus(kampus: Kampus):
    result = new(kampus.name, load_config())
    if (result.get("error")): raise HTTPException(
            status_code=400,
            detail=result.get("error")
        )
    return {
        "status": "success",
        "results": {
            "id": base64.b64encode(str(result.get("data")).encode()).decode(),
            "name": kampus.name
        }
    }

@router.put("/{id}", dependencies=[Depends(require_permission("kampus.edit"))])
async def update_kampus(id: str, kampus: Kampus):
    result = update(kampus.name, id, load_config())
    if (result.get("error")): raise HTTPException(
            status_code=400,
            detail=result.get("error")
        )
    return {
        "status": "success",
        "results": {
            "id": id,
            "name": kampus.name
        }
    }

@router.delete("/{id}", dependencies=[Depends(require_permission("kampus.delete"))])
async def delete_kampus(id: str, mode: str = None, move_to_id: str = None):
    result = remove(id, mode, move_to_id, load_config())
    if (result.get("error")): raise HTTPException(
            status_code=400,
            detail=result.get("error")
        )
    return {
        "status": "success",
        "results": {
            "message": "Kampus berhasil dihapus"
        }
    }
