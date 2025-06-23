import axios from 'axios';

// Definisikan tipe data di sini untuk digunakan di seluruh aplikasi
export interface Saldo {
    saldo_terakhir: number;
    saldo_sebelumnya: number;
}

export interface DataKeuangan {
    id: number;
    tanggal: string;
    keterangan: string;
    jumlah: number;
}

// Tipe data untuk payload (data yang dikirim)
export interface NewTransactionPayload {
    type: 'masuk' | 'keluar';
    tanggal: string;
    data: Array<{ keterangan: string; amount: string }>;
}

export interface UpdateTransactionPayload {
    type: 'masuk' | 'keluar';
    tanggal: string;
    data: Array<{ amount: string; keterangan: string }>;
}


// --- FUNGSI-FUNGSI API ---

export const fetchSaldo = async (): Promise<Saldo> => {
    const { data } = await axios.get('/api/atmin/keuangan/get-saldo');
    return data;
};

export const fetchTransactions = async (
    type: 'masuk' | 'keluar',
    date: string,
    params: 'year' | 'month'
): Promise<DataKeuangan[]> => {
    if (params === 'month') {
        const [year, month] = date.split('-');
        if (!year || !month || month.length !== 2 || year.length !== 4) return [];
    }
    const { data } = await axios.get(`/api/atmin/keuangan/index`, { params: { type, date, params } });
    return data;
};

export const createTransaction = async (payload: NewTransactionPayload) => {
    const { data } = await axios.post('/api/atmin/keuangan/store', payload);
    return data;
};

// TAMBAHKAN FUNGSI INI
export const updateTransaction = async ({ id, payload }: { id: number; payload: UpdateTransactionPayload }) => {
    const { data } = await axios.put(`/api/atmin/keuangan/update/${id}`, payload);
    return data;
};

export const deleteTransaction = async (id: number) => {
    const { data } = await axios.delete(`/api/atmin/keuangan/destroy/${id}`);
    return data;
};