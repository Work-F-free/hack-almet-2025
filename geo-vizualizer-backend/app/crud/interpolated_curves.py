from collections.abc import Iterable, Sequence

from sqlalchemy import delete, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import Curve
from app.models import InterpolatedCurve 
from app.schemas import curve_with_coords as curve_wc

async def get_multi(db: AsyncSession):
    stmt = (
        select(
            Curve.id.label("id"),
            Curve.well_id.label("well_id"),
            Curve.type.label("type"),
            InterpolatedCurve.lat.label("lat"),
            InterpolatedCurve.lon.label("lon"),
            Curve.measured_depth.label("measured_depth"),
            InterpolatedCurve.absolute_depth.label("absolute_depth"),
        )
        .join(InterpolatedCurve, InterpolatedCurve.curve_point_id == Curve.id)
    )
    result = await db.execute(stmt)

    return [
        curve_wc.CurveWithCoords(**row._mapping)
        for row in result
    ]
