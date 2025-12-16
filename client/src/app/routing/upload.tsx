import { useToaster} from '@gravity-ui/uikit';
import {useEffect} from 'react';

import {RootLayout} from '@/components/layout';
import {FileUpload} from '@/feature/upload/ui/file-upload';
import { Container } from '@/components/ui/container';

const UploadRoute = () => {
    const {add} = useToaster();

    useEffect(() => {
        add({
            title: 'test',
            name: 'test',
        });
    }, []);

    return (
        <RootLayout>
        <Container size="l">
                <FileUpload />
            </Container>
        </RootLayout>
    );
};

export default UploadRoute;
