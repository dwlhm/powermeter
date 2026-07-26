from typing import Union
from pydantic import BaseModel
from passlib.context import CryptContext
from datetime import timedelta, timezone, datetime
from jose import jwt
from configuration import config
from .config import SECRET_KEY, ALGORITHM
from ..db import get_user_by_username
from ..schemas import Token, TokenData

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def get_password_hash(password):
    return pwd_context.hash(password)


def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)


def authenticate_user(username: str, password: str):
    user = get_user_by_username(username, config.load_config())
    if not user:
        return False
    if not verify_password(password, user[4]):
        return False
    return user


def create_access_token(data: dict, expires_delta: Union[timedelta, None] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt
