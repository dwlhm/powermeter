from fastapi import APIRouter, Depends
from typing import Annotated
from dependencies import oauth2_scheme
from configuration import config
from .internal import User, get_current_user
from .auth.internal import get_password_hash
from .db import insert_new_user, get_all_user

router = APIRouter(
     prefix="/users",
     tags=["Manajemen User"],
     dependencies=[Depends(oauth2_scheme)]
)

config_db = config.load_config()

@router.post("/")
def insert_new_user(user: User):
	user.password = get_password_hash(user.password)
	data = insert_new_user(user, config_db)
	return {"status": "success", "results": user}

@router.get("/me/")
async def read_users_me(
    current_user: Annotated[User, Depends(get_current_user)],
):
    return {
        "status": "success",
        "results": {
            "username": current_user[0],
            "email": current_user[1],
            "token": current_user[2],
        },
    }

@router.get("/")
def get_all_users(token: Annotated[str, Depends(oauth2_scheme)]):
    data = get_all_user(config_db)
    return data
