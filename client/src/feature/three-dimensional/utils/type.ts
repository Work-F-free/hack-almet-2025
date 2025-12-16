export type WellPoint = [number, number, number, number];
export type Wells = Record<string, WellPoint[]>;

export type CollectorRadial = {
    id: string;
    name: string;
    color: string;

    cx: number;
    cy: number;
    cz: number;
    rx: number;
    ry: number;
    rz: number;

    lobeAmp?: number; // 0..0.45
    lobeFreqU?: number; // 1..6
    lobeFreqV?: number; // 1..6

    power?: number; // 0.45..1.0
};

export type CollectorMode = 'points' | 'blob';
export type SliceMode = 'z' | 'md';
export type ViewPreset = '3d' | 'xy' | 'xz' | 'yz';

export type Ranges = {
    xMin: number;
    xMax: number;
    yMin: number;
    yMax: number;
    zMin: number;
    zMax: number;
    mdMin: number;
    mdMax: number;
};
