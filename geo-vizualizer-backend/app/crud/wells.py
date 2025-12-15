from collections.abc import Sequence

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import Well


async def get_multi(db: AsyncSession) -> Sequence[Well]:
    result = await db.execute(select(Well).order_by(Well.id))
    return result.scalars().all()


