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
    const { data } = await axios.get('/api/atmin/dashboard-summary');
    return data;
};