import {Card} from '@gravity-ui/uikit';
import {RootLayout} from '@/components/layout';
import {ThreeDimensional} from '@/feature/three-dimensional';

import cls from './dashboard.module.scss';

const DashboardRoute = () => {
    return (
        <RootLayout>
            <Card className={cls.dashboard}>
                <div className={cls.content}>
                    <ThreeDimensional />
                </div>
            </Card>
        </RootLayout>
    );
};

export default DashboardRoute;
