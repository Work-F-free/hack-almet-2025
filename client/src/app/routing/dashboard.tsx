import {useToaster} from '@gravity-ui/uikit';
import {useEffect} from 'react';

import {RootLayout} from '@/components/layout';

const DashboardRoute = () => {
    const {add} = useToaster();

    useEffect(() => {
        add({
            title: 'test',
            name: 'test',
        });
    }, []);

    return <RootLayout>DashboardRoute</RootLayout>;
};

export default DashboardRoute;
