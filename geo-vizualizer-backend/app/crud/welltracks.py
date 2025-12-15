from collections.abc import Iterable, Sequence

from sqlalchemy import delete, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import WellTrack


async def get_multi(db: AsyncSession) -> Sequence[WellTrack]:
    result = await db.execute(select(WellTrack).order_by(WellTrack.id))
    return result.scalars().all()


async def replace_for_well(
    db: AsyncSession,
    *,
    well_id: int,
    tracks: Iterable[dict[str, object]],
) -> int:
    await db.execute(delete(WellTrack).where(WellTrack.well_id == well_id))

    count = 0
    for t in tracks:
        db.add(
            WellTrack(
                well_id=well_id,
                lat=t.get("lat"),
                lon=t.get("lon"),
                absolute_depth=t.get("absolute_depth"),
                measured_depth=t.get("measured_depth"),
            )
        )
        count += 1
    await db.flush()
    return count


