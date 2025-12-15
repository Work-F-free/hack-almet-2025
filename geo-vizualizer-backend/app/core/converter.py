import re
from pathlib import Path
from typing import Any

from sqlalchemy import delete
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import (
    Curve,
    EffectiveFormationThickness,
    FormationThickness,
    Well,
    WellTrack,
)


class Converter:
    def __init__(self, output_file: str | None = None):
        self.output_file = output_file

    async def convert_well_file(self, db: AsyncSession, *, file_path: str) -> dict[str, Any]:
        """
        Parse LAS-like file and persist Well + Curve rows into DB.
        - ~Well: STRT -> start_measured_depth, STOP -> end_measured_depth, WELL -> name + id
        - ~Ascii: first column -> measured_depth, second -> type (only 0/1 kept, else empty)
        - ~Version is skipped
        """
        lines = Path(file_path).read_text(encoding="utf-8").splitlines()

        well_data: dict[str, Any] = {
            "id": None,
            "name": None,
            "start_measured_depth": None,
            "end_measured_depth": None,
        }
        curves: list[dict[str, Any]] = []

        current_block = None
        for raw in lines:
            line = raw.strip()
            if not line:
                continue

            if line.startswith("~"):
                header = line.lower()
                if header.startswith("~well"):
                    current_block = "well"
                elif header.startswith("~curve"):
                    current_block = "curve"
                elif header.startswith("~ascii"):
                    current_block = "ascii"
                else:
                    current_block = None
                continue

            if line.startswith("#"):
                continue

            if current_block == "well":
                if line.upper().startswith("STRT"):
                    match = re.search(r"STRT\s*\.\S*\s*([-\d\.]+)", line, re.IGNORECASE)
                    if match:
                        well_data["start_measured_depth"] = float(match.group(1))
                elif line.upper().startswith("STOP"):
                    match = re.search(r"STOP\s*\.\S*\s*([-\d\.]+)", line, re.IGNORECASE)
                    if match:
                        well_data["end_measured_depth"] = float(match.group(1))
                elif line.upper().startswith("WELL"):
                    match = re.search(r"WELL\.\s*([A-Za-z0-9_]+)", line, re.IGNORECASE)
                    if match:
                        well_name = match.group(1)
                        well_data["name"] = well_name
                        id_match = re.search(r"(\d+)$", well_name)
                        if id_match:
                            well_data["id"] = int(id_match.group(1))

            elif current_block == "ascii":
                parts = line.split()
                if len(parts) < 2:
                    continue
                try:
                    measured_depth = float(parts[0])
                except ValueError:
                    continue

                type_raw = parts[1]
                type_value = ""
                try:
                    numeric_type = float(type_raw)
                    if numeric_type in (0.0, 1.0):
                        type_value = str(int(numeric_type))
                except ValueError:
                    type_value = ""

                curves.append(
                    {
                        "measured_depth": measured_depth,
                        "type": type_value,
                    }
                )

        if well_data["id"] is None or well_data["name"] is None:
            raise ValueError("Well information is incomplete in ~Well block")

        well_id = well_data["id"]

        # Upsert well
        existing = await db.get(Well, well_id)
        if existing:
            existing.name = well_data["name"]
            existing.start_measured_depth = well_data["start_measured_depth"]
            existing.end_measured_depth = well_data["end_measured_depth"]
            await db.execute(delete(Curve).where(Curve.well_id == well_id))
        else:
            db.add(
                Well(
                    id=well_id,
                    name=well_data["name"],
                    start_measured_depth=well_data["start_measured_depth"],
                    end_measured_depth=well_data["end_measured_depth"],
                )
            )

        # Add curves
        for c in curves:
            db.add(
                Curve(
                    well_id=well_id,
                    measured_depth=c["measured_depth"],
                    type=c["type"],
                )
            )

        await db.commit()

        return {
            "well_id": well_id,
            "well_name": well_data["name"],
            "curves_saved": len(curves),
        }

    async def convert_welltrack(self, db: AsyncSession, *, file_path: str) -> dict[str, Any]:
        """
        Parse welltrack blocks and persist WellTrack rows per well.
        Format example:
            welltrack  'WELL_N'
              lat lon absolute_depth measured_depth
              ...
              ... ;
            welltrack  'WELL_M'
            ...
        - WELL_X -> well_id extracted from trailing digits of WELL_X
        - columns: lat, lon, absolute_depth, measured_depth
        """
        text = Path(file_path).read_text(encoding="utf-8")
        lines = text.splitlines()

        blocks: dict[int, list[dict[str, float]]] = {}
        well_names: dict[int, str] = {}
        current_well_id: int | None = None

        header_pattern = re.compile(r"welltrack\s+'?([A-Za-z0-9_]+)'?", re.IGNORECASE)

        for raw in lines:
            line = raw.strip()
            if not line:
                continue

            header_match = header_pattern.match(line)
            if header_match:
                well_name = header_match.group(1)
                id_match = re.search(r"(\d+)$", well_name)
                if not id_match:
                    current_well_id = None
                    continue
                current_well_id = int(id_match.group(1))
                well_names[current_well_id] = well_name
                blocks.setdefault(current_well_id, [])
                continue

            if current_well_id is None:
                continue

            # Remove trailing ';' if present
            if line.endswith(";"):
                line = line[:-1].strip()

            parts = line.split()
            if len(parts) < 4:
                continue
            try:
                lat = float(parts[0])
                lon = float(parts[1])
                absolute_depth = float(parts[2])
                measured_depth = float(parts[3])
            except ValueError:
                continue

            blocks[current_well_id].append(
                {
                    "lat": lat,
                    "lon": lon,
                    "absolute_depth": absolute_depth,
                    "measured_depth": measured_depth,
                }
            )

        total_rows = 0
        wells_processed = 0

        for well_id, records in blocks.items():
            wells_processed += 1
            well_name = well_names.get(well_id, f"WELL_{well_id}")

            # Ensure well exists (create minimal stub if missing)
            existing = await db.get(Well, well_id)
            if not existing:
                db.add(Well(id=well_id, name=well_name))
                await db.flush()

            # Replace existing tracks for this well
            await db.execute(delete(WellTrack).where(WellTrack.well_id == well_id))

            for rec in records:
                db.add(
                    WellTrack(
                        well_id=well_id,
                        lat=rec["lat"],
                        lon=rec["lon"],
                        absolute_depth=rec["absolute_depth"],
                        measured_depth=rec["measured_depth"],
                    )
                )
            total_rows += len(records)

        await db.commit()

        return {
            "wells_processed": wells_processed,
            "rows_saved": total_rows,
        }
    
    async def convert_formation_thickness(self, db: AsyncSession, *, file_path: str) -> dict[str, Any]:
        """
        Parse formation_thickness file:
        Columns: lat, lon, absolute_depth, WELL_N (id from N), thickness
        """
        lines = Path(file_path).read_text(encoding="utf-8").splitlines()
        total_rows = 0
        wells_seen: set[int] = set()

        for raw in lines:
            line = raw.strip()
            if not line or line.lower().startswith("string") or line.lower().startswith("float"):
                continue
            parts = line.split()
            if len(parts) < 5:
                continue
            try:
                lat = float(parts[0])
                lon = float(parts[1])
                absolute_depth = float(parts[2])
            except ValueError:
                continue

            well_token = parts[3]
            id_match = re.search(r"(\d+)$", well_token)
            if not id_match:
                continue
            well_id = int(id_match.group(1))
            wells_seen.add(well_id)

            try:
                thickness = float(parts[4])
            except ValueError:
                thickness = None

            existing = await db.get(Well, well_id)
            if not existing:
                db.add(Well(id=well_id, name=well_token))
                await db.flush()

            db.add(
                FormationThickness(
                    well_id=well_id,
                    lat=lat,
                    lon=lon,
                    absolute_depth=absolute_depth,
                    thickness=thickness,
                )
            )
            total_rows += 1

        await db.commit()

        return {"rows_saved": total_rows, "wells_touched": len(wells_seen)}
    
    async def convert_effective_formation_thickness(
        self, db: AsyncSession, *, file_path: str
    ) -> dict[str, Any]:
        """
        Parse effective_formation_thickness file:
        Columns: lat, lon, absolute_depth, WELL_N (id from N), thickness
        """
        lines = Path(file_path).read_text(encoding="utf-8").splitlines()
        total_rows = 0
        wells_seen: set[int] = set()

        for raw in lines:
            line = raw.strip()
            if not line or line.lower().startswith("string") or line.lower().startswith("float"):
                continue
            parts = line.split()
            if len(parts) < 5:
                continue
            try:
                lat = float(parts[0])
                lon = float(parts[1])
                absolute_depth = float(parts[2])
            except ValueError:
                continue

            well_token = parts[3]
            id_match = re.search(r"(\d+)$", well_token)
            if not id_match:
                continue
            well_id = int(id_match.group(1))
            wells_seen.add(well_id)

            try:
                thickness = float(parts[4])
            except ValueError:
                thickness = None

            existing = await db.get(Well, well_id)
            if not existing:
                db.add(Well(id=well_id, name=well_token))
                await db.flush()

            db.add(
                EffectiveFormationThickness(
                    well_id=well_id,
                    lat=lat,
                    lon=lon,
                    absolute_depth=absolute_depth,
                    thickness=thickness,
                )
            )
            total_rows += 1

        await db.commit()

        return {"rows_saved": total_rows, "wells_touched": len(wells_seen)}