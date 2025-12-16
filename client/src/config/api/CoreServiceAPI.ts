import axios from 'axios';

export class CoreServiceAPI {
    private instance = axios.create({
        baseURL: import.meta.env.VITE_CORE_API + '/api/v1/files/convert',
        timeout: 5000,
    });

    async fileUploading(file: File): Promise<string> {
        const formData = new FormData();
        formData.append('file', file);

        const response = await this.instance.post<string>('', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    }

        async predictedFileUploading(file: File): Promise<string> {
        const formData = new FormData();
        formData.append('file', file);

        const response = await this.instance.post<string>('', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    }
}
