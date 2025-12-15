import {RouterProvider, createBrowserRouter} from 'react-router';
import {Paths} from '@/config/paths';

export const createAppRouter = () =>
    createBrowserRouter([
        {
            path: Paths.dashboard.path,
            lazy: () => import('./routing/dashboard').then((m) => ({Component: m.default})),
        },
    ]);

export const AppRouter = () => {
    const router = createAppRouter();

    return <RouterProvider router={router} />;
};
