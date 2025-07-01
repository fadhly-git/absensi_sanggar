import axios from 'axios';
import type { Siswa, SiswaStats } from '@/contexts/siswa-context';

class SiswaApiService {
    private baseRoute = 'api.admin.siswa';

    async getAll(search?: string): Promise<Siswa[]> {
        const params = search ? { search } : {};
        const response = await axios.get(route(`${this.baseRoute}.index`), { params });
        return response.data;
    }

    async getStats(): Promise<SiswaStats> {
        const response = await axios.get(route(`${this.baseRoute}.siswa-aktif`));
        return response.data;
    }

    async create(data: Omit<Siswa, 'id' | 'created_at' | 'updated_at'>): Promise<Siswa> {
        const response = await axios.post(route(`${this.baseRoute}.store`), data);
        return response.data;
    }

    async update(id: number, data: Partial<Siswa>): Promise<Siswa> {
        const response = await axios.put(route(`${this.baseRoute}.update`, { id }), data);
        return response.data;
    }

    async delete(id: number): Promise<void> {
        await axios.delete(route(`${this.baseRoute}.delete`, { id }));
    }

    async getById(id: number): Promise<Siswa> {
        const response = await axios.get(route(`${this.baseRoute}.show`, { id }));
        return response.data;
    }
}

export const siswaApi = new SiswaApiService();