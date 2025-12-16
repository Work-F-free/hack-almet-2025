import { FC, PropsWithChildren, useCallback, useState } from 'react';
import cls from './file-drop-zone.module.scss';
import { CloudArrowUpIn, File, Xmark } from '@gravity-ui/icons';
import { Button, FilePreview, Icon, Progress } from '@gravity-ui/uikit';

interface FileDropZoneProps {
    isDropped: boolean;
    onDragOver: (e: React.DragEvent) => void;
    onDragLeave: (e: React.DragEvent) => void;
    onDrop: (e: React.DragEvent) => void;
}

export const FileDropZone: FC<FileDropZoneProps> = ({
    isDropped,
    onDragOver,
    onDragLeave,
    onDrop,
}) => {
    return (
        <div
            className={`${cls.drop_zone} ${isDropped ? cls.dropped : ''}`}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
        >
            <>
                <div className={cls.title}>
                    <CloudArrowUpIn width={20} height={20} />
                    <label>Перетащите или загрузите файлы</label>
                </div>
                <span className={cls.description}>Доступные форматы: txt, las</span>
            </>
        </div>
    );
};
