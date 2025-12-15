from typing import Optional

from pydantic import BaseModel


class FormationThickness(BaseModel):
    id: int
    well_id: int
    lat: Optional[float] = None
    lon: Optional[float] = None
    absolute_depth: Optional[float] = None
    thickness: Optional[float] = None

    class Config:
        orm_mode = True


