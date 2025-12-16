import { useToaster } from '@gravity-ui/uikit';
import { useEffect } from 'react';

import { RootLayout } from '@/components/layout';
import { FileUpload } from '@/feature/upload/file-upload';

const UploadRoute = () => {
    const { add } = useToaster();

    useEffect(() => {
        add({
            title: 'test',
            name: 'test',
        });
    }, []);

    return (
        <RootLayout>
            <FileUpload />
        </RootLayout>
    );
};

export default UploadRoute;
