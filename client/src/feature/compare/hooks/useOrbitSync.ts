import {CameraState} from '@/feature/three-dimensional/utils/type';
import {useCallback, useRef, useState} from 'react';

const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));

type DragRef = {
    active: boolean;
    x0: number;
    y0: number;
    alpha0: number;
    beta0: number;
};

export const useOrbitSync = () => {
    const [camera, setCamera] = useState<CameraState>({alpha: 35, beta: 25, distance: 250});

    const camRef = useRef(camera);
    camRef.current = camera;

    const drag = useRef<DragRef>({active: false, x0: 0, y0: 0, alpha0: 0, beta0: 0});
    const raf = useRef<number | null>(null);
    const pending = useRef<CameraState | null>(null);

    const commit = useCallback((next: CameraState) => {
        pending.current = next;
        if (raf.current) return;

        raf.current = requestAnimationFrame(() => {
            raf.current = null;
            if (pending.current) {
                setCamera(pending.current);
                pending.current = null;
            }
        });
    }, []);

    const setCameraSynced = useCallback(
        (next: Partial<CameraState> | ((prev: CameraState) => CameraState)) => {
            const cur = camRef.current;
            const resolved = typeof next === 'function' ? next(cur) : {...cur, ...next};
            commit(resolved);
        },
        [commit],
    );

    const onPointerDown = useCallback((e: React.PointerEvent) => {
        (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
        const c = camRef.current;
        drag.current = {active: true, x0: e.clientX, y0: e.clientY, alpha0: c.alpha, beta0: c.beta};
    }, []);

    const onPointerMove = useCallback(
        (e: React.PointerEvent) => {
            if (!drag.current.active) return;

            const dx = e.clientX - drag.current.x0;
            const dy = e.clientY - drag.current.y0;

            const nextBeta = drag.current.beta0 + dx * 0.25;
            const nextAlpha = clamp(drag.current.alpha0 - dy * 0.25, 0.1, 179.9);

            commit({...camRef.current, alpha: nextAlpha, beta: nextBeta});
        },
        [commit],
    );

    const onPointerUp = useCallback(() => {
        drag.current.active = false;
    }, []);

    const onWheel = useCallback(
        (e: React.WheelEvent) => {
            e.preventDefault();
            const k = 1 + e.deltaY * 0.0015;
            commit({...camRef.current, distance: clamp(camRef.current.distance * k, 70, 900)});
        },
        [commit],
    );

    const reset = useCallback(() => {
        commit({alpha: 35, beta: 25, distance: 250});
    }, [commit]);

    return {
        camera,
        setCamera: setCameraSynced,
        reset,
        bind: {
            onPointerDown,
            onPointerMove,
            onPointerUp,
            onPointerCancel: onPointerUp,
            onWheel,
        },
    };
};
