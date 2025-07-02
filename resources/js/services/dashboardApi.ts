/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from 'axios';

// Definisikan tipe data untuk response dari API
export interface DashboardSummary {
    total_siswa: number;
    siswa_aktif: number;
    saldo: {
        terakhir: number;
        sebelumnya: number;
    };
    siswa_berangkat: {
        minggu_ini: number;
        minggu_lalu: number;
    };
}

/**
 * Mengambil data ringkasan untuk halaman dashboard.
 */
export const fetchDashboardSummary = async (): Promise<DashboardSummary> => {
    try {
        // console.log('Fetching dashboard summary...');
        // console.log('Auth token from cookie:', getCookie('auth_token') ? 'Present' : 'Missing');
        // console.log('Session ID:', getCookie('laravel_session') ? 'Present' : 'Missing');

        const { data } = await axios.get(route('api.admin.dashboard.summary'));

        // console.log('Dashboard summary fetched successfully:', data);
        return data;
    } catch (error: any) {
        console.error('Error fetching dashboard summary:', error);

        // Enhanced error logging
        if (error.response) {
            console.error('Response data:', error.response.data);
            console.error('Response status:', error.response.status);
            console.error('Response headers:', error.response.headers);
            console.error('Request URL:', error.config?.url);
            console.error('Request headers:', error.config?.headers);
        } else if (error.request) {
            console.error('No response received:', error.request);
        } else {
            console.error('Error setting up request:', error.message);
        }

        throw error;
    }
};

// Helper function to get cookie value
function getCookie(name: string): string | null {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) {
        return parts.pop()?.split(';').shift() || null;
    }
    return null;
}