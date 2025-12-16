import { FC } from 'react';
import { FileItem } from '../file-item.tsx';
import cls from './file-list.module.scss';

export interface UploadedFile {
    id: string;
    file: File;
    uploadProgress: number;
    status: 'uploading' | 'uploaded' | 'error';
    errorMessage?: string;
}

interface FileListProps {
    files: UploadedFile[];
    onFileRemove: (id: number) => void;
}

export const UploadedFileList: FC<FileListProps> = ({ files, onFileRemove }) => {
    return (
        <ul className={cls.file_list}>
            {files.map((fileItem) => (
                <FileItem 
                    key={fileItem.id} 
                    file={fileItem.file} 
                    onRemove={() => onFileRemove(parseInt(fileItem.id))} 
                    id={fileItem.id}
                    uploadProgress={fileItem.uploadProgress}
                    status={fileItem.status}
                    errorMessage={fileItem.errorMessage}
                />
            ))}
        </ul>
    );
};
