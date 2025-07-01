/* eslint-disable @typescript-eslint/no-explicit-any */
import { apiClient } from '@/lib/api';
import type { AbsensiWeeklyFilter, AbsensiWeeklyResponse } from '@/types/absensi';

export class AbsensiService {
    private static readonly baseUrl = '/api/admin/absensi';

    static async getWeeklyReport(params: AbsensiWeeklyFilter): Promise<AbsensiWeeklyResponse> {
        try {
            // Logika Anda untuk membuat flatParams mungkin ada di sini atau tidak, tidak masalah.
            // Yang penting adalah log sebelum apiClient.get

            // Buat objek config untuk dikirim ke Axios
            const axiosConfig = { params }; // atau { params: flatParams } sesuai logika Anda

            // ↓↓↓ TAMBAHKAN LOG INI ↓↓↓

            const response = await apiClient.get(`${AbsensiService.baseUrl}/weekly-report`, axiosConfig);

            return response.data;
        } catch (error) {
            console.error('Error di AbsensiService:', error);
            throw error;
        }
    }

    static async getAttendanceCount(periode: string, mode: 'tahun' | 'bulan'): Promise<{
        masuk: number;
        keluar: number;
    }> {
        try {
            // Perhatikan params langsung flat
            const response = await apiClient.get(`${AbsensiService.baseUrl}/count`, {
                params: { periode, mode }
            });

            if (!response.data.success) {
                throw new Error(response.data.message || 'Failed to fetch count');
            }

            return response.data.data;
        } catch (error) {
            console.error('Error fetching attendance count:', error);
            throw error;
        }
    }

    static async createAbsensi(data: Array<{
        id: number;
        formattedDate: string;
        keterangan?: string;
        bonus?: boolean;
    }>): Promise<any> {
        try {

            console.log('Creating absensi with data:', data);
            const response = await apiClient.post(`${AbsensiService.baseUrl}`, { data });

            if (!response.data.success) {
                throw new Error(response.data.message || 'Failed to create absensi');
            }

            return response.data;
        } catch (error) {
            console.error('Error creating absensi:', error);
            throw error;
        }
    }

    static async getActiveSiswa(tanggal: string): Promise<Array<{ id: number; nama: string; alamat: string; }>> {
        try {
            const response = await apiClient.get(`${AbsensiService.baseUrl}/siswa-aktif`, {
                params: { tanggal }
            });

            if (!response.data.success) {
                throw new Error(response.data.message || 'Failed to fetch siswa');
            }

            return response.data.data;
        } catch (error) {
            console.error('Error fetching active siswa:', error);
            throw error;
        }
    }

    static async exportWeeklyReport(params: Omit<AbsensiWeeklyFilter, 'page' | 'limit'>): Promise<void> {
        try {
            const response = await apiClient.get(`${AbsensiService.baseUrl}/weekly-report/export`, {
                params,
                responseType: 'blob'
            });

            const blob = new Blob([response.data], {
                type: 'text/csv;charset=utf-8'
            });

            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `absensi-${params.mode}-${params.periode}.xlsx`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Error exporting weekly report:', error);
            throw error;
        }
    }

    static async deleteAbsensi(id: number): Promise<void> {
        try {
            const response = await apiClient.delete(`${AbsensiService.baseUrl}/${id}`);

            if (!response.data.success) {
                throw new Error(response.data.message || 'Failed to delete absensi');
            }
        } catch (error) {
            console.error('Error deleting absensi:', error);
            throw error;
        }
    }
}