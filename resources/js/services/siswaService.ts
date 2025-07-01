import { apiClient } from '@/lib/api';
import type {
    Siswa,
    SiswaFormData,
    SiswaFilters,
    PaginatedSiswaResponse
} from '@/types/siswa';

export class SiswaService {
    private static readonly baseUrl = '/api/admin/siswa';

    static async getAll(
        page: number = 1,
        perPage: number = 10,
        filters: Partial<SiswaFilters> = {}
    ): Promise<PaginatedSiswaResponse> {
        try {
            const params = new URLSearchParams();
            params.append('page', page.toString());
            params.append('per_page', perPage.toString());

            // Properly handle filter parameters
            Object.entries(filters).forEach(([key, value]) => {
                if (value !== undefined && value !== null && value !== '' && value !== 'all') {
                    params.append(key, String(value));
                }
            });

            // Gunakan route yang benar: /api/admin/siswa (tanpa tambahan)
            const response = await apiClient.get<PaginatedSiswaResponse>(
                `${SiswaService.baseUrl}?${params.toString()}`
            );
            return response.data;
        } catch (error) {
            console.error('Error fetching siswa:', error);
            throw error;
        }
    }

    static async create(data: SiswaFormData): Promise<Siswa> {
        try {
            console.log('Creating siswa with data:', data);

            const response = await apiClient.post<Siswa>(SiswaService.baseUrl, data);

            console.log('Create response:', response.data);
            return response.data;
        } catch (error) {
            console.error('Error creating siswa:', error);
            throw error;
        }
    }

    static async update(id: number, data: Partial<SiswaFormData>): Promise<Siswa> {
        try {
            console.log('Updating siswa with id:', id, 'data:', data);

            const response = await apiClient.put<Siswa>(`${SiswaService.baseUrl}/${id}`, data);

            console.log('Update response:', response.data);
            return response.data;
        } catch (error) {
            console.error('Error updating siswa:', error);
            throw error;
        }
    }

    static async delete(id: number): Promise<void> {
        try {
            console.log('Deleting siswa with id:', id);

            await apiClient.delete(`${SiswaService.baseUrl}/${id}`);

            console.log('Delete successful for id:', id);
        } catch (error) {
            console.error('Error deleting siswa:', error);
            throw error;
        }
    }

    static async getStats(): Promise<{
        total: number;
        aktif: number;
        tidak_aktif: number;
        terhapus: number;
    }> {
        try {
            // Perbaiki URL endpoint stats
            const [totalResponse, aktifResponse] = await Promise.all([
                apiClient.get<{ count: number }>(`${SiswaService.baseUrl}/count/semua`),
                apiClient.get<{ count: number }>(`${SiswaService.baseUrl}/count/aktif`)
            ]);

            const total = totalResponse.data.count || 0;
            const aktif = aktifResponse.data.count || 0;

            return {
                total,
                aktif,
                tidak_aktif: total - aktif,
                terhapus: 0
            };
        } catch (error) {
            console.error('Error fetching siswa stats:', error);
            return {
                total: 0,
                aktif: 0,
                tidak_aktif: 0,
                terhapus: 0
            };
        }
    }

    static async bulkAction(action: 'activate' | 'deactivate' | 'delete' | 'restore', ids: number[]): Promise<void> {
        try {
            await apiClient.post(`${SiswaService.baseUrl}/bulk-action`, {
                action,
                ids
            });
        } catch (error) {
            console.error('Error performing bulk action:', error);
            throw error;
        }
    }

    // PERBAIKI Export method
    static async exportToExcel(filters: Partial<SiswaFilters> = {}): Promise<void> {
        try {
            const params = new URLSearchParams();

            // Add filters to params
            Object.entries(filters).forEach(([key, value]) => {
                if (value !== undefined && value !== null && value !== '' && value !== 'all') {
                    params.append(key, String(value));
                }
            });

            // URL yang benar untuk export
            const url = `${SiswaService.baseUrl}/export${params.toString() ? '?' + params.toString() : ''}`;

            console.log('Exporting with URL:', url); // Debug log

            // Trigger download
            const response = await apiClient.get(url, {
                responseType: 'blob',
                headers: {
                    'Accept': 'text/csv'
                }
            });

            // Create blob and download
            const blob = new Blob([response.data], {
                type: 'text/csv'
            });

            const downloadUrl = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = downloadUrl;
            link.download = `data-siswa-${new Date().toISOString().slice(0, 10)}.csv`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(downloadUrl);

        } catch (error) {
            console.error('Error exporting siswa data:', error);
            throw error;
        }
    }

    static async downloadTemplate(): Promise<void> {
        try {
            const response = await apiClient.get(`${SiswaService.baseUrl}/template`, {
                responseType: 'blob',
                headers: {
                    'Accept': 'text/csv'
                }
            });

            const blob = new Blob([response.data], {
                type: 'text/csv'
            });

            const downloadUrl = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = downloadUrl;
            link.download = 'template-siswa.csv';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(downloadUrl);

        } catch (error) {
            console.error('Error downloading template:', error);
            throw error;
        }
    }

    static async importFromExcel(file: File): Promise<{
        success: number;
        failed: number;
        errors: string[];
    }> {
        try {
            const formData = new FormData();
            formData.append('file', file);

            const response = await apiClient.post<{
                success: number;
                failed: number;
                errors: string[];
            }>(`${SiswaService.baseUrl}/import`, formData);
            return response.data;
        } catch (error) {
            console.error('Error importing siswa data:', error);
            throw error;
        }
    }
}