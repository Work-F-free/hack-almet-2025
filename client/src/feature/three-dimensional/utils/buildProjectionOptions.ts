import type * as echartsType from 'echarts';

import {getRanges, makeEllipsePolyline} from './math';
import {CollectorRadial, Wells} from './type';

const base2d = () => ({
    animation: false,
    tooltip: {trigger: 'axis'},
    grid: {left: 34, right: 10, top: 14, bottom: 26},
    xAxis: {
        type: 'value',
        axisLabel: {color: '#374151'},
        splitLine: {lineStyle: {color: 'rgba(17,24,39,0.08)'}},
    },
    yAxis: {
        type: 'value',
        axisLabel: {color: '#374151'},
        splitLine: {lineStyle: {color: 'rgba(17,24,39,0.08)'}},
    },
});

export const buildXY = (wells: Wells, collectors: CollectorRadial[]) => {
    const r = getRanges(wells);

    const series: any[] = [];

    for (const [name, pts] of Object.entries(wells)) {
        series.push({
            name,
            type: 'line',
            showSymbol: false,
            data: pts.map((p) => [p[0], p[1]]),
            lineStyle: {width: 1.5, opacity: 0.9},
        });
    }

    for (const c of collectors) {
        const poly = makeEllipsePolyline(c.cx, c.cy, c.rx, c.ry, 90);
        series.push({
            name: c.name,
            type: 'line',
            showSymbol: false,
            data: poly,
            lineStyle: {width: 2.5, opacity: 0.95, color: c.color},
        });
    }

    return {
        ...base2d(),
        xAxis: {...base2d().xAxis, min: r.xMin, max: r.xMax, name: 'X'},
        yAxis: {...base2d().yAxis, min: r.yMin, max: r.yMax, name: 'Y'},
        series,
    } as echartsType.EChartsOption;
};

export const buildXZ = (wells: Wells, collectors: CollectorRadial[]) => {
    const r = getRanges(wells);
    const series: any[] = [];

    for (const [name, pts] of Object.entries(wells)) {
        series.push({
            name,
            type: 'line',
            showSymbol: false,
            data: pts.map((p) => [p[0], p[2]]),
            lineStyle: {width: 1.5, opacity: 0.9},
        });
    }

    for (const c of collectors) {
        const poly = makeEllipsePolyline(c.cx, c.cz, c.rx, c.rz, 90);
        series.push({
            name: c.name,
            type: 'line',
            showSymbol: false,
            data: poly,
            lineStyle: {width: 2.5, opacity: 0.95, color: c.color},
        });
    }

    return {
        ...base2d(),
        xAxis: {...base2d().xAxis, min: r.xMin, max: r.xMax, name: 'X'},
        yAxis: {...base2d().yAxis, min: r.zMin, max: r.zMax, name: 'Z'},
        series,
    } as echartsType.EChartsOption;
};

export const buildYZ = (wells: Wells, collectors: CollectorRadial[]) => {
    const r = getRanges(wells);
    const series: any[] = [];

    for (const [name, pts] of Object.entries(wells)) {
        series.push({
            name,
            type: 'line',
            showSymbol: false,
            data: pts.map((p) => [p[1], p[2]]),
            lineStyle: {width: 1.5, opacity: 0.9},
        });
    }

    for (const c of collectors) {
        const poly = makeEllipsePolyline(c.cy, c.cz, c.ry, c.rz, 90);
        series.push({
            name: c.name,
            type: 'line',
            showSymbol: false,
            data: poly,
            lineStyle: {width: 2.5, opacity: 0.95, color: c.color},
        });
    }

    return {
        ...base2d(),
        xAxis: {...base2d().xAxis, min: r.yMin, max: r.yMax, name: 'Y'},
        yAxis: {...base2d().yAxis, min: r.zMin, max: r.zMax, name: 'Z'},
        series,
    } as echartsType.EChartsOption;
};
