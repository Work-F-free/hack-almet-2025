import {FC, PropsWithChildren, Suspense} from 'react';
import {ThemeProvider} from '@gravity-ui/uikit';

export const AppProvider: FC<PropsWithChildren> = ({children}) => {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <ThemeProvider theme="light">{children}</ThemeProvider>
        </Suspense>
    );
};
