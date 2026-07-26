from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from dependencies import oauth2_scheme
from configuration.config import load_config
from permission import require_permission
from .db import get_tarif, update_tarif

router = APIRouter(
    prefix="/tarif-listrik",
    tags=["Tarif Listrik"],
    dependencies=[Depends(oauth2_scheme)]
)

@router.get("/", dependencies=[Depends(require_permission("tarif.view"))])
async def get_tarif_listrik():
    result = get_tarif(config=load_config())
    if result.get("error"): raise HTTPException(
        status_code=400,
        detail=result.get("error")
    )

    data = result.get("data")[0]

    return {
        "status": "success",
        "results": {
            "harga": data[1],
            "created_at": data[2],
            "updated_at": data[3]
        }
    }

class TarifListrik(BaseModel):
    harga: int

@router.put("/", dependencies=[Depends(require_permission("tarif.edit"))])
async def update_tarif_listrik(tarifListrik: TarifListrik):
    result = update_tarif(harga=tarifListrik.harga, config=load_config())
    if result.get("error"): return HTTPException(
        status_code=400,
        detail=result.get("error")
    )
        
    if len(result.get("data")) <= 0: 
        return HTTPException(
            status_code=404,
            detail="no original data"
        )
    
    return {
        "status": "success",
        "results": True
    }
