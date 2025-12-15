from collections.abc import Iterable, Sequence

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import FormationThickness


async def get_multi(db: AsyncSession) -> Sequence[FormationThickness]:
    result = await db.execute(select(FormationThickness).order_by(FormationThickness.id))
    return result.scalars().all()


async def add_many(
    db: AsyncSession,
    *,
    records: Iterable[dict[str, object]],
) -> int:
    count = 0
    for rec in records:
        db.add(
            FormationThickness(
                well_id=rec.get("well_id"),
                lat=rec.get("lat"),
                lon=rec.get("lon"),
                absolute_depth=rec.get("absolute_depth"),
                thickness=rec.get("thickness"),
            )
        )
        count += 1
    await db.flush()
    return count


