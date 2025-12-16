import {FC} from 'react';
import cls from './file-item.module.scss';
import {ArrowRotateRight, File as FileIcon} from '@gravity-ui/icons';
import {Button, Icon, Progress} from '@gravity-ui/uikit';
import {UploadStatus} from '../../model/upload-queue';

interface FileItemProps {
    id: string;
    file: File;
    uploadProgress: number;
    status: UploadStatus;
    errorMessage?: string;
    onRetry: (id: string) => void;
}

export const FileItem: FC<FileItemProps> = ({
    id,
    file,
    uploadProgress,
    status,
    errorMessage,
    onRetry,
}) => {
    const fileSizeKB = (file.size / 1024).toFixed(0);

    const text =
        status === 'uploading'
            ? 'Loading'
            : status === 'uploaded'
              ? 'Uploaded'
              : status === 'error'
                ? errorMessage ?? 'Error'
                : 'Queued';

    return (
        <li className={cls.file}>
            <div className={cls.file__upload}>
                <div className={cls.file__info}>
                    <div className={cls.file__main}>
                        <FileIcon className={cls.file__icon} />
                        <span className={cls.file__name}>{file.name}</span>
                    </div>
                    <div className={cls.file__size}>{fileSizeKB} KB</div>
                </div>

                <Progress
                    className={cls.file__progress}
                    text={text}
                    theme={status === 'uploaded' ? 'success' : 'misc'}
                    size="xs"
                    value={
                        status === 'uploading'
                            ? uploadProgress
                            : status === 'uploaded'
                              ? 100
                              : uploadProgress
                    }
                    loading={status === 'uploading'}
                />
            </div>

            {status === 'error' ? (
                <Button
                    onClick={() => onRetry(id)}
                    onlyIcon
                    pin="circle-circle"
                    size="xs"
                    view="flat"
                >
                    <Icon data={ArrowRotateRight} size={18} />
                </Button>
            ) : (
                <></>
            )}
        </li>
    );
};
