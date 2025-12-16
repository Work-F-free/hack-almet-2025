import {FC, PropsWithChildren, useCallback, useState} from 'react';
import {FileDropZone} from '@/components/ui/file-drop-zone.tsx';
import {UploadedFileList} from '../file-list.tsx';

export const FileUpload: FC<PropsWithChildren> = ({children}) => {
    const [isDropped, setIsDropped] = useState(false);
    const [files, setFiles] = useState<File[]>([]);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDropped(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDropped(false);
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDropped(false);

        const droppedFiles = Array.from(e.dataTransfer.files);

        const validFiles = droppedFiles.filter((file) => {
            return (
                file.type === 'text/csv' ||
                file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
                file.name.endsWith('.txt') ||
                file.name.endsWith('.las')
            );
        });

        setFiles((prevFiles) => [...prevFiles, ...validFiles]);
    }, []);

    const handleFileRemove = useCallback((index: number) => {
        setFiles((prevFiles) => {
            const newFiles = [...prevFiles];
            newFiles.splice(index, 1);
            return newFiles;
        });
    }, []);

    return (
        <>
            <FileDropZone
                isDropped={isDropped}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
            />
            {files.length > 0 && (
                <UploadedFileList
                    files={files.map((file, index) => ({
                        id: index,
                        name: file.name,
                        size: file.size,
                        type: file.type,
                        file: file,
                        uploadProgress: 0,
                        status: 'uploading' as const,
                    }))}
                    onFileRemove={handleFileRemove}
                />
            )}
            {children}
        </>
    );
};
