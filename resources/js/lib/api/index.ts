// Main exports
export { apiClient } from './client';
export type { 
    ApiResponse, 
    PaginatedResponse, 
    ApiError, 
    ApiValidationError,
    ApiMethod,
    RequestConfig 
} from './types';
export { 
    AppError, 
    ValidationError, 
    NetworkError, 
    UnauthorizedError, 
    handleApiError 
} from './errors';

// Re-export for convenience
export { apiClient as default } from './client';