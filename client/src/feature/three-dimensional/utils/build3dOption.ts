import type * as echartsType from 'echarts';
import 'echarts-gl';

import {CollectorMode, CollectorRadial, SliceMode, ViewPreset, Wells} from './type';
import {getRanges} from './math';
import {isInsideCollector, makeCollectorBlobSeries, slicePoints, splitRuns} from './collectors';

type Params = {
    wells: Wells;
    collectors: CollectorRadial[];
    collectorMode: CollectorMode;

    selectedWell: string | null;

    showSticks: boolean;
    showHeads: boolean;
    showCollectors: boolean;

    sliceEnabled: boolean;
    sliceMode: SliceMode;
    sliceValue: number;

    viewPreset: ViewPreset;
};

const viewAngles = (preset: ViewPreset) => {
    switch (preset) {
        case 'xy':
            return {alpha: 90, beta: 0};
        case 'xz':
            return {alpha: 0, beta: 0};
        case 'yz':
            return {alpha: 0, beta: 90};
        default:
            return {alpha: 35, beta: 25};
    }
};

export const build3dOption = ({
    wells,
    collectors,
    collectorMode,
    selectedWell,
    showSticks,
    showHeads,
    showCollectors,
    sliceEnabled,
    sliceMode,
    sliceValue,
    viewPreset,
}: Params): echartsType.EChartsOption => {
    const names = Object.keys(wells);
    const r = getRanges(wells);

    const legendSelected: Record<string, boolean> = {};
    for (const n of names) legendSelected[n] = selectedWell ? n === selectedWell : true;

    const series: any[] = [];
    const wellSeriesIndices: number[] = []; // ✅ только на эти серии будет visualMap

    // slice plane (Z)
    if (sliceEnabled && sliceMode === 'z') {
        series.push({
            name: 'Slice plane',
            type: 'surface',
            silent: true,
            shading: 'lambert',
            wireframe: {show: false},
            itemStyle: {opacity: 0.08, color: '#111827'},
            parametric: true,
            parametricEquation: {
                u: {min: 0, max: 1, step: 0.1},
                v: {min: 0, max: 1, step: 0.1},
                x: (u: number) => r.xMin + u * (r.xMax - r.xMin),
                y: (_u: number, v: number) => r.yMin + v * (r.yMax - r.yMin),
                z: () => sliceValue,
            },
            tooltip: {show: false},
        });
    }

    // collectors (blob)
    if (showCollectors && collectorMode === 'blob') {
        for (const c of collectors) series.push(...makeCollectorBlobSeries(c));
    }

    // wells (+ points mode hits)
    for (const name of names) {
        const rawPts = wells[name];
        if (!rawPts?.length) continue;

        const pts = slicePoints(rawPts, sliceEnabled, sliceMode, sliceValue);

        // main well line
        const idx = series.length;
        series.push({
            name,
            type: 'line3D',
            data: pts,
            polyline: true,
            lineStyle: {width: 4, opacity: 0.95},
            emphasis: {lineStyle: {width: 7, opacity: 1}},
        });
        wellSeriesIndices.push(idx);

        if (showSticks && pts.length) {
            const [x0, y0] = pts[0];
            const localMinZ = Math.min(...pts.map((p) => p[2]));
            const localMaxZ = Math.max(...pts.map((p) => p[2]));
            series.push({
                name: `${name} | stick`,
                type: 'line3D',
                data: [
                    [x0, y0, localMaxZ, pts[0][3]],
                    [x0, y0, localMinZ, pts[pts.length - 1][3]],
                ],
                polyline: true,
                lineStyle: {width: 6, opacity: 0.95, color: '#2563eb'},
                silent: true,
                tooltip: {show: false},
            });
        }

        if (showHeads && pts.length) {
            series.push({
                name: `${name} | points`,
                type: 'scatter3D',
                data: [pts[0], pts[pts.length - 1]],
                symbolSize: 10,
                itemStyle: {opacity: 0.95},
            });
        }

        // points mode: intervals + hits
        if (showCollectors && collectorMode === 'points') {
            const visible = !selectedWell || selectedWell === name;
            if (visible) {
                for (const c of collectors) {
                    const runs = splitRuns(pts, (p) => isInsideCollector(p, c));
                    for (const run of runs) {
                        series.push({
                            name: `${c.name} | ${name} | interval`,
                            type: 'line3D',
                            data: run,
                            polyline: true,
                            lineStyle: {width: 10, opacity: 0.7, color: c.color},
                            silent: false,
                        });

                        series.push({
                            name: `${c.name} | ${name} | hits`,
                            type: 'scatter3D',
                            data: run,
                            symbolSize: 5,
                            itemStyle: {opacity: 0.95, color: c.color},
                            silent: true,
                            tooltip: {show: false},
                        });
                    }
                }
            }
        }
    }

    const {alpha, beta} = viewAngles(viewPreset);

    return {
        backgroundColor: '#ffffff',
        animation: false,
        legend: {
            type: 'scroll',
            top: 8,
            textStyle: {color: '#1f2937'},
            selected: legendSelected,
            data: names,
        },
        tooltip: {
            trigger: 'item',
            backgroundColor: 'rgba(255,255,255,0.97)',
            borderColor: 'rgba(17,24,39,0.15)',
            textStyle: {color: '#111827'},
        },

        // ✅ visualMap только на линии скважин, коллекторы не перекрашиваются
        visualMap: {
            show: true,
            type: 'continuous',
            dimension: 3, // md
            seriesIndex: wellSeriesIndices,
            min: r.mdMin,
            max: r.mdMax,
            calculable: true,
            textStyle: {color: '#111827'},
            inRange: {color: ['#1c7ed6', '#37b24d', '#f59f00', '#f03e3e']},
            left: 10,
            bottom: 10,
        },

        xAxis3D: {type: 'value', min: r.xMin, max: r.xMax, name: 'X'},
        yAxis3D: {type: 'value', min: r.yMin, max: r.yMax, name: 'Y'},
        zAxis3D: {type: 'value', min: r.zMin, max: r.zMax, name: 'Z'},

        grid3D: {
            boxWidth: 180,
            boxDepth: 180,
            environment: '#ffffff',
            axisPointer: {show: true, lineStyle: {color: 'rgba(17,24,39,0.25)'}},
            viewControl: {
                projection: 'perspective',
                autoRotate: false,
                damping: 0.92,
                rotateSensitivity: 1.1,
                zoomSensitivity: 1.2,
                panSensitivity: 0.9,
                distance: 250,
                alpha,
                beta,
            },
            light: {
                main: {intensity: 1.1, shadow: true, shadowQuality: 'medium'},
                ambient: {intensity: 0.55},
            },
            postEffect: {
                enable: true,
                FXAA: {enable: true},
                SSAO: {enable: true, intensity: 0.7, radius: 3, quality: 'medium'},
            },
            temporalSuperSampling: {enable: true},
        },

        series,
    };
};
