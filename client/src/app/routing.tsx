import {RouterProvider, createBrowserRouter} from 'react-router';
import {Paths} from '@/config/paths';

export const createAppRouter = () =>
    createBrowserRouter([
        {
            path: Paths.home.path,
            lazy: () => import('./routing/home').then((m) => ({Component: m.default})),
        },
        {
            path: Paths.dashboard.path,
            lazy: () =>
                import('./routing/dashboard/dashboard').then((m) => ({Component: m.default})),
        },
        {
            path: Paths.upload.path,
            lazy: () => import('./routing/upload').then((m) => ({Component: m.default})),
        },
    ]);

export const AppRouter = () => {
    const router = createAppRouter();

    return <RouterProvider router={router} />;
};
