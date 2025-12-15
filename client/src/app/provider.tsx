import {FC, PropsWithChildren, Suspense} from 'react';
import {QueryClientProvider} from '@tanstack/react-query';
import {ThemeProvider, ToasterComponent, ToasterProvider} from '@gravity-ui/uikit';
import {queryClient} from '@/config/tanstack';
import {toaster} from '@/config/toast';

export const AppProvider: FC<PropsWithChildren> = ({children}) => {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <QueryClientProvider client={queryClient}>
                <ThemeProvider theme="light">
                    <ToasterProvider toaster={toaster}>
                        {children}
                        <ToasterComponent />
                    </ToasterProvider>
                </ThemeProvider>
            </QueryClientProvider>
        </Suspense>
    );
};
