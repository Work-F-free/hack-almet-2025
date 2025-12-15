from collections.abc import Sequence

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import FormationThickness


async def get_multi(db: AsyncSession) -> Sequence[FormationThickness]:
    result = await db.execute(select(FormationThickness).order_by(FormationThickness.id))
    return result.scalars().all()


