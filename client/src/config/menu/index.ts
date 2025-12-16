import {MenuItem} from '@gravity-ui/navigation';
import {ChartAreaStacked, CloudArrowUpIn, House} from '@gravity-ui/icons';
import {Paths} from '../paths';

export type AppMenuItem = MenuItem & {
    path: string;
};

export const menuItems: Array<AppMenuItem> = [
    {
        id: 'home',
        title: 'Главная',
        icon: House,
        path: Paths.home.path,
    },
    {
        id: 'dashboard',
        title: 'Дашборды',
        icon: ChartAreaStacked,
        path: Paths.dashboard.path,
    },
    {
        id: 'upload',
        title: 'Загрузка',
        icon: CloudArrowUpIn,
        path: Paths.upload.path,
    },
];
