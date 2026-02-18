import apiClient from '@/lib/api/axios';
import type { Product, ProductFormData, PaginatedProductResponse } from '@/types/product';

export class ProductService {
    private static baseUrl = '/api/admin/event/products';

    static async getAll(page = 1, perPage = 10, params: { search?: string; is_active?: string } = {}): Promise<PaginatedProductResponse> {
        const response = await apiClient.get(this.baseUrl, {
            params: { page, per_page: perPage, ...params }
        });
        return response.data;
    }

    static async create(data: ProductFormData): Promise<Product> {
        const formData = new FormData();
        formData.append('name', data.name);
        if (data.description) formData.append('description', data.description);
        if (data.image) formData.append('image', data.image);
        formData.append('po_deadline', data.po_deadline);
        // Kirim size_charts sebagai array
        data.size_charts.forEach((chart, i) => {
            formData.append(`size_charts[${i}][category]`, chart.category);
            formData.append(`size_charts[${i}][size_label]`, chart.size_label);
            formData.append(`size_charts[${i}][width_cm]`, String(chart.width_cm));
            formData.append(`size_charts[${i}][length_cm]`, String(chart.length_cm));
            formData.append(`size_charts[${i}][price_short_sleeve]`, String(chart.price_short_sleeve));
            formData.append(`size_charts[${i}][price_long_sleeve]`, String(chart.price_long_sleeve));
        });

        const response = await apiClient.post(this.baseUrl, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    }

    static async update(id: number, data: ProductFormData): Promise<Product> {
        const formData = new FormData();
        formData.append('_method', 'PUT');
        formData.append('name', data.name);
        if (data.description) formData.append('description', data.description);
        if (data.image) formData.append('image', data.image);
        formData.append('po_deadline', data.po_deadline);
        data.size_charts.forEach((chart, i) => {
            formData.append(`size_charts[${i}][category]`, chart.category);
            formData.append(`size_charts[${i}][size_label]`, chart.size_label);
            formData.append(`size_charts[${i}][width_cm]`, String(chart.width_cm));
            formData.append(`size_charts[${i}][length_cm]`, String(chart.length_cm));
            formData.append(`size_charts[${i}][price_short_sleeve]`, String(chart.price_short_sleeve));
            formData.append(`size_charts[${i}][price_long_sleeve]`, String(chart.price_long_sleeve));
        });

        const response = await apiClient.post(`${this.baseUrl}/${id}`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data.data;
    }

    static async delete(id: number): Promise<void> {
        await apiClient.delete(`${this.baseUrl}/${id}`);
    }
}
