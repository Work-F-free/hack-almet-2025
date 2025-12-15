import {FC, PropsWithChildren, useState} from 'react';
import {matchPath, useLocation, useNavigate} from 'react-router';
import {AsideHeader, AsideHeaderProps, MenuItem} from '@gravity-ui/navigation';
import {TerminalLine} from '@gravity-ui/icons';
import {AppMenuItem, menuItems} from '@/config/menu';

import cls from './layout.module.scss';
import {Paths} from '@/config/paths';

export const RootLayout: FC<PropsWithChildren> = ({children}) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [compact, setCompact] = useState(true);

    const convertToAsideMenuItem = (item: AppMenuItem): MenuItem => {
        const match = matchPath(item.path, location.pathname);
        const isActive =
            Boolean(match) || (location.pathname.startsWith(item.path) && item.path !== '/');

        return {
            id: item.id,
            title: item.title,
            icon: item.icon,
            current: isActive,
            onItemClick: () => {
                navigate(item.path);
            },
        };
    };

    const asidePropsData: AsideHeaderProps = {
        logo: {
            text: 'Работаем бесплатно',
            icon: TerminalLine,
            onClick: () => navigate(Paths.home.path),
        },

        renderContent: () => <div className={cls.rootLayout_wrapper}>{children}</div>,

        menuItems: menuItems.map(convertToAsideMenuItem),

        compact: compact,
        onChangeCompact: setCompact,
    };

    return <AsideHeader {...asidePropsData} />;
};
