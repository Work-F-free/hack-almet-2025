from typing import Optional

from pydantic import BaseModel


class Curve(BaseModel):
    id: int
    well_id: int
    measured_depth: Optional[float] = None
    type: Optional[str] = None

    class Config:
        orm_mode = True


