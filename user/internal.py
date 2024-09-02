from fastapi import status, Depends, HTTPException
from jose import jwt, JWTError
from typing import Annotated
from pydantic import BaseModel, EmailStr, Field
from datetime import datetime, timezone

from .auth import internal as auth
from .auth.config import SECRET_KEY, ALGORITHM
from .db import get_user_by_username
from dependencies import oauth2_scheme
from configuration import config

class User(BaseModel):
    full_name: str
    username: str
    email: EmailStr
    password: str = Field(min_length=8)
    role: int

async def get_current_user(token: Annotated[str, Depends(oauth2_scheme)]):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        print(payload)
        username: str = payload.get("sub")
        exp_timestamp = payload.get("exp")
        if exp_timestamp:
            exp_datetime = datetime.fromtimestamp(exp_timestamp, tz=timezone.utc)
            if exp_dateime > datetime.now(timezone.utc):
                raise credentials_exception
        if username is None:
            raise credentials_exception
        token_data = auth.TokenData(username=username)
    except ( JWTError, jwt.ExpiredSignatureError ):
        raise credentials_exception
    user = get_user_by_username(username, config.load_config())
    if user is None:
        raise credentials_exception
    return user
