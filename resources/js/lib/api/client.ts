/* eslint-disable @typescript-eslint/no-explicit-any */
import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios';

class ApiClient {
    private instance: AxiosInstance;

    constructor() {
        this.instance = axios.create({
            baseURL: window.location.origin,
            withCredentials: true,
            timeout: 30000, // 30 seconds
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'X-Requested-With': 'XMLHttpRequest',
            },
        });

        this.setupInterceptors();
    }

    private setupInterceptors(): void {
        // Request interceptor
        this.instance.interceptors.request.use(
            (config) => {
                // Add auth token
                const token = this.getAuthToken();
                if (token) {
                    config.headers.Authorization = `Bearer ${token}`;
                }

                // Add CSRF token
                const csrfToken = this.getCsrfToken();
                if (csrfToken) {
                    config.headers['X-CSRF-TOKEN'] = csrfToken;
                }

                // Log request in development
                // if (process.env.NODE_ENV === 'development') {
                //     console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`, {
                //         params: config.params,
                //         data: config.data,
                //         headers: this.sanitizeHeaders(config.headers)
                //     });
                // }

                return config;
            },
            (error) => {
                console.error('Request interceptor error:', error);
                return Promise.reject(error);
            }
        );

        // Response interceptor
        this.instance.interceptors.response.use(
            (response: AxiosResponse) => {
                // Log response in development
                if (process.env.NODE_ENV === 'development') {
                    // console.log(`✅ API Response: ${response.config.method?.toUpperCase()} ${response.config.url}`, {
                    //     status: response.status,
                    //     data: response.data
                    // });
                }
                return response;
            },
            (error: AxiosError) => {
                // Log error in development
                if (process.env.NODE_ENV === 'development') {
                    console.error(`❌ API Error: ${error.config?.method?.toUpperCase()} ${error.config?.url}`, {
                        status: error.response?.status,
                        data: error.response?.data,
                        message: error.message
                    });
                }

                return this.handleError(error);
            }
        );
    }

    private handleError(error: AxiosError): Promise<never> {
        if (error.response) {
            const { status, data } = error.response;

            switch (status) {
                case 401:
                    this.handle401Error();
                    break;
                case 403:
                    console.error('Access forbidden');
                    break;
                case 422:
                    // Validation errors - let component handle
                    break;
                case 429:
                    console.error('Too many requests');
                    break;
                case 500:
                    console.error('Internal server error');
                    break;
                default:
                    console.error(`HTTP Error ${status}:`, data);
            }
        } else if (error.request) {
            console.error('Network error - no response received');
        } else {
            console.error('Request setup error:', error.message);
        }

        return Promise.reject(error);
    }

    private handle401Error(): void {
        // Remove invalid token
        this.removeAuthToken();

        // Redirect to login if not already there
        if (!window.location.pathname.includes('/login')) {
            console.warn('Unauthorized access - redirecting to login');
            setTimeout(() => {
                window.location.href = '/login';
            }, 1000);
        }
    }

    private getAuthToken(): string | null {
        return this.getCookie('auth_token');
    }

    private removeAuthToken(): void {
        document.cookie = 'auth_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    }

    private getCsrfToken(): string | null {
        const token = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
        return token || null;
    }

    private getCookie(name: string): string | null {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) {
            return parts.pop()?.split(';').shift() || null;
        }
        return null;
    }

    private sanitizeHeaders(headers: any): any {
        // Remove sensitive headers from logs
        const sanitized = { ...headers };
        if (sanitized.Authorization) {
            sanitized.Authorization = 'Bearer ***';
        }
        if (sanitized['X-CSRF-TOKEN']) {
            sanitized['X-CSRF-TOKEN'] = '***';
        }
        return sanitized;
    }

    // HTTP Methods
    async get<T = any>(url: string, config?: any): Promise<AxiosResponse<T>> {
        // Langsung teruskan object config, jangan dibungkus ulang.
        return this.instance.get(url, config);
    }

    async post<T = any>(url: string, data?: any, config?: any): Promise<AxiosResponse<T>> {
        return this.instance.post(url, data, config);
    }

    async put<T = any>(url: string, data?: any, config?: any): Promise<AxiosResponse<T>> {
        return this.instance.put(url, data, config);
    }

    async patch<T = any>(url: string, data?: any, config?: any): Promise<AxiosResponse<T>> {
        return this.instance.patch(url, data, config);
    }

    async delete<T = any>(url: string, config?: any): Promise<AxiosResponse<T>> {
        return this.instance.delete(url, config);
    }

    // File upload method
    async upload<T = any>(url: string, formData: FormData): Promise<AxiosResponse<T>> {
        return this.instance.post(url, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
    }

    // Download method
    async download(url: string, filename?: string): Promise<void> {
        const response = await this.instance.get(url, {
            responseType: 'blob',
        });

        const blob = new Blob([response.data]);
        const link = document.createElement('a');
        link.href = window.URL.createObjectURL(blob);
        link.download = filename || 'download';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(link.href);
    }
}

// Create singleton instance
export const apiClient = new ApiClient();