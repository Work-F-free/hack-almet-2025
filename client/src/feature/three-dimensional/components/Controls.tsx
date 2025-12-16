import React from 'react';
import {Card, Select, Slider, Switch, Text} from '@gravity-ui/uikit';
import {CollectorMode, SliceMode, ViewPreset} from '../utils/type';
import styles from './Controls.module.scss';

type Props = {
    wellNames: string[];
    selectedWell: string | null;
    onWellChange: (w: string | null) => void;

    collectorMode: CollectorMode;
    onCollectorModeChange: (m: CollectorMode) => void;

    showCollectors: boolean;
    onShowCollectors: (v: boolean) => void;

    showSticks: boolean;
    onShowSticks: (v: boolean) => void;

    showHeads: boolean;
    onShowHeads: (v: boolean) => void;

    viewPreset: ViewPreset;
    onViewPreset: (v: ViewPreset) => void;

    sliceEnabled: boolean;
    onSliceEnabled: (v: boolean) => void;

    sliceMode: SliceMode;
    onSliceMode: (v: SliceMode) => void;

    sliceValue: number;
    onSliceValue: (v: number) => void;

    sliceMin: number;
    sliceMax: number;
};

export const Controls: React.FC<Props> = ({
    wellNames,
    selectedWell,
    onWellChange,
    collectorMode,
    onCollectorModeChange,
    showCollectors,
    onShowCollectors,
    showSticks,
    onShowSticks,
    showHeads,
    onShowHeads,
    viewPreset,
    onViewPreset,
    sliceEnabled,
    onSliceEnabled,
    sliceMode,
    onSliceMode,
    sliceValue,
    onSliceValue,
    sliceMin,
    sliceMax,
}) => {
    const wellOptions = [
        {value: 'ALL', content: 'Все скважины'},
        ...wellNames.map((w) => ({value: w, content: w})),
    ];

    const collectorOptions = [
        {value: 'points', content: 'Коллектор: точки на скважине'},
        {value: 'blob', content: 'Коллектор: blob (объём)'},
    ];

    const viewOptions = [
        {value: '3d', content: '3D'},
        {value: 'xy', content: 'XY'},
        {value: 'xz', content: 'XZ'},
        {value: 'yz', content: 'YZ'},
    ];

    const sliceModeOptions = [
        {value: 'z', content: 'Срез по Z'},
        {value: 'md', content: 'Срез по MD'},
    ];

    const step = Math.max(1e-9, (sliceMax - sliceMin) / 250);

    return (
        <Card className={styles.card}>
            <div className={styles.row}>
                <div className={styles.col}>
                    <Text variant="subheader-2">Скважина</Text>
                    <Select
                        width="max"
                        options={wellOptions}
                        value={[selectedWell ?? 'ALL']}
                        onUpdate={(v) => {
                            const next = v?.[0];
                            onWellChange(!next || next === 'ALL' ? null : next);
                        }}
                    />
                </div>

                <div className={styles.col}>
                    <Text variant="subheader-2">Режим</Text>
                    <Select
                        width="max"
                        options={collectorOptions}
                        value={[collectorMode]}
                        onUpdate={(v) =>
                            onCollectorModeChange(((v?.[0] as any) ?? 'blob') as CollectorMode)
                        }
                    />
                </div>

                <div className={styles.col}>
                    <Text variant="subheader-2">Вид</Text>
                    <Select
                        width="max"
                        options={viewOptions}
                        value={[viewPreset]}
                        onUpdate={(v) => onViewPreset(((v?.[0] as any) ?? '3d') as ViewPreset)}
                    />
                </div>

                <div className={styles.switches}>
                    <Switch
                        checked={showCollectors}
                        onUpdate={onShowCollectors}
                        content="Коллектор"
                    />
                    <Switch checked={showSticks} onUpdate={onShowSticks} content="Вертикаль" />
                    <Switch checked={showHeads} onUpdate={onShowHeads} content="Устье/забой" />
                </div>
            </div>

            <div className={styles.slice}>
                <Switch checked={sliceEnabled} onUpdate={onSliceEnabled} content="Срез (slice)" />

                <div className={styles.sliceMode}>
                    <Select
                        width="max"
                        options={sliceModeOptions}
                        value={[sliceMode]}
                        onUpdate={(v) => onSliceMode(((v?.[0] as any) ?? 'z') as SliceMode)}
                    />
                </div>

                <div className={styles.sliderWrap}>
                    <Slider
                        disabled={!sliceEnabled}
                        min={sliceMin}
                        max={sliceMax}
                        step={step}
                        marks={5}
                        tooltipDisplay="auto"
                        value={sliceValue}
                        onUpdate={(v) => onSliceValue(Array.isArray(v) ? v[0] : v)}
                    />
                    <div className={styles.sliderMeta}>
                        <Text color="secondary">
                            {sliceMode.toUpperCase()}: {sliceValue.toFixed(2)}
                        </Text>
                    </div>
                </div>
            </div>

            <div className={styles.hint}>
                <Text color="secondary">
                    Клик по скважине — выделить. Даблклик — сброс. Клик по проекциям — камера.
                </Text>
            </div>
        </Card>
    );
};
