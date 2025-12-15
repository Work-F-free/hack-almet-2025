from collections.abc import Sequence

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import WellTrack


async def get_multi(db: AsyncSession) -> Sequence[WellTrack]:
    result = await db.execute(select(WellTrack).order_by(WellTrack.id))
    return result.scalars().all()


