// resources/js/types/order.ts

export type OrderStatus =
    | 'pending'
    | 'paid'
    | 'processing'
    | 'completed'
    | 'cancelled';
export type SleeveType = 'short' | 'long';
export type Category = 'kids' | 'adults';

export interface OrderItem {
    id: number;
    product_id: number;
    product_name: string;
    size_label: string;
    category: Category;
    category_label: string;
    sleeve_type: SleeveType;
    sleeve_type_label: string;
    width_cm: number;
    length_cm: number;
    price_at_moment: number;
    price_formatted: string;
    quantity: number;
    subtotal: number;
    subtotal_formatted: string;
}

export interface Order {
    id: number;
    invoice_code: string;
    student_id: number | null;
    student_name: string | null;
    guest_name: string | null;
    guest_phone: string | null;
    buyer_name: string;
    buyer_type: 'student' | 'guest';
    buyer_type_label: string;
    total_amount: number;
    total_amount_formatted: string;
    status: OrderStatus;
    status_label: string;
    status_color: string;
    payment_proof: string | null;
    items: OrderItem[];
    items_count: number;
    total_quantity: number;
    created_at: string;
    created_at_formatted: string;
    updated_at: string;
}

export interface OrderFormItem {
    id?: number;
    product_id: number;
    size_chart_id: number;
    sleeve_type: SleeveType;
    quantity: number;
}

export interface OrderFormData {
    student_id?: number | null;
    guest_name?: string;
    guest_phone?: string;
    items: OrderFormItem[];
}

export interface Student {
    id: number;
    name: string;
    status: string;
}

export interface SizeChart {
    id: number;
    category: Category;
    category_label: string;
    size_label: string;
    width_cm: number;
    length_cm: number;
    price_short_sleeve: number;
    price_long_sleeve: number;
}

export interface ProductWithSizes {
    id: number;
    name: string;
    image_url: string | null;
    size_charts: SizeChart[];
}

export interface OrderStatistics {
    total_orders: number;
    pending_count: number;
    paid_count: number;
    processing_count: number;
    completed_count: number;
    cancelled_count: number;
    total_revenue: number;
}
