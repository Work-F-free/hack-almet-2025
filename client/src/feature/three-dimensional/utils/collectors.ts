import {CollectorRadial, SliceMode, WellPoint, Wells} from './type';

export const isInsideCollector = (p: WellPoint, c: CollectorRadial) => {
    const [x, y, z] = p;
    const nx = (x - c.cx) / Math.max(1e-9, c.rx);
    const ny = (y - c.cy) / Math.max(1e-9, c.ry);
    const nz = (z - c.cz) / Math.max(1e-9, c.rz);

    return nx * nx + ny * ny + nz * nz <= 1.0;
};

export const slicePoints = (pts: WellPoint[], enabled: boolean, mode: SliceMode, value: number) => {
    if (!enabled) return pts;

    if (mode === 'md') {
        return pts.filter((p) => p[3] <= value);
    }

    return pts.filter((p) => p[2] >= value);
};

export const splitRuns = (pts: WellPoint[], predicate: (p: WellPoint) => boolean) => {
    const runs: WellPoint[][] = [];
    let cur: WellPoint[] = [];

    for (const p of pts) {
        if (predicate(p)) {
            cur.push(p);
        } else if (cur.length) {
            runs.push(cur);
            cur = [];
        }
    }
    if (cur.length) runs.push(cur);

    return runs;
};

export const collectHits = (wells: Wells, collectors: CollectorRadial[]) => {
    const out: Record<string, Record<string, WellPoint[]>> = {};
    for (const [wellName, pts] of Object.entries(wells)) {
        out[wellName] = {};
        for (const c of collectors) {
            out[wellName][c.id] = pts.filter((p) => isInsideCollector(p, c));
        }
    }
    return out;
};

export const makeCollectorBlobSeries = (c: CollectorRadial) => {
    const power = c.power ?? 0.62;
    const lobeAmp = c.lobeAmp ?? 0.22;
    const fu = c.lobeFreqU ?? 3;
    const fv = c.lobeFreqV ?? 2;

    const spow = (v: number, p: number) => Math.sign(v) * Math.pow(Math.abs(v), p);

    const radial = (u: number, v: number) => {
        const r =
            1 +
            lobeAmp * Math.sin(fu * u) * Math.cos(fv * v) +
            0.12 * Math.sin((fu + 1) * (u + v)) +
            0.08 * Math.cos((fv + 2) * (u - v));
        return Math.max(0.55, r);
    };

    const surface = {
        name: `${c.name} | blob`,
        type: 'surface',
        shading: 'lambert',
        wireframe: {show: false},
        parametric: true,
        itemStyle: {opacity: 0.38, color: c.color},
        parametricEquation: {
            u: {min: -Math.PI, max: Math.PI, step: 0.11},
            v: {min: -Math.PI / 2, max: Math.PI / 2, step: 0.11},
            x: (u: number, v: number) => {
                const rr = radial(u, v);
                return c.cx + c.rx * rr * spow(Math.cos(v) * Math.cos(u), power);
            },
            y: (u: number, v: number) => {
                const rr = radial(u, v);
                return c.cy + c.ry * rr * spow(Math.cos(v) * Math.sin(u), power);
            },
            z: (u: number, v: number) => {
                const rr = radial(u, v);
                return c.cz + c.rz * rr * spow(Math.sin(v), power);
            },
        },
        tooltip: {
            formatter: () => `
        <div style="min-width:230px">
          <div><b>${c.name}</b></div>
          <div>center: (${c.cx.toFixed(2)}, ${c.cy.toFixed(2)}, ${c.cz.toFixed(2)})</div>
          <div>r: (${c.rx.toFixed(2)}, ${c.ry.toFixed(2)}, ${c.rz.toFixed(2)})</div>
        </div>
      `,
        },
    };

    const equator: number[][] = [];
    const n = 120;
    for (let i = 0; i <= n; i++) {
        const u = (i / n) * Math.PI * 2 - Math.PI;
        const v = 0;
        const rr = radial(u, v);
        const x = c.cx + c.rx * rr * Math.cos(u);
        const y = c.cy + c.ry * rr * Math.sin(u);
        const z = c.cz + c.rz * rr * 0;
        equator.push([x, y, z, 0]);
    }

    const outline = {
        name: `${c.name} | outline`,
        type: 'line3D',
        data: equator,
        polyline: true,
        lineStyle: {width: 4, opacity: 0.95, color: c.color},
        silent: true,
        tooltip: {show: false},
    };

    return [surface, outline];
};
