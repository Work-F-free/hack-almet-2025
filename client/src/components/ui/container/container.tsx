import {FC, PropsWithChildren} from 'react';
import cls from './container.module.scss';

type ContainerProps = PropsWithChildren<{
    className?: string;
    size?: 's' | 'm' | 'l';
}>;

export const Container: FC<ContainerProps> = ({className, size = 'm', children}) => {
    const classes = [cls.container, cls[`container_size_${size}`], className]
        .filter(Boolean)
        .join(' ');

    return <div className={classes}>{children}</div>;
};
