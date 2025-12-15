from sqlalchemy import Float, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class Well(Base):
    __tablename__ = "well"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(length=255), nullable=False)
    start_measured_depth: Mapped[float | None] = mapped_column(Float, nullable=True)
    end_measured_depth: Mapped[float | None] = mapped_column(Float, nullable=True)

    tracks = relationship("WellTrack", back_populates="well", cascade="all, delete-orphan")
    curves = relationship("Curve", back_populates="well", cascade="all, delete-orphan")
    formation_thicknesses = relationship(
        "FormationThickness", back_populates="well", cascade="all, delete-orphan"
    )
    effective_formation_thicknesses = relationship(
        "EffectiveFormationThickness", back_populates="well", cascade="all, delete-orphan"
    )


