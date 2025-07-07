/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from 'axios';

export interface ScanResult {
    success: boolean;
    message: string;
}

export async function scanAbsensi(qrText: string): Promise<ScanResult> {
    try {
        const response = await axios.post('/api/admin/absensi/absensi-qr', [
            { rawValue: qrText }
        ]);
        return response.data;
    } catch (error: any) {
        // Ambil pesan dari backend jika ada
        if (error.response && error.response.data && error.response.data.message) {
            throw new Error(error.response.data.message);
        }
        // Fallback ke pesan error axios
        throw new Error(error.message || 'Terjadi kesalahan');
    }
}