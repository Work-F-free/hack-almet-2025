import {Ranges, Wells} from './type';

export const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));

export const padRange = (min: number, max: number, pad = 0.06) => {
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
        for (const [x, y, z, md] of wells[n]) {
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

    const [xMin, xMax] = padRange(minX, maxX, 0.08);
    const [yMin, yMax] = padRange(minY, maxY, 0.08);
    const [zMin, zMax] = padRange(minZ, maxZ, 0.12);

    return {xMin, xMax, yMin, yMax, zMin, zMax, mdMin: minMD, mdMax: maxMD};
};

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

export const makeEllipsePolyline = (cx: number, cy: number, rx: number, ry: number, n = 80) => {
    const pts: Array<[number, number]> = [];
    for (let i = 0; i <= n; i++) {
        const t = (i / n) * Math.PI * 2;
        pts.push([cx + rx * Math.cos(t), cy + ry * Math.sin(t)]);
    }
    return pts;
};
