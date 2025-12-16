import {FC, PropsWithChildren, useMemo} from 'react';
import {FileDropZone} from '@/components/ui/file-drop-zone.tsx';
import {UploadedFileList} from '../file-list.tsx';
import {useFileUpload} from '../../model/use-file-upload.js';
import {UploadStatusAlert} from '../upload-alert/upload-status-alert.js';
import cls from './file-upload.module.scss';
import {Switch} from '@gravity-ui/uikit';

export const FileUpload: FC<PropsWithChildren> = ({children}) => {
    const {
        isDropped,
        isPredicted,
        items,
        stats,
        setIsPredicted,
        onDragOver,
        onDragLeave,
        onDrop,
        retryFile,
        retryAllErrors,
    } = useFileUpload(3);
    const alertNode = useMemo(
        () => (
            <UploadStatusAlert
                total={stats.total}
                allDoneOk={stats.allDoneOk}
                uploaded={stats.uploaded}
                error={stats.error}
                uploading={stats.uploading}
                onRetryAllErrors={retryAllErrors}
            />
        ),
        [stats, retryAllErrors],
    );

    return (
        <div className={cls.root}>
            <FileDropZone
                isDropped={isDropped}
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                onDrop={onDrop}
            />

            <Switch onUpdate={(checked) => setIsPredicted(checked)} checked={isPredicted}>
                Предсказанные данные
            </Switch>

            {alertNode}

            <div className={cls.list}>
                {items.length > 0 && <UploadedFileList files={items} onFileRetry={retryFile} />}
            </div>

            {children}
        </div>
    );
};
