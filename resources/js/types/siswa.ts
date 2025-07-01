export interface Siswa {
    id: number;
    nama: string;
    alamat: string;
    status: boolean;
    status_text: string;
    total_absensi?: number;
    absensi_bulan_ini?: number;
    created_at: string;
    updated_at: string;
    deleted_at?: string | null;
}

export interface SiswaFormData {
    nama: string;
    alamat: string;
    status: boolean;
}

export interface SiswaFilters {
    search: string;
    status: 'all' | 'true' | 'false';
    sortBy: 'nama' | 'alamat' | 'created_at' | 'status';
    sortOrder: 'asc' | 'desc';
}

export interface PaginatedSiswaResponse {
    data: Siswa[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
}