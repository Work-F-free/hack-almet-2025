import {useEffect, useMemo, useRef} from 'react';
import {useMutation} from '@tanstack/react-query';
import {FileServiceAPI} from '@/config/api';
import {useToaster} from '@gravity-ui/uikit';

export type UploadStatus = 'queued' | 'uploading' | 'uploaded' | 'error';

export interface UploadItem {
    id: string;
    file: File;
    uploadProgress: number;
    status: UploadStatus;
    errorMessage?: string;
}

export function useUploadQueue(
    items: UploadItem[],
    setItems: React.Dispatch<React.SetStateAction<UploadItem[]>>,
    concurrency = 3,
    selected: string,
) {
    const api = new FileServiceAPI();
    const {add: addToast} = useToaster();

    const mutation = useMutation({
        mutationFn: async ({file}: {id: string; file: File}) =>
            selected === 'fact'
                ? api.fileUploading(file)
                : selected === 'predict'
                  ? api.predictedFileUploading(file)
                  : selected === 'wellTrack'
                    ? api.wellTracksUploading(file)
                    : selected === 'formationThickness'
                      ? api.formationThicknessUploading(file)
                      : api.effectiveFormationThicknessUploading(file),
    });

    const timersRef = useRef<Map<string, number>>(new Map());
    const removedRef = useRef<Set<string>>(new Set());

    const uploadingCount = useMemo(
        () => items.filter((i) => i.status === 'uploading').length,
        [items],
    );

    const queued = useMemo(() => items.filter((i) => i.status === 'queued'), [items]);

    const clearTimer = (id: string) => {
        const t = timersRef.current.get(id);
        if (t) window.clearInterval(t);
        timersRef.current.delete(id);
    };

    const startFakeProgress = (id: string) => {
        clearTimer(id);
        const timer = window.setInterval(() => {
            setItems((prev) =>
                prev.map((it) => {
                    if (it.id !== id) return it;
                    if (it.status !== 'uploading') return it;
                    const next = Math.min(90, it.uploadProgress + 3 + Math.random() * 7);
                    return {...it, uploadProgress: Math.floor(next)};
                }),
            );
        }, 180);

        timersRef.current.set(id, timer);
    };

    const markRemoved = (id: string) => {
        removedRef.current.add(id);
        clearTimer(id);
    };

    useEffect(() => {
        if (queued.length === 0) return;
        if (uploadingCount >= concurrency) return;

        const slots = concurrency - uploadingCount;
        const toStart = queued.slice(0, slots);

        toStart.forEach((item) => {
            setItems((prev) =>
                prev.map((it) =>
                    it.id === item.id
                        ? {...it, status: 'uploading', uploadProgress: 0, errorMessage: undefined}
                        : it,
                ),
            );

            startFakeProgress(item.id);

            mutation
                .mutateAsync({id: item.id, file: item.file})
                .then(() => {
                    clearTimer(item.id);
                    if (removedRef.current.has(item.id)) return;

                    setItems((prev) =>
                        prev.map((it) =>
                            it.id === item.id
                                ? {
                                      ...it,
                                      status: 'uploaded',
                                      uploadProgress: 100,
                                      errorMessage: undefined,
                                  }
                                : it,
                        ),
                    );
                })
                .catch((err: unknown) => {
                    clearTimer(item.id);
                    if (removedRef.current.has(item.id)) return;

                    const message = err instanceof Error ? err.message : 'Ошибка загрузки';

                    setItems((prev) =>
                        prev.map((it) =>
                            it.id === item.id
                                ? {...it, status: 'error', uploadProgress: 0, errorMessage: message}
                                : it,
                        ),
                    );
                    addToast({
                        title: 'Ошибка загрузки файла',
                        name: 'name',
                        theme: 'danger',
                        content: `Не удалось загрузить файл "${item.file.name}". ${message}`,
                    });
                });
        });
    }, [queued, uploadingCount, concurrency]);

    return {markRemoved};
}
