import {FC} from 'react';
import {FileItem} from '../file-item.tsx';
import cls from './file-list.module.scss';
import {UploadItem} from '../../model/upload-queue.js';

interface FileListProps {
    files: UploadItem[];
    onFileRetry: (id: string) => void;
}

export const UploadedFileList: FC<FileListProps> = ({files, onFileRetry}) => {
    return (
        <ul className={cls.file_list}>
            {files.map((fileItem) => (
                <FileItem
                    key={fileItem.id}
                    id={fileItem.id}
                    file={fileItem.file}
                    uploadProgress={fileItem.uploadProgress}
                    status={fileItem.status}
                    errorMessage={fileItem.errorMessage}
                    onRetry={onFileRetry}
                />
            ))}
        </ul>
    );
};
