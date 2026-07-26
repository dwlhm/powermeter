from typing import Optional
from pydantic import BaseModel, EmailStr, Field


class User(BaseModel):
    """Payload dasar untuk membuat user baru."""

    full_name: str = Field(..., min_length=1, max_length=100)
    username: str = Field(..., min_length=3, max_length=50)
    email: EmailStr = Field(..., max_length=100)
    password: str = Field(..., min_length=8, max_length=100)
    role: int = Field(..., ge=1)


class UserCreate(User):
    """Alias eksplisit untuk payload pembuatan user."""

    pass


class UserUpdate(BaseModel):
    """Payload untuk memperbarui user. Password opsional."""

    full_name: Optional[str] = Field(None, min_length=1, max_length=100)
    username: Optional[str] = Field(None, min_length=3, max_length=50)
    email: Optional[EmailStr] = Field(None, max_length=100)
    password: Optional[str] = Field(None, min_length=8, max_length=100)
    role: Optional[int] = Field(None, ge=1)


class UserOut(BaseModel):
    """Response user yang dikembalikan ke client."""

    id: int
    full_name: str
    username: str
    email: str
    role: int
    role_name: str


class Role(BaseModel):
    """Response role."""

    id: int
    name: str


class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    username: Optional[str] = None
