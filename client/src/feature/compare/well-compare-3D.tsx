import React, {useEffect, useMemo, useRef, useState} from 'react';
import ReactECharts from 'echarts-for-react';
import * as echarts from 'echarts';
import 'echarts-gl';

// eslint-disable-next-line @typescript-eslint/no-redeclare
import {Button, Card, Select, Slider, Switch, Text} from '@gravity-ui/uikit';

import {predictedWellsMock, realWellsMock} from './mock/compare.mock';
import {makeCompareCollectors} from './mock/collectors.compare.mock';
import {useOrbitSync} from './hooks/useOrbitSync';

import type {
    CameraState,
    CollectorMode,
    CollectorRadial,
    SliceMode,
    Wells,
} from '../three-dimensional/utils/type';

import {getRangesWithCollectors, mergeRanges} from '../three-dimensional/utils/math';
import {build3dOption} from '../three-dimensional/utils/build3dOption';

import styles from './well-compare-3D.module.scss';

type ViewKey = '3d' | 'xy' | 'xz' | 'yz';

const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));

const presetCamera = (preset: ViewKey, cur: CameraState): CameraState => {
    switch (preset) {
        case 'xy':
            return {...cur, alpha: 90, beta: 0};
        case 'xz':
            return {...cur, alpha: 0.1, beta: 0};
        case 'yz':
            return {...cur, alpha: 0.1, beta: 90};
        default:
            return {...cur, alpha: 35, beta: 25};
    }
};

const fitDistance = (ranges: {
    xMin: number;
    xMax: number;
    yMin: number;
    yMax: number;
    zMin: number;
    zMax: number;
}) => {
    const sx = ranges.xMax - ranges.xMin;
    const sy = ranges.yMax - ranges.yMin;
    const sz = ranges.zMax - ranges.zMin;
    const size = Math.max(sx, sy, sz);
    return clamp(size * 1.35, 120, 900);
};

type Props = {
    predictedWells?: Wells;
    realWells?: Wells;
};

export const WellCompare3D: React.FC<Props> = ({
    predictedWells = predictedWellsMock,
    realWells = realWellsMock,
}) => {
    const {camera, setCamera, bind, reset} = useOrbitSync();

    const predKeys = useMemo(() => Object.keys(predictedWells), [predictedWells]);
    const realKeys = useMemo(() => Object.keys(realWells), [realWells]);

    const [leftWellId, setLeftWellId] = useState<string>(predKeys[0] ?? '');
    const [rightWellId, setRightWellId] = useState<string>(realKeys[0] ?? '');

    const [view, setView] = useState<ViewKey>('3d');

    useEffect(() => {
        if (predKeys.length && !predictedWells[leftWellId]) setLeftWellId(predKeys[0]);
        if (realKeys.length && !realWells[rightWellId]) setRightWellId(realKeys[0]);
    }, [predKeys.join('|'), realKeys.join('|')]);

    const leftPts = predictedWells[leftWellId] ?? [];
    const rightPts = realWells[rightWellId] ?? [];

    const compareCollectors = useMemo(
        () => makeCompareCollectors(leftPts, rightPts),
        [leftPts, rightPts],
    );

    const [collectorMode, setCollectorMode] = useState<CollectorMode>('points');
    const [showCollectors, setShowCollectors] = useState(true);
    const [showSticks, setShowSticks] = useState(true);
    const [showHeads, setShowHeads] = useState(true);

    const [sliceEnabled, setSliceEnabled] = useState(false);
    const [sliceMode, setSliceMode] = useState<SliceMode>('z');
    const [sliceValue, setSliceValue] = useState<number>(0);

    const leftWellsOne: Wells = useMemo(
        () => (leftWellId ? {[leftWellId]: leftPts} : {}),
        [leftWellId, leftPts],
    );
    const rightWellsOne: Wells = useMemo(
        () => (rightWellId ? {[rightWellId]: rightPts} : {}),
        [rightWellId, rightPts],
    );

    const sharedRanges = useMemo(() => {
        const l = getRangesWithCollectors(
            leftWellsOne,
            compareCollectors.predicted as CollectorRadial[],
        );
        const r = getRangesWithCollectors(
            rightWellsOne,
            compareCollectors.real as CollectorRadial[],
        );
        return mergeRanges(l, r);
    }, [leftWellsOne, rightWellsOne, compareCollectors]);

    useEffect(() => {
        const min = sliceMode === 'md' ? sharedRanges.mdMin : sharedRanges.zMin;
        const max = sliceMode === 'md' ? sharedRanges.mdMax : sharedRanges.zMax;
        setSliceValue((v) => clamp(v, min, max));
    }, [sliceMode, sharedRanges.mdMin, sharedRanges.mdMax, sharedRanges.zMin, sharedRanges.zMax]);

    const leftRef = useRef<ReactECharts | null>(null);
    const rightRef = useRef<ReactECharts | null>(null);

    const leftOption = useMemo(() => {
        return build3dOption({
            wells: leftWellsOne,
            collectors: compareCollectors.predicted as CollectorRadial[],
            collectorMode,
            selectedWell: null,
            showSticks,
            showHeads,
            showCollectors,
            sliceEnabled,
            sliceMode,
            sliceValue,
            viewPreset: '3d',
            disableInternalControls: true,
            effects: false,
            rangesOverride: sharedRanges,
        } as any);
    }, [
        leftWellsOne,
        compareCollectors.predicted,
        collectorMode,
        showSticks,
        showHeads,
        showCollectors,
        sliceEnabled,
        sliceMode,
        sliceValue,
        sharedRanges,
    ]);

    const rightOption = useMemo(() => {
        return build3dOption({
            wells: rightWellsOne,
            collectors: compareCollectors.real as CollectorRadial[],
            collectorMode,
            selectedWell: null,
            showSticks,
            showHeads,
            showCollectors,
            sliceEnabled,
            sliceMode,
            sliceValue,
            viewPreset: '3d',
            disableInternalControls: true,
            effects: false,
            rangesOverride: sharedRanges,
        } as any);
    }, [
        rightWellsOne,
        compareCollectors.real,
        collectorMode,
        showSticks,
        showHeads,
        showCollectors,
        sliceEnabled,
        sliceMode,
        sliceValue,
        sharedRanges,
    ]);

    useEffect(() => {
        const payload = {
            grid3D: {
                viewControl: {
                    alpha: camera.alpha,
                    beta: camera.beta,
                    distance: camera.distance,
                },
            },
        };

        leftRef.current
            ?.getEchartsInstance?.()
            ?.setOption(payload, {notMerge: false, lazyUpdate: true});
        rightRef.current
            ?.getEchartsInstance?.()
            ?.setOption(payload, {notMerge: false, lazyUpdate: true});
    }, [camera]);

    const predOptions = useMemo(() => predKeys.map((k) => ({value: k, content: k})), [predKeys]);
    const realOptions = useMemo(() => realKeys.map((k) => ({value: k, content: k})), [realKeys]);

    const viewOptions = useMemo(
        () => [
            {value: '3d', content: '3D'},
            {value: 'xy', content: 'XY (вид сверху)'},
            {value: 'xz', content: 'XZ'},
            {value: 'yz', content: 'YZ'},
        ],
        [],
    );

    const onViewUpdate = (v?: string[]) => {
        const next = (v?.[0] ?? '3d') as ViewKey;
        setView(next);
        setCamera((prev) => presetCamera(next, prev));
    };

    const onFit = () => setCamera({distance: fitDistance(sharedRanges)});

    const sliceMin = sliceMode === 'md' ? sharedRanges.mdMin : sharedRanges.zMin;
    const sliceMax = sliceMode === 'md' ? sharedRanges.mdMax : sharedRanges.zMax;
    const sliceStep = Math.max(1e-9, (sliceMax - sliceMin) / 220);

    return (
        <div className={styles.root}>
            <Card className={styles.controlsCard}>
                <div className={styles.controlsGrid}>
                    <div className={styles.rowTop}>
                        <div className={styles.field}>
                            <Text variant="subheader-2">Слева (прогноз)</Text>
                            <Select
                                width="max"
                                options={predOptions}
                                value={[leftWellId]}
                                onUpdate={(v) => setLeftWellId(v?.[0] ?? '')}
                            />
                        </div>

                        <div className={styles.field}>
                            <Text variant="subheader-2">Справа (факт)</Text>
                            <Select
                                width="max"
                                options={realOptions}
                                value={[rightWellId]}
                                onUpdate={(v) => setRightWellId(v?.[0] ?? '')}
                            />
                        </div>

                        <div className={styles.actions}>
                            <Button view="outlined" onClick={reset}>
                                Reset
                            </Button>
                            <Button view="outlined" onClick={onFit}>
                                Fit
                            </Button>
                        </div>
                    </div>

                    <div className={styles.rowBottom}>
                        <div className={styles.viewGroup}>
                            <Text color="secondary">View:</Text>
                            <Select
                                width={220}
                                options={viewOptions}
                                value={[view]}
                                onUpdate={onViewUpdate}
                            />
                        </div>

                        <div className={styles.sep} />

                        <Select
                            width={220}
                            options={[
                                {value: 'points', content: 'Коллектор: точки'},
                                {value: 'blob', content: 'Коллектор: blob'},
                            ]}
                            value={[collectorMode]}
                            onUpdate={(v) =>
                                setCollectorMode(((v?.[0] as any) ?? 'points') as CollectorMode)
                            }
                        />

                        <Switch
                            checked={showCollectors}
                            onUpdate={setShowCollectors}
                            content="Коллекторы"
                        />
                        <Switch checked={showSticks} onUpdate={setShowSticks} content="Вертикаль" />
                        <Switch checked={showHeads} onUpdate={setShowHeads} content="Устье/забой" />

                        <div className={styles.sep} />

                        <div className={styles.sliceBlock}>
                            <Switch
                                checked={sliceEnabled}
                                onUpdate={setSliceEnabled}
                                content="Slice"
                            />

                            <Select
                                width={160}
                                options={[
                                    {value: 'z', content: 'Z'},
                                    {value: 'md', content: 'MD'},
                                ]}
                                value={[sliceMode]}
                                onUpdate={(v) =>
                                    setSliceMode(((v?.[0] as any) ?? 'z') as SliceMode)
                                }
                            />

                            <div className={styles.sliderWrap}>
                                <Slider
                                    min={sliceMin}
                                    max={sliceMax}
                                    step={sliceStep}
                                    value={sliceValue}
                                    onUpdate={(v) => {
                                        if (typeof v === 'number') setSliceValue(v);
                                    }}
                                    disabled={!sliceEnabled}
                                    tooltipDisplay="auto"
                                    marks={0}
                                    size="m"
                                />
                            </div>

                            <Text color="secondary" style={{whiteSpace: 'nowrap'}}>
                                {sliceValue.toFixed(2)}
                            </Text>
                        </div>

                        <Text color="secondary">Drag/Wheel — синхронно</Text>
                    </div>
                </div>
            </Card>

            <div className={styles.grid}>
                <div className={styles.panel}>
                    <div className={styles.panelHeader}>
                        <Text variant="subheader-2">Прогноз</Text>
                        <Text color="secondary">{leftWellId}</Text>
                    </div>

                    <Card className={styles.chartCard}>
                        <div className={styles.chartHost} {...bind}>
                            <ReactECharts
                                ref={leftRef as any}
                                echarts={echarts}
                                option={leftOption}
                                style={{height: '100%', width: '100%'}}
                                notMerge
                                lazyUpdate
                            />
                        </div>
                    </Card>
                </div>

                <div className={styles.panel}>
                    <div className={styles.panelHeader}>
                        <Text variant="subheader-2">Факт</Text>
                        <Text color="secondary">{rightWellId}</Text>
                    </div>

                    <Card className={styles.chartCard}>
                        <div className={styles.chartHost} {...bind}>
                            <ReactECharts
                                ref={rightRef as any}
                                echarts={echarts}
                                option={rightOption}
                                style={{height: '100%', width: '100%'}}
                                notMerge
                                lazyUpdate
                            />
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};
