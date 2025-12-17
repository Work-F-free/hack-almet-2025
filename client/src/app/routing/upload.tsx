import {RootLayout} from '@/components/layout';
import {FileUpload} from '@/feature/upload/ui/file-upload';
import {Container} from '@/components/ui/container';

const UploadRoute = () => {
    return (
        <RootLayout>
            <Container size="l">
                <FileUpload />
            </Container>
        </RootLayout>
    );
};

export default UploadRoute;
