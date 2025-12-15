from typing import Optional

from pydantic import BaseModel


class WellBase(BaseModel):
    name: str
    start_measured_depth: Optional[float] = None
    end_measured_depth: Optional[float] = None


class Well(WellBase):
    id: int

    class Config:
        orm_mode = True


