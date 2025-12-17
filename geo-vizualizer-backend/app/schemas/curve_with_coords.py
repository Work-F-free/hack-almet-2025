from pydantic import BaseModel

class CurveWithCoords(BaseModel):
    id: int
    well_id: int
    type: str | None
    lat: float
    lon: float
    measured_depth: float
    absolute_depth: float
