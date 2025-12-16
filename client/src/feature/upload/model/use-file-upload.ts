import {useCallback, useMemo, useState} from 'react';
import {UploadItem, useUploadQueue} from './upload-queue';

const isValid = (file: File) =>
    file.type === 'text/csv' ||
    file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
    file.name.endsWith('.txt') ||
    file.name.endsWith('.las');

const makeId = () =>
    crypto?.randomUUID ? crypto.randomUUID() : String(Date.now() + Math.random());

export const useFileUpload = (concurrency = 3) => {
    const [isDropped, setIsDropped] = useState(false);
    const [items, setItems] = useState<UploadItem[]>([]);

    const {markRemoved} = useUploadQueue(items, setItems, concurrency);

    const onDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDropped(true);
    }, []);

    const onDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDropped(false);
    }, []);

    const onDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDropped(false);

        const droppedFiles = Array.from(e.dataTransfer.files);
        const validFiles = droppedFiles.filter(isValid);

        const newItems: UploadItem[] = validFiles.map((file) => ({
            id: makeId(),
            file,
            uploadProgress: 0,
            status: 'queued',
        }));

        setItems((prev) => [...prev, ...newItems]);
    }, []);

    const removeFile = useCallback(
        (id: string) => {
            markRemoved(id);
            setItems((prev) => prev.filter((it) => it.id !== id));
        },
        [markRemoved],
    );

    const retryFile = useCallback((id: string) => {
        setItems((prev) => {
            const idx = prev.findIndex((it) => it.id === id);
            if (idx === -1) return prev;

            const item = prev[idx];
            if (item.status !== 'error') return prev;

            const rest = prev.filter((it) => it.id !== id);
            return [
                ...rest,
                {
                    ...item,
                    status: 'queued',
                    uploadProgress: 0,
                    errorMessage: undefined,
                },
            ];
        });
    }, []);

    const retryAllErrors = useCallback(() => {
        setItems((prev) => {
            const okPart = prev.filter((it) => it.status !== 'error');
            const errors = prev
                .filter((it) => it.status === 'error')
                .map((it) => ({
                    ...it,
                    status: 'queued' as const,
                    uploadProgress: 0,
                    errorMessage: undefined,
                }));
            return [...okPart, ...errors];
        });
    }, []);

    const stats = useMemo(() => {
        const uploaded = items.filter((i) => i.status === 'uploaded').length;
        const error = items.filter((i) => i.status === 'error').length;
        const uploading = items.filter((i) => i.status === 'uploading').length;
        const queued = items.filter((i) => i.status === 'queued').length;
        const total = items.length;
        const allDoneOk = total > 0 && uploaded === total;

        return {uploaded, error, uploading, queued, total, allDoneOk};
    }, [items]);

    return {
        isDropped,
        items,
        stats,

        onDragOver,
        onDragLeave,
        onDrop,
        removeFile,
        retryFile,
        retryAllErrors,
    };
};
