from typing import List

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app import crud
from app.api import deps
from app.core.service import curve_interpolator
from pydantic import BaseModel
from typing import Optional


from collections import defaultdict

router = APIRouter()


@router.post("/interpolate")
async def interpolate(db: AsyncSession = Depends(deps.get_db)):
    await curve_interpolator.interpolate_curves(db)

@router.get("/interpolate/wells")
async def interpolate(db: AsyncSession = Depends(deps.get_db)):
    interpolated_curve_points = await crud.interpolated_curves.get_multi(db)
    data: dict[int, list[InterpolatedPointDTO]] = defaultdict(list)

    for row in interpolated_curve_points:
        data[row.well_id].append(
            InterpolatedPointDTO(
                type=row.type,
                lat=row.lat,
                lon=row.lon,
                measured_depth=row.measured_depth,
                absolute_depth=row.absolute_depth,
            )
        )

    return data




class InterpolatedPointDTO(BaseModel):
    type: Optional[str] = None
    lat: float
    lon: float
    measured_depth: float
    absolute_depth: float
