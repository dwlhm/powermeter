from fastapi import APIRouter, Depends, HTTPException
from dependencies import oauth2_scheme
from configuration.config import load_config
from .db import get_tarif, update_tarif

router = APIRouter(
    prefix="/tarif-listrik",
    tags=["Tarif Listrik"],
    dependencies=[Depends(oauth2_scheme)]
)

@router.get("/")
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

@router.put("/")
async def update_tarif_listrik(harga: int):
    result = update_tarif(harga=harga, config=load_config())
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