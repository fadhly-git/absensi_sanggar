/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from 'axios';

export interface ScanResult {
    success: boolean;
    message: string;
}

export const scanAbsensi = async (id: number): Promise<ScanResult> => {
    const today = new Date().toISOString().slice(0, 10);
    try {
        const { data } = await axios.post('/api/admin/absensi', {
            data: [{ id, formattedDate: today }]
        });
        return {
            success: true,
            message: data.message || 'Absensi berhasil!',
        };
    } catch (error: any) {
        return {
            success: false,
            message: error.response?.data?.message || 'Gagal absen. QR tidak valid atau sudah absen.',
        };
    }
};