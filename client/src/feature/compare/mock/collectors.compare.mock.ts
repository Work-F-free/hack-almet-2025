import {CollectorRadial, WellPoint} from '@/feature/three-dimensional/utils/type';

const pickByMd = (pts: WellPoint[], mdTarget: number) => {
    let best = pts[0];
    let bestD = Infinity;
    for (const p of pts) {
        const d = Math.abs(p[3] - mdTarget);
        if (d < bestD) {
            bestD = d;
            best = p;
        }
    }
    return best;
};

export const makeSmallCollectorAt = (
    id: string,
    name: string,
    color: string,
    p: WellPoint,
): CollectorRadial => ({
    id,
    name,
    color,
    cx: p[0],
    cy: p[1],
    cz: p[2],
    rx: 3.2,
    ry: 3.2,
    rz: 3.2,
    lobeAmp: 0.12,
    lobeFreqU: 3,
    lobeFreqV: 2,
    power: 0.78,
});

export const makeCompareCollectors = (predPts: WellPoint[], realPts: WellPoint[]) => {
    const predPoint = pickByMd(predPts, 140);
    const realPoint = pickByMd(realPts, 140);

    return {
        predicted: [makeSmallCollectorAt('pred-col-1', 'Pred collector', '#4dabf7', predPoint)],
        real: [makeSmallCollectorAt('real-col-1', 'Real collector', '#69db7c', realPoint)],
    };
};
