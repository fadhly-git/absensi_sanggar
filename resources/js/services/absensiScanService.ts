/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from 'axios';

export interface ScanResult {
    success: boolean;
    message: string;
}

export async function scanAbsensi(qrText: string): Promise<ScanResult> {
    const response = await axios.post('/api/admin/absensi/absensi-qr', [
        { rawValue: qrText }
    ]);
    return response.data;
}