from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class IOCBase(BaseModel):
    value: str
    type: str
    threat_level: str
    description: Optional[str] = None


class IOCCreate(IOCBase):
    pass


class IOCResponse(IOCBase):
    id: str
    created_at: datetime