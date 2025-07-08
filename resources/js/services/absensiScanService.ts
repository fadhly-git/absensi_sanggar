/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from 'axios';

export interface ScanResult {
    success: boolean;
    message: string;
    bonus: boolean;
}

export async function scanAbsensi(payload: any[]): Promise<ScanResult> {
    try {
        const response = await axios.post('/api/admin/absensi/absensi-qr', payload);
        return response.data;
    } catch (error: any) {
        if (error.response && error.response.data && error.response.data.message) {
            throw new Error(error.response.data.message);
        }
        throw new Error(error.message || 'Terjadi kesalahan');
    }
}