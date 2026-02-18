// Tipe data sesuai response weekly report (Absensi mingguan)
export interface AbsensiWeeklyRow {
    siswa_id: number;
    siswa_nama: string;
    siswa_alamat: string;
    siswa_status: boolean | number;
    [tanggal: string]: string | number | boolean | undefined; // e.g. "2025-07-01": "H"|"T"|"B" dsb
}

export interface AbsensiWeeklyFilter {
    periode: string; // "YYYY" atau "YYYY-MM"
    mode: "tahun" | "bulan";
    search?: string;
    page?: number;
    limit?: number;
}

export interface AbsensiWeeklyResponse {
    data: AbsensiWeeklyRow[];
    pagination: {
        currentPage: number;
        totalPages: number;
        totalRows: number;
        perPage: number;
        hasMore: boolean;
    };
    sundays: string[]; // List tanggal minggu dalam periode
    summary?: {
        total: number;
        naik: number;
        persentase: number;
    };
}