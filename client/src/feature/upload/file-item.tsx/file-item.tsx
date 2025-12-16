import { FC } from 'react';
import cls from './file-item.module.scss';
import { File, Xmark } from '@gravity-ui/icons';
import { Button, Icon, Progress } from '@gravity-ui/uikit';

export interface FileItem {
    id: string;
    file: File;
    uploadProgress: number;
    status: 'uploading' | 'uploaded' | 'error';
    errorMessage?: string;
}

export const FileItem: FC<FileItemProps> = ({ file, onRemove, id }) => {
    const fileExtension = file.type.split('/')[1] || 'unknown';
    const fileSizeKB = (file.size / 1024).toFixed(2);

    return (
        <li className={cls.file}>
            <div className={cls.file__upload}>
                <div className={cls.file__info}>
                    <div className={cls.file__main}>
                        <File className={cls.file__icon} />
                        <span className={cls.file__name}>
                            {file.name}.{fileExtension}
                        </span>
                    </div>
                    <div className={cls.file__size}>{fileSizeKB} KB</div>
                </div>
                <Progress
                    className={cls.file__progress}
                    text="Loading"
                    theme="misc"
                    size="xs"
                    value={60}
                    loading={true}
                />
            </div>

            <Button
                className={cls.file__delete}
                onClick={() => onRemove(id)}
                onlyIcon
                pin="circle-circle"
                size="xs"
            >
                <Icon data={Xmark} size={18} />
            </Button>
        </li>
    );
};
