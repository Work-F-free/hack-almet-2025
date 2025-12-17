from sqlalchemy.ext.asyncio import AsyncSession
from app import crud
from app.models import Curve, WellTrack
from sqlalchemy import exists, select, text

query = text("""
    insert into interpolated_curve (curve_point_id, lat, lon, absolute_depth)
    WITH curve_points AS (
        SELECT id as curve_id, measured_depth, "type"
        FROM curve
        where well_id = :well_id
    ),
    nearest_points AS (
        select
            c.curve_id,
            c.measured_depth AS md_curve,
            c."type",
            w1.lat AS lat1, w1.lon AS lon1, w1.absolute_depth AS abs_z1, w1.measured_depth AS md1,
            w2.lat AS lat2, w2.lon AS lon2, w2.absolute_depth AS abs_z2, w2.measured_depth AS md2
        FROM curve_points c
        JOIN LATERAL (
            SELECT *
            FROM welltrack
            WHERE measured_depth <= c.measured_depth and well_id = :well_id
            ORDER BY measured_depth DESC
            LIMIT 1
        ) w1 ON true
        JOIN LATERAL (
            SELECT *
            FROM welltrack
            WHERE measured_depth >= c.measured_depth and well_id = :well_id
            ORDER BY measured_depth ASC
            LIMIT 1
        ) w2 ON true
    )
    select
        np.curve_id as curve_point_id,
        CASE 
            WHEN md1 = md2 THEN lat1
            ELSE lat1 + (lat2 - lat1) * (md_curve - md1) / (md2 - md1)
        END AS lat,
        CASE 
            WHEN md1 = md2 THEN lon1
            ELSE lon1 + (lon2 - lon1) * (md_curve - md1) / (md2 - md1)
        END AS lon,
        CASE 
            WHEN md1 = md2 THEN abs_z1
            ELSE abs_z1 + (abs_z2 - abs_z1) * (md_curve - md1) / (md2 - md1)
        END AS abs_z
    FROM nearest_points np
    ORDER BY md_curve;
""")

async def interpolate_curves(db: AsyncSession):
    wells = await crud.wells.get_multi(db)
    failed_ids = []
    for well in wells:
        try:
            await interpolate_curve_for_well(db, well.id)
        except Exception as e:
            failed_ids.append(well.id)

async def interpolate_curve_for_well(db: AsyncSession, well_id: int):

    has_curves = await db.scalar(
        select(exists().where(Curve.well_id == well_id))
    )
    if not has_curves:
        raise Exception(f"zero curves for well with id={well_id}")

    has_welltracks = await db.scalar(
        select(exists().where(WellTrack.well_id == well_id))
    )
    if not has_welltracks:
        raise Exception(f"zero welltracks for well with id={well_id}")

    try:
        await db.execute(query, {"well_id": well_id})
        await db.commit()
    except Exception:
        await db.rollback()
        raise
