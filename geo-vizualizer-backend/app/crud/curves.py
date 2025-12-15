from collections.abc import Sequence

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import Curve


async def get_multi(db: AsyncSession) -> Sequence[Curve]:
    result = await db.execute(select(Curve).order_by(Curve.id))
    return result.scalars().all()


