import { AxiosError } from 'axios';
import type { ApiError } from './types';

export class AppError extends Error {
    public status: number;
    public errors?: Record<string, string[]>;

    constructor(message: string, status: number = 500, errors?: Record<string, string[]>) {
        super(message);
        this.name = 'AppError';
        this.status = status;
        this.errors = errors;
    }
}

export class ValidationError extends AppError {
    constructor(message: string, errors: Record<string, string[]>) {
        super(message, 422, errors);
        this.name = 'ValidationError';
    }
}

export class NetworkError extends AppError {
    constructor(message: string = 'Network error occurred') {
        super(message, 0);
        this.name = 'NetworkError';
    }
}

export class UnauthorizedError extends AppError {
    constructor(message: string = 'Unauthorized access') {
        super(message, 401);
        this.name = 'UnauthorizedError';
    }
}

export function handleApiError(error: AxiosError): AppError {
    if (error.response) {
        const { status, data } = error.response;
        const apiError = data as ApiError;
        const message = apiError.message || `HTTP Error ${status}`;

        switch (status) {
            case 401:
                return new UnauthorizedError(message);
            case 422:
                return new ValidationError(message, apiError.errors || {});
            case 403:
                return new AppError(message, 403);
            case 404:
                return new AppError('Resource not found', 404);
            case 429:
                return new AppError('Too many requests', 429);
            case 500:
                return new AppError('Internal server error', 500);
            default:
                return new AppError(message, status, apiError.errors);
        }
    }

    if (error.request) {
        return new NetworkError('No response received from server');
    }

    return new AppError(error.message || 'Unknown error occurred');
}