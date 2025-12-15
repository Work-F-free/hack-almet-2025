from collections.abc import Sequence

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import EffectiveFormationThickness


async def get_multi(db: AsyncSession) -> Sequence[EffectiveFormationThickness]:
    result = await db.execute(select(EffectiveFormationThickness).order_by(EffectiveFormationThickness.id))
    return result.scalars().all()


