import React, {useMemo} from 'react';
import ReactECharts from 'echarts-for-react';
import * as echarts from 'echarts';

import {buildXY, buildXZ, buildYZ} from '../utils/buildProjectionOptions';

import styles from './Projections.module.scss';
import {CollectorRadial, ViewPreset, Wells} from '../utils';

type Props = {
    wells: Wells;
    collectors: CollectorRadial[];
    onPick: (v: ViewPreset) => void;
};

export const Projections: React.FC<Props> = ({wells, collectors, onPick}) => {
    const xy = useMemo(() => buildXY(wells, collectors), [wells, collectors]);
    const xz = useMemo(() => buildXZ(wells, collectors), [wells, collectors]);
    const yz = useMemo(() => buildYZ(wells, collectors), [wells, collectors]);

    return (
        <div className={styles.wrap}>
            <div className={styles.item} onClick={() => onPick('xy')} role="button" tabIndex={0}>
                <div className={styles.title}>XY</div>
                <ReactECharts
                    echarts={echarts}
                    option={xy}
                    style={{height: 160, width: '100%'}}
                    notMerge
                />
            </div>

            <div className={styles.item} onClick={() => onPick('xz')} role="button" tabIndex={0}>
                <div className={styles.title}>XZ</div>
                <ReactECharts
                    echarts={echarts}
                    option={xz}
                    style={{height: 160, width: '100%'}}
                    notMerge
                />
            </div>

            <div className={styles.item} onClick={() => onPick('yz')} role="button" tabIndex={0}>
                <div className={styles.title}>YZ</div>
                <ReactECharts
                    echarts={echarts}
                    option={yz}
                    style={{height: 160, width: '100%'}}
                    notMerge
                />
            </div>
        </div>
    );
};
