/* eslint-disable @typescript-eslint/no-explicit-any */
// import './bootstrap';
import '../css/app.css';
import 'webrtc-adapter';
import { createRoot } from 'react-dom/client';
import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { ThemeProvider } from '@/components/theme-provider';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { ErrorBoundary } from '@/components/ui/error-boundary';
import axios from 'axios';

import '@/lib/api'

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

// Setup axios defaults
axios.defaults.withCredentials = true;
axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';

// Add CSRF token to axios defaults
const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
if (csrfToken) {
    axios.defaults.headers.common['X-CSRF-TOKEN'] = csrfToken;
}

// Add auth token from cookie to axios defaults
const getAuthToken = (): string | null => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; auth_token=`);
    if (parts.length === 2) {
        return parts.pop()?.split(';').shift() || null;
    }
    return null;
};

const authToken = getAuthToken();
if (authToken) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;
}

// Setup axios interceptors
axios.interceptors.request.use(
    (config) => {
        // Always get fresh auth token
        const token = getAuthToken();
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

axios.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            console.error('Unauthorized request to:', error.config?.url);
            // Remove invalid token
            document.cookie = 'auth_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
            // Redirect to login if not already there
            if (!window.location.pathname.includes('/login')) {
                setTimeout(() => {
                    window.location.href = '/login';
                }, 1000);
            }
        }
        return Promise.reject(error);
    }
);

// QueryClient configuration
const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 1000 * 60 * 5, // 5 minutes
            retry: (failureCount, error: any) => {
                // Don't retry on 401 errors
                if (error?.response?.status === 401) {
                    return false;
                }
                return failureCount < 3;
            },
        },
        mutations: {
            retry: false,
        },
    },
});

createInertiaApp({
    title: (title) => `${title} - ${appName}`,
    resolve: (name) => resolvePageComponent(`./pages/${name}.tsx`, import.meta.glob('./pages/**/*.tsx')),
    setup({ el, App, props }) {
        const root = createRoot(el);

        root.render(
            <QueryClientProvider client={queryClient}>
                <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
                    <ErrorBoundary fallback={<div>Something went wrong.</div>}>
                        <App {...props} />
                    </ErrorBoundary>
                </ThemeProvider>
                <ReactQueryDevtools initialIsOpen={false} />
            </QueryClientProvider>,
        );
    },
    progress: {
        color: '#4B5563',
    },
});