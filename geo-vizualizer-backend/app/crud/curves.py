from collections.abc import Iterable, Sequence

from sqlalchemy import delete, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import Curve


async def get_multi(db: AsyncSession) -> Sequence[Curve]:
    result = await db.execute(select(Curve).order_by(Curve.id))
    return result.scalars().all()


async def replace_for_well(
    db: AsyncSession,
    *,
    well_id: int,
    curves: Iterable[dict[str, object]],
) -> int:
    await db.execute(delete(Curve).where(Curve.well_id == well_id))

    count = 0
    for c in curves:
        db.add(
            Curve(
                well_id=well_id,
                measured_depth=c.get("measured_depth"),
                type=c.get("type"),
            )
        )
        count += 1
    await db.flush()
    return count


