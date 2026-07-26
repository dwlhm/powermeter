from fastapi import APIRouter, Depends, HTTPException, status
from typing import Annotated, List
from dependencies import oauth2_scheme
from configuration import config
from permission import require_permission

from .schemas import RoleCreate, RoleUpdate, RoleOut
from .db import (
    get_all_roles,
    get_role_by_id,
    create_role,
    update_role,
    delete_role,
    get_all_permissions,
    role_name_exists,
)

router = APIRouter(
    prefix="/roles",
    tags=["Manajemen Role"],
    dependencies=[Depends(oauth2_scheme)],
)

config_db = config.load_config()


@router.get("/", response_model=dict, dependencies=[Depends(require_permission("role.view"))])
def read_roles(token: Annotated[str, Depends(oauth2_scheme)]):
    try:
        roles = get_all_roles(config_db)
        return {"status": "success", "results": roles}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Gagal memuat role: {str(e)}",
        )


@router.get("/permissions", response_model=dict, dependencies=[Depends(require_permission("role.view"))])
def read_permissions(token: Annotated[str, Depends(oauth2_scheme)]):
    try:
        perms = get_all_permissions(config_db)
        return {"status": "success", "results": perms}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Gagal memuat permission: {str(e)}",
        )


@router.get("/{role_id}", response_model=dict, dependencies=[Depends(require_permission("role.view"))])
def read_role(role_id: int, token: Annotated[str, Depends(oauth2_scheme)]):
    role = get_role_by_id(role_id, config_db)
    if not role:
        raise HTTPException(status_code=404, detail="Role tidak ditemukan")
    return {"status": "success", "results": role}


@router.post("/", response_model=dict, status_code=201, dependencies=[Depends(require_permission("role.create"))])
def create_role_endpoint(
    payload: RoleCreate, token: Annotated[str, Depends(oauth2_scheme)]
):
    if role_name_exists(payload.name, config_db):
        raise HTTPException(
            status_code=409, detail="Nama role sudah digunakan"
        )
    try:
        created = create_role(payload, config_db)
        return {"status": "success", "results": created}
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Gagal membuat role: {str(e)}"
        )


@router.put("/{role_id}", response_model=dict, dependencies=[Depends(require_permission("role.edit"))])
def update_role_endpoint(
    role_id: int,
    payload: RoleUpdate,
    token: Annotated[str, Depends(oauth2_scheme)],
):
    existing = get_role_by_id(role_id, config_db)
    if not existing:
        raise HTTPException(status_code=404, detail="Role tidak ditemukan")
    if existing["is_system"]:
        raise HTTPException(
            status_code=403,
            detail="Role sistem tidak dapat diubah",
        )

    if payload.name is not None and role_name_exists(payload.name, config_db, exclude_id=role_id):
        raise HTTPException(
            status_code=409, detail="Nama role sudah digunakan"
        )

    try:
        updated = update_role(role_id, payload, config_db)
        return {"status": "success", "results": updated}
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Gagal memperbarui role: {str(e)}"
        )


@router.delete("/{role_id}", response_model=dict, dependencies=[Depends(require_permission("role.delete"))])
def delete_role_endpoint(
    role_id: int, token: Annotated[str, Depends(oauth2_scheme)]
):
    existing = get_role_by_id(role_id, config_db)
    if not existing:
        raise HTTPException(status_code=404, detail="Role tidak ditemukan")
    if existing["is_system"]:
        raise HTTPException(
            status_code=403,
            detail="Role sistem tidak dapat dihapus",
        )
    try:
        delete_role(role_id, config_db)
        return {"status": "success", "results": {"id": role_id}}
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Gagal menghapus role: {str(e)}"
        )
