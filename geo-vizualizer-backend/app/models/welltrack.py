from sqlalchemy import Float, ForeignKey, Integer
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class WellTrack(Base):
    __tablename__ = "welltrack"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    well_id: Mapped[int] = mapped_column(ForeignKey("well.id", ondelete="CASCADE"), nullable=False)
    lat: Mapped[float | None] = mapped_column(Float, nullable=True)
    lon: Mapped[float | None] = mapped_column(Float, nullable=True)
    absolute_depth: Mapped[float | None] = mapped_column(Float, nullable=True)
    measured_depth: Mapped[float | None] = mapped_column(Float, nullable=True)

    well = relationship("Well", back_populates="tracks")


