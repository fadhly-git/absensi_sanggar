export interface SizeChart {
    id?: number;
    category: 'kids' | 'adults';
    size_label: string;
    width_cm: number;
    length_cm: number;
    price_short_sleeve: number;
    price_long_sleeve: number;
}

export interface Product {
    id: number;
    name: string;
    description?: string;
    image_url?: string;
    is_active: boolean;
    po_deadline: string;
    size_charts: SizeChart[];
    created_at: string;
    updated_at: string;
}

export interface ProductFormData {
    name: string;
    description?: string;
    image?: File;
    po_deadline: string;
    size_charts: SizeChart[];
}

export interface PaginatedProductResponse {
    data: Product[];
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
