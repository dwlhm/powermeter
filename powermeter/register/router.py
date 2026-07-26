from fastapi import APIRouter, Depends, HTTPException
from typing import Optional
from pydantic import BaseModel
from dependencies import oauth2_scheme
from permission import require_permission
from .db import get, new, update, remove, get_by_id
from configuration.config import load_config

router = APIRouter(
    prefix="/powermeter",
    tags=["Powermeter Register"],
    dependencies=[Depends(oauth2_scheme)]
)

class PowermeterRegister(BaseModel):
    registers: str 

@router.post("/{id}/register", dependencies=[Depends(require_permission("powermeter.create"))])
async def new_register(id: str, pmRegister: PowermeterRegister):
    print("ereew",id)
    result = new(id, pmRegister.registers, load_config())

    if result.get('error'):
        raise HTTPException(
            status_code=400,
            detail=result.get("error")
        )

    return {
        "status": "success",
        "results": result.get('data')
    }

@router.get("/{id}/register", dependencies=[Depends(require_permission("powermeter.view"))])
async def get_register_by_id(id: str):
    result = get_by_id(id, load_config())

    if result.get('error'):
        raise HTTPException(
            status_code=400,
            detail=result.get("error")
        )

    return {
        "status": "success",
        "results": result.get('data')
    }


@router.put("/{id}/register", dependencies=[Depends(require_permission("powermeter.edit"))])
async def update_register(id: str, pmReg: PowermeterRegister):
    result = update(id=id, powermeter_id=pmReg.powermeter_id, register=pmReg.registers, config=load_config())

    if result.get("error"):
        raise HTTPException(
                status_code=400,
                detail=result.get("error")
                )

    return {
        "status": "success",
        "results": result.get("data")
    }

@router.delete("/{id}/register", dependencies=[Depends(require_permission("powermeter.delete"))])
async def delete_register(id: str):
    result = remove(id, load_config())

    if result.get("error"):
        raise HTTPException(
                status_code=400,
                detail=result.get("error")
                )

    return {
        "status": "success",
        "results": result.get("data")
    }


