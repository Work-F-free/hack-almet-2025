from sqlalchemy import Float, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class InterpolatedCurve(Base):
    __tablename__ = "interpolated_curve"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    curve_point_id: Mapped[int] = mapped_column(ForeignKey("curve.id", ondelete="CASCADE"), nullable=False)
    lat: Mapped[float | None] = mapped_column(Float, nullable=True)
    lon: Mapped[float | None] = mapped_column(Float, nullable=True)
    absolute_depth: Mapped[float | None] = mapped_column(Float, nullable=True)
