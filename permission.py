from fastapi import Depends, HTTPException, status
from typing import Annotated
from user.internal import get_current_user
from role.db import get_role_permissions
from configuration import config

config_db = config.load_config()


def require_permission(code: str):
    async def _require_permission(
        current_user: Annotated[tuple, Depends(get_current_user)],
    ):
        role_id = current_user[5]
        permissions = get_role_permissions(role_id, config_db)
        if not any(p["code"] == code for p in permissions):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Anda tidak memiliki izin untuk mengakses sumber daya ini",
            )
        return current_user

    return _require_permission
