import type {CollectorRadial, Ranges, Wells} from './type';

export const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

export const padRange = (min: number, max: number, pad = 0.05) => {
    const span = Math.max(1e-9, max - min);
    const p = span * pad;
    return [min - p, max + p] as const;
};

export const getRanges = (wells: Wells): Ranges => {
    const names = Object.keys(wells);

    let minX = Infinity,
        maxX = -Infinity;
    let minY = Infinity,
        maxY = -Infinity;
    let minZ = Infinity,
        maxZ = -Infinity;
    let minMD = Infinity,
        maxMD = -Infinity;

    for (const n of names) {
        const pts = wells[n] ?? [];
        for (const [x, y, z, md] of pts) {
            minX = Math.min(minX, x);
            maxX = Math.max(maxX, x);
            minY = Math.min(minY, y);
            maxY = Math.max(maxY, y);
            minZ = Math.min(minZ, z);
            maxZ = Math.max(maxZ, z);
            minMD = Math.min(minMD, md);
            maxMD = Math.max(maxMD, md);
        }
    }

    if (!Number.isFinite(minX)) {
        return {
            xMin: 0,
            xMax: 1,
            yMin: 0,
            yMax: 1,
            zMin: 0,
            zMax: 1,
            mdMin: 0,
            mdMax: 1,
        };
    }

    const [xMin, xMax] = padRange(minX, maxX, 0.08);
    const [yMin, yMax] = padRange(minY, maxY, 0.08);
    const [zMin, zMax] = padRange(minZ, maxZ, 0.12);

    return {xMin, xMax, yMin, yMax, zMin, zMax, mdMin: minMD, mdMax: maxMD};
};

export const getRangesWithCollectors = (wells: Wells, collectors: CollectorRadial[]): Ranges => {
    const base = getRanges(wells);

    let minX = base.xMin,
        maxX = base.xMax;
    let minY = base.yMin,
        maxY = base.yMax;
    let minZ = base.zMin,
        maxZ = base.zMax;

    for (const c of collectors) {
        const lobeAmp = c.lobeAmp ?? 0.22;

        const factor = 1 + lobeAmp + 0.12 + 0.08 + 0.1;

        minX = Math.min(minX, c.cx - c.rx * factor);
        maxX = Math.max(maxX, c.cx + c.rx * factor);
        minY = Math.min(minY, c.cy - c.ry * factor);
        maxY = Math.max(maxY, c.cy + c.ry * factor);
        minZ = Math.min(minZ, c.cz - c.rz * factor);
        maxZ = Math.max(maxZ, c.cz + c.rz * factor);
    }

    const [xMin, xMax] = padRange(minX, maxX, 0.08);
    const [yMin, yMax] = padRange(minY, maxY, 0.08);
    const [zMin, zMax] = padRange(minZ, maxZ, 0.12);

    return {...base, xMin, xMax, yMin, yMax, zMin, zMax};
};

export const mergeRanges = (a: Ranges, b: Ranges): Ranges => ({
    xMin: Math.min(a.xMin, b.xMin),
    xMax: Math.max(a.xMax, b.xMax),
    yMin: Math.min(a.yMin, b.yMin),
    yMax: Math.max(a.yMax, b.yMax),
    zMin: Math.min(a.zMin, b.zMin),
    zMax: Math.max(a.zMax, b.zMax),
    mdMin: Math.min(a.mdMin, b.mdMin),
    mdMax: Math.max(a.mdMax, b.mdMax),
});

export const makeEllipsePolyline = (
    cx: number,
    cy: number,
    cz: number,
    rx: number,
    ry: number,
    samples = 96,
): [number, number, number, number][] => {
    const pts: [number, number, number, number][] = [];
    for (let i = 0; i <= samples; i++) {
        const t = (i / samples) * Math.PI * 2;
        pts.push([cx + Math.cos(t) * rx, cy + Math.sin(t) * ry, cz, 0]);
    }
    return pts;
};
