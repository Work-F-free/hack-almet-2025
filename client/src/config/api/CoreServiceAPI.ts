import axios from 'axios';

export class CoreServiceAPI {
    private instance = axios.create({
        baseURL: import.meta.env.VITE_CORE_API,
        timeout: 5000,
    });

    /** Загрузка файла */
    async fileUploading(file: File): Promise<string> {
        const response = await this.instance.post<string>(`/`, file);
        return response.data;
    }
}
