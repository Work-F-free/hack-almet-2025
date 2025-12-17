import {FC, PropsWithChildren, useMemo} from 'react';
import {FileDropZone} from '@/components/ui/file-drop-zone.tsx';
import {UploadedFileList} from '../file-list.tsx';
import {useFileUpload} from '../../model/use-file-upload.js';
import {UploadStatusAlert} from '../upload-alert/upload-status-alert.js';
import cls from './file-upload.module.scss';
import {RadioGroup, RadioGroupOption} from '@gravity-ui/uikit';

export const FileUpload: FC<PropsWithChildren> = ({children}) => {
    const {
        isDropped,
        items,
        stats,
        setSelected,
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

    const options: RadioGroupOption[] = [
        {value: 'fact', content: 'Фактические данные'},
        {value: 'predict', content: 'Предсказанные данные'},
        {value: 'wellTrack', content: 'WellTrack'},
        {value: 'formationThickness', content: 'Толщина пласта'},
        {value: 'effectiveFormationThickness ', content: 'Эффективная толщина пласта'},
    ];

    return (
        <div className={cls.root}>
            <FileDropZone
                isDropped={isDropped}
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                onDrop={onDrop}
            />

            <RadioGroup
                onUpdate={(selected) => setSelected(selected)}
                name="datas"
                defaultValue={options[0].value}
                options={options}
                size="l"
            />

            {alertNode}

            <div className={cls.list}>
                {items.length > 0 && <UploadedFileList files={items} onFileRetry={retryFile} />}
            </div>

            {children}
        </div>
    );
};
