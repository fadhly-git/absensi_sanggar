/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from 'axios';

// Base URL konsisten dengan routes Laravel
const BASE_URL = '/api/admin/keuangan';

// Types
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

// API Functions dengan proper response handling
export const fetchSaldo = async (): Promise<Saldo> => {
    try {
        const { data } = await axios.get(`${BASE_URL}/saldo`);

        // Handle ApiResponse structure
        if (data.success && data.data) {
            return data.data;
        }

        // Handle direct data structure
        return data;
    } catch (error) {
        console.error('fetchSaldo error:', error);
        throw error;
    }
};

export const fetchTransactions = async (
    type: 'masuk' | 'keluar',
    date: string,
    params: 'year' | 'month'
): Promise<DataKeuangan[]> => {
    // Validation for month format
    if (params === 'month') {
        const [year, month] = date.split('-');
        if (!year || !month || month.length !== 2 || year.length !== 4) {
            return [];
        }
    }

    try {
        const { data } = await axios.get(BASE_URL, {
            params: { type, date, params }
        });

        // Handle ApiResponse structure
        if (data.success && Array.isArray(data.data)) {
            return data.data;
        }

        // Handle direct array response
        if (Array.isArray(data)) {
            return data;
        }

        // Fallback if data is not array
        console.warn('fetchTransactions: Expected array but got:', typeof data, data);
        return [];
    } catch (error) {
        console.error('fetchTransactions error:', error);
        return [];
    }
};

export const createTransaction = async (payload: NewTransactionPayload) => {
    try {
        console.log('API: Creating transaction with payload:', payload);

        const { data } = await axios.post(BASE_URL, payload, {
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            }
        });

        console.log('API: Transaction created successfully:', data);
        return data;
    } catch (error: any) {
        console.error('API: Transaction creation failed:', {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status,
            payload
        });

        // Re-throw with better error structure
        throw {
            message: error.message,
            response: error.response,
            status: error.response?.status
        };
    }
};

export const updateTransaction = async ({
    id,
    payload
}: {
    id: number;
    payload: UpdateTransactionPayload
}) => {
    const { data } = await axios.put(`${BASE_URL}/${id}`, payload);
    return data;
};

export const deleteTransaction = async (id: number) => {
    const { data } = await axios.delete(`${BASE_URL}/${id}`);
    return data;
};