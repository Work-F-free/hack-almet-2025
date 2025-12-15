from collections.abc import Sequence

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import Well


async def get_multi(db: AsyncSession) -> Sequence[Well]:
    result = await db.execute(select(Well).order_by(Well.id))
    return result.scalars().all()


async def upsert(
    db: AsyncSession,
    *,
    well_id: int,
    name: str | None,
    start_measured_depth: float | None,
    end_measured_depth: float | None,
) -> Well:
    existing = await db.get(Well, well_id)
    if existing:
        if name is not None:
            existing.name = name
        existing.start_measured_depth = start_measured_depth
        existing.end_measured_depth = end_measured_depth
        return existing

    obj = Well(
        id=well_id,
        name=name or f"WELL_{well_id}",
        start_measured_depth=start_measured_depth,
        end_measured_depth=end_measured_depth,
    )
    db.add(obj)
    await db.flush()
    return obj


