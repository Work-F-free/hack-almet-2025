// upload-queue.ts
import {useEffect, useMemo, useRef} from 'react';
import {useMutation} from '@tanstack/react-query';

export type UploadStatus = 'queued' | 'uploading' | 'uploaded' | 'error';

export interface UploadItem {
    id: string;
    file: File;
    uploadProgress: number; // 0..100
    status: UploadStatus;
    errorMessage?: string;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** Заглушка: 2-3 секунды, 25% шанс ошибки */
export async function fakeUpload(file: File): Promise<string> {
    await sleep(2000 + Math.random() * 1000);
    if (Math.random() < 0.25) {
        throw new Error('Не удалось загрузить файл (заглушка)');
    }
    return `ok:${file.name}`;
}

/** Очередь загрузок с ограничением параллельности */
export function useUploadQueue(
    items: UploadItem[],
    setItems: React.Dispatch<React.SetStateAction<UploadItem[]>>,
    concurrency = 3,
) {
    const mutation = useMutation({
        mutationFn: async ({file}: {id: string; file: File}) => fakeUpload(file),
    });

    // Для фейк-прогресса и защиты от обновлений после удаления
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

                    // растём до 90%, дальше ждём завершения
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
            // помечаем как uploading
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
                });
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [queued, uploadingCount, concurrency]);

    return {markRemoved};
}
