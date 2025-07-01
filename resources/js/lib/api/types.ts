/* eslint-disable @typescript-eslint/no-explicit-any */
// Common API response types
export interface ApiResponse<T = any> {
    data: T;
    message?: string;
    status?: number;
}

export interface PaginatedResponse<T> {
    data: T[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
    links?: {
        first: string;
        last: string;
        prev: string | null;
        next: string | null;
    };
}

export interface ApiError {
    message: string;
    errors?: Record<string, string[]>;
    status?: number;
}

export interface ApiValidationError extends ApiError {
    errors: Record<string, string[]>;
}

// Utility types
export type ApiMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export interface RequestConfig {
    timeout?: number;
    headers?: Record<string, string>;
    params?: Record<string, any>;
}