/* eslint-disable @typescript-eslint/no-explicit-any */
import axiosInstance from '@/lib/api/axios';
import type {
    Order,
    OrderFormData,
    OrderStatistics,
    OrderStatus,
    ProductWithSizes,
    Student,
} from '@/types/order';

interface PaginatedResponse<T> {
    data: T[];
    meta: {
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
        from?: number | null;
        to?: number | null;
    };
    links: {
        first: string;
        last: string;
        prev: string | null;
        next: string | null;
    };
}

interface OrderFilters {
    status?: OrderStatus;
    search?: string;
    date_from?: string;
    date_to?: string;
    per_page?: number;
}

const BASE_URL = '/atmin/event/api/orders';

export const orderService = {
    async getAll(
        page = 1,
        filters: OrderFilters = {},
    ): Promise<PaginatedResponse<Order>> {
        const params: any = {
            page: page.toString(),
            per_page: (filters.per_page || 10).toString(),
        };
        if (filters.status) params.status = filters.status;
        if (filters.search) params.search = filters.search;
        if (filters.date_from) params.date_from = filters.date_from;
        if (filters.date_to) params.date_to = filters.date_to;

        const response = await axiosInstance.get(BASE_URL, { params });
        return response.data;
    },

    async getById(id: number): Promise<Order> {
        const response = await axiosInstance.get(`${BASE_URL}/${id}`);
        return response.data;
    },

    async create(data: OrderFormData): Promise<Order> {
        const response = await axiosInstance.post(BASE_URL, data);
        return response.data;
    },

    async update(id: number, data: OrderFormData): Promise<Order> {
        const response = await axiosInstance.put(`${BASE_URL}/${id}`, data);
        return response.data;
    },

    async updateStatus(id: number, status: OrderStatus): Promise<Order> {
        if (!id) throw new Error('Order ID is required for status update');
        const response = await axiosInstance.put(`${BASE_URL}/${id}/status`, { status });
        return response.data;
    },

    async delete(id: number): Promise<void> {
        await axiosInstance.delete(`${BASE_URL}/${id}`); // current issues
    },

    async getStatistics(): Promise<OrderStatistics> {
        const response = await axiosInstance.get(`${BASE_URL}/statistics`);
        return response.data;
    },

    async getStudents(query: string): Promise<Student[]> {
        const response = await axiosInstance.get(`${BASE_URL}/students`, {
            params: { search: query },
        });
        return response.data;
    },

    async getProducts(): Promise<ProductWithSizes[]> {
        const response = await axiosInstance.get(`${BASE_URL}/products`);
        return response.data;
    },
};
