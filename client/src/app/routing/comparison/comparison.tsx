import {RootLayout} from '@/components/layout';
import {WellCompare3D} from '@/feature/compare';

import cls from './comparison.module.scss';

const ComparisonRoute = () => {
    return (
        <RootLayout>
            <div className={cls.page}>
                <WellCompare3D />
            </div>
        </RootLayout>
    );
};

export default ComparisonRoute;
