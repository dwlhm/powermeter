from typing import Optional, List
from pydantic import BaseModel, Field


class PermissionOut(BaseModel):
    id: int
    code: str
    name: str
    group: str
    description: Optional[str] = None


class RoleOut(BaseModel):
    id: int
    name: str
    description: Optional[str] = None
    is_system: bool = False
    permissions: List[PermissionOut] = []


class RoleCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=50)
    description: Optional[str] = Field(None, max_length=255)
    permission_ids: List[int] = []


class RoleUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=50)
    description: Optional[str] = Field(None, max_length=255)
    permission_ids: Optional[List[int]] = None
