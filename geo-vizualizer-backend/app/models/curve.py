from sqlalchemy import Float, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class Curve(Base):
    __tablename__ = "curve"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    well_id: Mapped[int] = mapped_column(ForeignKey("well.id", ondelete="CASCADE"), nullable=False)
    measured_depth: Mapped[float | None] = mapped_column(Float, nullable=True)
    type: Mapped[str | None] = mapped_column(String(length=255), nullable=True)

    well = relationship("Well", back_populates="curves")


