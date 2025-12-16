import React, {useMemo, useState} from 'react';
import ReactECharts from 'echarts-for-react';
import * as echarts from 'echarts';
import 'echarts-gl';

import {Card} from '@gravity-ui/uikit';

import {getRanges} from './utils/math';
import {build3dOption} from './utils/build3dOption';

import {Controls} from './components/Controls';
import {Projections} from './components/Projections';

import {CollectorMode, CollectorRadial, SliceMode, ViewPreset, Wells} from './utils/type';
import {wellsMock} from './mock/weels.mock';
import {collectorsMock} from './mock/collectors.mock';

import styles from './three-dimensional.module.scss';

type Props = {
    wells?: Wells;
    collectors?: CollectorRadial[];
    height?: number;
};

export const ThreeDimensional: React.FC<Props> = ({
    wells = wellsMock,
    collectors = collectorsMock,
    height = 640,
}) => {
    const wellNames = useMemo(() => Object.keys(wells), [wells]);
    const ranges = useMemo(() => getRanges(wells), [wells]);

    const [selectedWell, setSelectedWell] = useState<string | null>(null);

    const [collectorMode, setCollectorMode] = useState<CollectorMode>('blob');
    const [viewPreset, setViewPreset] = useState<ViewPreset>('3d');

    const [showCollectors, setShowCollectors] = useState(true);
    const [showSticks, setShowSticks] = useState(true);
    const [showHeads, setShowHeads] = useState(true);

    const [sliceEnabled, setSliceEnabled] = useState(false);
    const [sliceMode, setSliceMode] = useState<SliceMode>('z');
    const [sliceValue, setSliceValue] = useState<number>(ranges.zMin);

    const sliceMin = sliceMode === 'md' ? ranges.mdMin : ranges.zMin;
    const sliceMax = sliceMode === 'md' ? ranges.mdMax : ranges.zMax;

    React.useEffect(() => {
        if (sliceValue < sliceMin) setSliceValue(sliceMin);
        if (sliceValue > sliceMax) setSliceValue(sliceMax);
    }, [sliceMode, sliceMin, sliceMax]);

    const option = useMemo(() => {
        return build3dOption({
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
        });
    }, [
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
    ]);

    const onEvents = useMemo(() => {
        return {
            click: (params: any) => {
                const name = (params?.seriesName as string | undefined) ?? '';
                if (!name) return;

                const base = name.split(' | ')[0];
                if (wells[base]) setSelectedWell((prev) => (prev === base ? null : base));
            },
            dblclick: () => setSelectedWell(null),
        };
    }, [wells]);

    return (
        <div className={styles.root}>
            <Controls
                wellNames={wellNames}
                selectedWell={selectedWell}
                onWellChange={setSelectedWell}
                collectorMode={collectorMode}
                onCollectorModeChange={setCollectorMode}
                showCollectors={showCollectors}
                onShowCollectors={setShowCollectors}
                showSticks={showSticks}
                onShowSticks={setShowSticks}
                showHeads={showHeads}
                onShowHeads={setShowHeads}
                viewPreset={viewPreset}
                onViewPreset={setViewPreset}
                sliceEnabled={sliceEnabled}
                onSliceEnabled={setSliceEnabled}
                sliceMode={sliceMode}
                onSliceMode={setSliceMode}
                sliceValue={sliceValue}
                onSliceValue={setSliceValue}
                sliceMin={sliceMin}
                sliceMax={sliceMax}
            />

            <div className={styles.bottom}>
                <Card className={styles.chartCard}>
                    <ReactECharts
                        echarts={echarts}
                        option={option}
                        style={{height, width: '100%'}}
                        notMerge
                        lazyUpdate
                        onEvents={onEvents}
                    />
                </Card>

                <div className={styles.proj}>
                    <Projections wells={wells} collectors={collectors} onPick={setViewPreset} />
                </div>
            </div>
        </div>
    );
};
