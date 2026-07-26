from fastapi import APIRouter, Depends, HTTPException, status
from typing import Annotated, List
from dependencies import oauth2_scheme
from configuration import config

from .internal import get_current_user
from .schemas import User, UserCreate, UserUpdate, UserOut, Role
from .auth.internal import get_password_hash
from role.db import get_role_permissions
from permission import require_permission
from .db import (
    insert_new_user,
    get_all_users,
    get_user_by_id,
    update_user,
    delete_user,
    get_roles,
    username_exists,
    email_exists,
)

router = APIRouter(
    prefix="/users",
    tags=["Manajemen User"],
    dependencies=[Depends(oauth2_scheme)],
)

config_db = config.load_config()


@router.get("/", response_model=dict, dependencies=[Depends(require_permission("user.view"))])
def read_users(token: Annotated[str, Depends(oauth2_scheme)]):
    try:
        users = get_all_users(config_db)
        return {"status": "success", "results": users}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Gagal memuat data user: {str(e)}",
        )


@router.get("/roles", response_model=dict, dependencies=[Depends(require_permission("role.view"))])
def read_roles(token: Annotated[str, Depends(oauth2_scheme)]):
    try:
        roles = get_roles(config_db)
        return {"status": "success", "results": roles}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Gagal memuat data role: {str(e)}",
        )


@router.get("/me")
async def read_users_me(
    current_user: Annotated[tuple, Depends(get_current_user)],
):
    permissions = get_role_permissions(current_user[5], config_db)
    permission_codes = [p["code"] for p in permissions]
    return {
        "status": "success",
        "results": {
            "id": current_user[0],
            "full_name": current_user[1],
            "username": current_user[2],
            "email": current_user[3],
            "role": current_user[5],
            "role_name": current_user[6] or "Unknown",
            "permissions": permission_codes,
        },
    }


@router.get("/{user_id}", response_model=dict, dependencies=[Depends(require_permission("user.view"))])
def read_user(user_id: int, token: Annotated[str, Depends(oauth2_scheme)]):
    user = get_user_by_id(user_id, config_db)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User tidak ditemukan",
        )
    return {"status": "success", "results": user}


@router.post("/", response_model=dict, status_code=status.HTTP_201_CREATED, dependencies=[Depends(require_permission("user.create"))])
def create_user(user: UserCreate, token: Annotated[str, Depends(oauth2_scheme)]):
    if username_exists(user.username, config_db):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Username sudah digunakan",
        )
    if email_exists(user.email, config_db):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email sudah digunakan",
        )

    try:
        hashed_password = get_password_hash(user.password)
        new_user = user.model_copy(update={"password": hashed_password})
        created = insert_new_user(new_user, config_db)
        return {"status": "success", "results": created}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Gagal membuat user: {str(e)}",
        )


@router.put("/{user_id}", response_model=dict, dependencies=[Depends(require_permission("user.edit"))])
def update_user_endpoint(
    user_id: int,
    payload: UserUpdate,
    token: Annotated[str, Depends(oauth2_scheme)],
):
    existing = get_user_by_id(user_id, config_db)
    if not existing:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User tidak ditemukan",
        )

    if payload.username is not None and username_exists(
        payload.username, config_db, exclude_id=user_id
    ):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Username sudah digunakan oleh user lain",
        )
    if payload.email is not None and email_exists(
        payload.email, config_db, exclude_id=user_id
    ):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email sudah digunakan oleh user lain",
        )

    update_data = payload.model_copy()
    if payload.password is not None:
        update_data = update_data.model_copy(update={"password": get_password_hash(payload.password)})

    try:
        updated = update_user(user_id, update_data, config_db)
        return {"status": "success", "results": updated}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Gagal memperbarui user: {str(e)}",
        )


@router.delete("/{user_id}", response_model=dict, dependencies=[Depends(require_permission("user.delete"))])
def remove_user(user_id: int, token: Annotated[str, Depends(oauth2_scheme)]):
    existing = get_user_by_id(user_id, config_db)
    if not existing:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User tidak ditemukan",
        )

    try:
        deleted = delete_user(user_id, config_db)
        if not deleted:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Gagal menghapus user",
            )
        return {"status": "success", "results": {"id": user_id}}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Gagal menghapus user: {str(e)}",
        )
